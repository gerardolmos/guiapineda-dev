import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
 * Persistent Feature 006 QA harness.
 *
 * Controlled doubles are limited to external boundaries:
 * - the in-memory verification store/limiter/sender replaces Redis and email delivery;
 * - later groups may inject outbound Function -> Strapi fetch and Strapi Documents Service.
 *
 * Real verification hashing/request/check/token services and real feature parsers/services remain
 * under test. No test uses deployed services, production data, or a temporary script as evidence.
 */

const scriptFile = fileURLToPath(import.meta.url);
const frontendRoot = path.resolve(path.dirname(scriptFile), "../..");
const backendRoot = path.resolve(frontendRoot, "../guiapineda-strapi");
const requireBackend = createRequire(path.join(backendRoot, "package.json"));

const verificationCore = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/_shared/verification-core.mjs",
)));
const verificationRequest = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/_shared/verification-request.mjs",
)));
const verificationCheck = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/_shared/verification-check.mjs",
)));
const verificationToken = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/_shared/verification-token.mjs",
)));
const internalContentReport = requireBackend(path.join(
    backendRoot,
    "src/services/internal-content-report.js",
));
const contentReport = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/content-report.mjs",
)));
const contentReportHttp = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/content-report-http.mjs",
)));
const communicatReport = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/communicat-report.mjs",
)));
const communicatReportHttp = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/communicat-report-http.mjs",
)));
const internalCommunicatReport = requireBackend(path.join(
    backendRoot,
    "src/services/internal-communicat-report.js",
));
const strapiSubmission = await import(pathToFileURL(path.join(
    frontendRoot,
    "netlify/functions/_shared/strapi-submission.mjs",
)));
const contentReportFlow = await import(pathToFileURL(path.join(
    frontendRoot,
    "src/lib/contentReportFlow.ts",
)));
const emailVerificationController = await import(pathToFileURL(path.join(
    frontendRoot,
    "src/lib/emailVerificationController.ts",
)));

const LEGACY_SCOPES = Object.freeze([
    "agenda",
    "veu",
    "comunicat",
    "communicat-report",
    "foto-mes",
    "millora",
    "comercio",
]);
const ALL_SCOPES = Object.freeze([
    ...LEGACY_SCOPES,
    "content-report",
]);
const SECRET = "multisection-reporting-qa-secret";
const EMAIL = "qa-content-report@example.invalid";

const groupStatus = new Map([
    ["scope", "implemented"],
    ["schema", "implemented"],
    ["backend", "implemented"],
    ["function", "implemented"],
    ["client", "implemented"],
    ["integration", "implemented"],
    ["language", "implemented"],
    ["feature003", "implemented"],
]);

function memoryVerificationStore() {
    const challenges = new Map();
    const attempts = new Map();
    const tokens = new Map();

    return {
        async claimResendCooldown() {
            return true;
        },
        async saveChallenge(value) {
            challenges.set(value.challengeId, {
                emailHash: value.emailHash,
                codeHash: value.codeHash,
            });
        },
        async clearChallenge(challengeId) {
            challenges.delete(challengeId);
            attempts.delete(challengeId);
        },
        async getChallenge(challengeId) {
            return challenges.get(challengeId) ?? null;
        },
        async consumeChallenge(challengeId) {
            const value = challenges.get(challengeId);
            challenges.delete(challengeId);
            return value ?? null;
        },
        async incrementAttempts(challengeId) {
            const value = (attempts.get(challengeId) ?? 0) + 1;
            attempts.set(challengeId, value);
            return value;
        },
        async saveVerifiedToken({ tokenHash, emailHash }) {
            tokens.set(tokenHash, emailHash);
        },
        async consumeVerifiedToken(tokenHash) {
            const value = tokens.get(tokenHash);
            tokens.delete(tokenHash);
            return value ?? null;
        },
    };
}

async function issueVerification(scope, email = EMAIL) {
    const store = memoryVerificationStore();
    let sentCode = null;
    const requestService = verificationRequest.createVerificationRequestService({
        store,
        secret: SECRET,
        limiter: {
            limit: async () => ({
                success: true,
                limit: 5,
                remaining: 4,
                reset: 0,
            }),
        },
        sendCode: async ({ email: deliveredEmail, code }) => {
            assert.equal(deliveredEmail, email);
            sentCode = code;
        },
    });
    const requested = await requestService.requestCode({
        email,
        language: "ca",
        scope,
    });
    assert.equal(requested.ok, true);
    assert.match(sentCode, /^\d{6}$/);

    return {
        store,
        sentCode,
        requested,
        checkService: verificationCheck.createVerificationCheckService({
            store,
            secret: SECRET,
        }),
        tokenService: verificationToken.createVerificationTokenService({
            store,
            secret: SECRET,
        }),
    };
}

async function verifyIssued(issued, scope, email = EMAIL) {
    const checked = await issued.checkService.verifyCode({
        challengeId: issued.requested.challengeId,
        email,
        code: issued.sentCode,
        scope,
    });
    assert.equal(checked.ok, true);
    return checked.token;
}

async function testScopeGroup() {
    assert.deepEqual(verificationCore.VERIFICATION_SCOPES, ALL_SCOPES);
    assert.equal(verificationCore.isValidVerificationScope("content-report"), true);
    assert.equal(verificationCore.isValidVerificationScope("unknown-report"), false);

    for (const scope of ALL_SCOPES) {
        const issued = await issueVerification(scope);
        const otherScope = scope === "content-report" ? "communicat-report" : "content-report";
        const wrongScope = await issued.checkService.verifyCode({
            challengeId: issued.requested.challengeId,
            email: EMAIL,
            code: issued.sentCode,
            scope: otherScope,
        });
        assert.equal(wrongScope.ok, false);

        const token = await verifyIssued(issued, scope);
        assert.equal((await issued.tokenService.consume({ token, email: EMAIL, scope: otherScope })).ok, false);
        assert.equal((await issued.tokenService.consume({ token, email: EMAIL, scope })).ok, true);
        assert.equal((await issued.tokenService.consume({ token, email: EMAIL, scope })).ok, false);
    }

    const wrongEmailIssued = await issueVerification("content-report");
    const wrongEmailToken = await verifyIssued(wrongEmailIssued, "content-report");
    assert.equal((await wrongEmailIssued.tokenService.consume({
        token: wrongEmailToken,
        email: "other@example.invalid",
        scope: "content-report",
    })).ok, false);
    assert.equal((await wrongEmailIssued.tokenService.consume({
        token: wrongEmailToken,
        email: EMAIL,
        scope: "content-report",
    })).ok, false);

    const unknownStore = memoryVerificationStore();
    const unknownService = verificationRequest.createVerificationRequestService({
        store: unknownStore,
        secret: SECRET,
        limiter: { limit: async () => ({ success: true }) },
        sendCode: async () => assert.fail("unknown scope must not send email"),
    });
    assert.deepEqual(await unknownService.requestCode({
        email: EMAIL,
        language: "ca",
        scope: "unknown-report",
    }), {
        ok: false,
        reason: "scope:invalid",
    });

    const sourceExpectations = new Map([
        ["src/components/EmailVerificationBlock.astro", "content-report"],
        ["src/lib/emailVerification.ts", "content-report"],
        ["src/lib/emailVerificationController.ts", "content-report"],
        ["netlify/functions/_shared/verification-core.mjs", "content-report"],
    ]);
    for (const [relativePath, expectedValue] of sourceExpectations) {
        const source = await fs.readFile(path.join(frontendRoot, relativePath), "utf8");
        assert.ok(source.includes(`"${expectedValue}"`), `${relativePath} omits ${expectedValue}`);
    }
}

async function testSchemaGroup() {
    const schemaPath = path.join(
        backendRoot,
        "src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json",
    );
    const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
    assert.equal(schema.kind, "collectionType");
    assert.equal(schema.collectionName, "denuncias_contenido");
    assert.equal(schema.options?.draftAndPublish, false);

    const attributes = schema.attributes;
    assert.deepEqual(attributes.tipo_contenido.enum, ["agenda", "veu", "millora", "comercio"]);
    assert.equal(attributes.contenido_document_id.type, "string");
    assert.equal(attributes.contenido_document_id.required, true);
    assert.equal(attributes.contenido_document_id.minLength, 1);
    assert.equal(attributes.contenido_document_id.maxLength, 128);
    assert.equal(attributes.contenido_slug.minLength, 1);
    assert.equal(attributes.contenido_slug.maxLength, 250);
    assert.equal(attributes.explicacion.type, "text");
    assert.equal(attributes.explicacion.required, undefined);
    assert.equal(attributes.explicacion.maxLength, 1000);
    assert.deepEqual(attributes.motivo.enum, [
        "informacion_falsa",
        "spam_fraude",
        "contenido_inapropiado_ilegal",
        "privacidad_datos",
        "otro",
    ]);
    assert.deepEqual(attributes.idioma_solicitud.enum, ["ca", "es", "en"]);
    assert.deepEqual(attributes.estado_denuncia.enum, ["pendiente", "revisada", "cerrada"]);
    assert.equal(attributes.estado_denuncia.default, "pendiente");

    const forbiddenAttributeNames = new Set([
        "email",
        "email_contacto",
        "email_verification_token",
        "token",
        "challenge",
        "code",
        "codigo",
        "ip",
        "user_agent",
        "session",
        "reporter",
        "perfil",
        "historial_ciudadano",
    ]);
    for (const [attributeName, attribute] of Object.entries(attributes)) {
        assert.equal(forbiddenAttributeNames.has(attributeName), false);
        assert.notEqual(attribute.type, "relation");
        assert.notEqual(attribute.type, "media");
        assert.equal(Object.hasOwn(attribute, "relation"), false);
        assert.equal(Object.hasOwn(attribute, "target"), false);
    }
    assert.equal(Object.hasOwn(schema.pluginOptions ?? {}, "i18n"), false);

    const apiDirectory = path.resolve(schemaPath, "../../..");
    const siblingFiles = [];
    async function walk(directory) {
        for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) await walk(absolute);
            else siblingFiles.push(path.relative(apiDirectory, absolute));
        }
    }
    await walk(apiDirectory);
    assert.deepEqual(siblingFiles, ["content-types/denuncia-contenido/schema.json"]);
}

function contentReportPayload(overrides = {}) {
    return JSON.stringify({
        tipo_contenido: "agenda",
        contenido_document_id: "agenda-1",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
        ...overrides,
    });
}

function contentDocumentsDouble({
    failCreate = false,
    commerceOverrides = {},
    categoryOverrides = {},
    subcategoryOverrides = {},
    unavailableDocuments = [],
} = {}) {
    const fixtures = new Map([
        ["api::agenda.agenda", new Map([
            ["agenda-1", { documentId: "agenda-1", slug: "agenda-original" }],
            ["a", { documentId: "a", slug: "minimum-id" }],
            ["a".repeat(128), { documentId: "a".repeat(128), slug: "maximum-id" }],
        ])],
        ["api::veu.veu", new Map([
            ["veu-1", { documentId: "veu-1", slug: "veu-original" }],
        ])],
        ["api::millora.millora", new Map([
            ["millora-1", { documentId: "millora-1", slug: "millora-original" }],
        ])],
        ["api::comercio.comercio", new Map([
            ["comercio-1", {
                documentId: "comercio-1",
                slug: "comercio-original",
                activo: true,
                categoria: { documentId: "categoria-1" },
                subcategoria: { documentId: "subcategoria-1" },
                ...commerceOverrides,
            }],
            ["comercio-sin-subcategoria", {
                documentId: "comercio-sin-subcategoria",
                slug: "comercio-sin-subcategoria",
                activo: true,
                categoria: { documentId: "categoria-1" },
                subcategoria: null,
            }],
        ])],
        [internalContentReport.CATEGORY_UID, new Map([
            ["categoria-1", {
                documentId: "categoria-1",
                activa: true,
                ...categoryOverrides,
            }],
        ])],
        [internalContentReport.SUBCATEGORY_UID, new Map([
            ["subcategoria-1", {
                documentId: "subcategoria-1",
                activa: true,
                categoria: { documentId: "categoria-1" },
                ...subcategoryOverrides,
            }],
        ])],
    ]);
    const calls = [];
    const created = [];

    const strapi = {
        documents(uid) {
            return {
                async findOne(query) {
                    calls.push({ uid, method: "findOne", query });
                    if (query.status !== "published") return null;
                    if (unavailableDocuments.some(
                        ([unavailableUid, unavailableId]) =>
                            unavailableUid === uid &&
                            unavailableId === query.documentId,
                    )) return null;
                    const document = fixtures.get(uid)?.get(query.documentId);
                    return document ? structuredClone(document) : null;
                },
                async create(input) {
                    calls.push({ uid, method: "create", input });
                    if (uid !== internalContentReport.REPORT_UID) {
                        assert.fail(`public create attempted for ${uid}`);
                    }
                    if (failCreate) throw new Error("controlled create failure");
                    created.push(structuredClone(input.data));
                    return { documentId: `report-${created.length}` };
                },
                async update() {
                    calls.push({ uid, method: "update" });
                    assert.fail(`public update attempted for ${uid}`);
                },
                async delete() {
                    calls.push({ uid, method: "delete" });
                    assert.fail(`public delete attempted for ${uid}`);
                },
                async publish() {
                    calls.push({ uid, method: "publish" });
                    assert.fail(`public publish attempted for ${uid}`);
                },
                async unpublish() {
                    calls.push({ uid, method: "unpublish" });
                    assert.fail(`public unpublish attempted for ${uid}`);
                },
            };
        },
    };

    return { strapi, calls, created, fixtures };
}

async function testBackendGroup() {
    assert.deepEqual(internalContentReport.CONTENT_UIDS, {
        agenda: "api::agenda.agenda",
        veu: "api::veu.veu",
        millora: "api::millora.millora",
        comercio: "api::comercio.comercio",
    });
    assert.deepEqual([...internalContentReport.ALLOWED_FIELDS], [
        "tipo_contenido",
        "contenido_document_id",
        "motivo",
        "explicacion",
        "idioma_solicitud",
    ]);

    const invalidPayloads = [
        null,
        "",
        "not-json",
        "[]",
        "null",
        JSON.stringify({}),
        contentReportPayload({ tipo_contenido: "unknown" }),
        contentReportPayload({ contenido_document_id: "" }),
        contentReportPayload({ contenido_document_id: "a".repeat(129) }),
        contentReportPayload({ contenido_document_id: "bad\u0000id" }),
        contentReportPayload({ contenido_document_id: {} }),
        contentReportPayload({ motivo: "unknown" }),
        contentReportPayload({ motivo: 1 }),
        contentReportPayload({ idioma_solicitud: "fr" }),
        contentReportPayload({ idioma_solicitud: ["ca"] }),
        contentReportPayload({ explicacion: {} }),
        contentReportPayload({ explicacion: "x".repeat(1001) }),
        contentReportPayload({ explicacion: "bad\u0000text" }),
        contentReportPayload({ motivo: "otro", explicacion: "   " }),
        contentReportPayload({ email: EMAIL }),
        contentReportPayload({ token: "forbidden" }),
        contentReportPayload({ contenido_slug: "client-slug" }),
        contentReportPayload({ title: "forbidden" }),
        contentReportPayload({ profile: { id: 1 } }),
        "x".repeat(8001),
    ];
    for (const rawPayload of invalidPayloads) {
        const parsed = internalContentReport.parseContentReportPayload(rawPayload);
        assert.equal(parsed.ok, false, `payload should reject: ${String(rawPayload).slice(0, 80)}`);
        assert.equal(parsed.status, 400);
    }
    assert.equal(internalContentReport.parseContentReportPayload(
        contentReportPayload(),
        { upload: { filepath: "/controlled/not-read" } },
    ).ok, false);

    for (const documentId of ["a", "a".repeat(128)]) {
        assert.equal(internalContentReport.parseContentReportPayload(
            contentReportPayload({ contenido_document_id: documentId }),
        ).ok, true);
    }
    for (const motivo of internalContentReport.REASONS) {
        const parsed = internalContentReport.parseContentReportPayload(contentReportPayload({
            motivo,
            ...(motivo === "otro" ? { explicacion: "Context" } : {}),
        }));
        assert.equal(parsed.ok, true);
    }
    for (const idioma_solicitud of internalContentReport.LANGUAGES) {
        assert.equal(internalContentReport.parseContentReportPayload(
            contentReportPayload({ idioma_solicitud }),
        ).ok, true);
    }
    const maxExplanation = internalContentReport.parseContentReportPayload(contentReportPayload({
        motivo: "otro",
        explicacion: `  ${"x".repeat(1000)}  `,
    }));
    assert.equal(maxExplanation.ok, true);
    assert.equal(maxExplanation.data.explicacion.length, 1000);
    const blankOptional = internalContentReport.parseContentReportPayload(contentReportPayload({
        explicacion: "   ",
    }));
    assert.equal(blankOptional.ok, true);
    assert.equal(Object.hasOwn(blankOptional.data, "explicacion"), false);

    const validCases = [
        ["agenda", "agenda-1", "agenda-original"],
        ["veu", "veu-1", "veu-original"],
        ["millora", "millora-1", "millora-original"],
        ["comercio", "comercio-1", "comercio-original"],
        ["comercio", "comercio-sin-subcategoria", "comercio-sin-subcategoria"],
    ];
    for (const [tipo_contenido, contenido_document_id, contenido_slug] of validCases) {
        const boundary = contentDocumentsDouble();
        const result = await internalContentReport.createInternalContentReport({
            strapi: boundary.strapi,
            rawPayload: contentReportPayload({ tipo_contenido, contenido_document_id }),
        });
        assert.deepEqual(result, { ok: true });
        assert.deepEqual(boundary.created, [{
            tipo_contenido,
            contenido_document_id,
            motivo: "informacion_falsa",
            idioma_solicitud: "ca",
            contenido_slug,
            estado_denuncia: "pendiente",
        }]);
        assert.ok(boundary.calls.filter((call) => call.method === "findOne")
            .every((call) => call.query.status === "published"));
    }

    const slugBoundary = contentDocumentsDouble();
    slugBoundary.fixtures.get("api::agenda.agenda").get("agenda-1").slug = "server-changed-slug";
    await internalContentReport.createInternalContentReport({
        strapi: slugBoundary.strapi,
        rawPayload: contentReportPayload(),
    });
    assert.equal(slugBoundary.created[0].contenido_slug, "server-changed-slug");

    for (const [label, options] of [
        ["inactive commerce", { commerceOverrides: { activo: false } }],
        ["missing category", { commerceOverrides: { categoria: null } }],
        ["unpublished category", {
            unavailableDocuments: [[internalContentReport.CATEGORY_UID, "categoria-1"]],
        }],
        ["inactive category", { categoryOverrides: { activa: false } }],
        ["unpublished subcategory", {
            unavailableDocuments: [[internalContentReport.SUBCATEGORY_UID, "subcategoria-1"]],
        }],
        ["inactive subcategory", { subcategoryOverrides: { activa: false } }],
        ["cross-category subcategory", {
            subcategoryOverrides: { categoria: { documentId: "categoria-2" } },
        }],
    ]) {
        const boundary = contentDocumentsDouble(options);
        const result = await internalContentReport.createInternalContentReport({
            strapi: boundary.strapi,
            rawPayload: contentReportPayload({
                tipo_contenido: "comercio",
                contenido_document_id: "comercio-1",
            }),
        });
        assert.deepEqual(result, { ok: false, reason: "report:not-found", status: 404 }, label);
        assert.equal(boundary.created.length, 0);
    }

    for (const [tipo_contenido, contenido_document_id] of [
        ["agenda", "missing"],
        ["agenda", "veu-1"],
        ["veu", "agenda-1"],
        ["millora", "agenda-1"],
    ]) {
        const boundary = contentDocumentsDouble();
        const result = await internalContentReport.createInternalContentReport({
            strapi: boundary.strapi,
            rawPayload: contentReportPayload({ tipo_contenido, contenido_document_id }),
        });
        assert.equal(result.ok, false);
        assert.equal(result.status, 404);
        assert.equal(boundary.created.length, 0);
    }
    const unpublishedBoundary = contentDocumentsDouble({
        unavailableDocuments: [["api::agenda.agenda", "agenda-1"]],
    });
    assert.deepEqual(await internalContentReport.createInternalContentReport({
        strapi: unpublishedBoundary.strapi,
        rawPayload: contentReportPayload(),
    }), { ok: false, reason: "report:not-found", status: 404 });
    assert.equal(unpublishedBoundary.created.length, 0);

    const lifecycleBoundary = contentDocumentsDouble();
    const duplicatePayload = contentReportPayload({
        motivo: "otro",
        explicacion: "Persistent private context",
    });
    assert.deepEqual(await internalContentReport.createInternalContentReport({
        strapi: lifecycleBoundary.strapi,
        rawPayload: duplicatePayload,
    }), { ok: true });
    lifecycleBoundary.fixtures.get("api::agenda.agenda").delete("agenda-1");
    assert.equal(lifecycleBoundary.created[0].contenido_document_id, "agenda-1");
    assert.equal(lifecycleBoundary.created[0].contenido_slug, "agenda-original");
    lifecycleBoundary.fixtures.get("api::agenda.agenda").set("agenda-1", {
        documentId: "agenda-1",
        slug: "agenda-original",
    });
    assert.deepEqual(await internalContentReport.createInternalContentReport({
        strapi: lifecycleBoundary.strapi,
        rawPayload: duplicatePayload,
    }), { ok: true });
    assert.equal(lifecycleBoundary.created.length, 2);
    assert.deepEqual(lifecycleBoundary.created[0], lifecycleBoundary.created[1]);

    const parseFailureBoundary = contentDocumentsDouble();
    assert.equal((await internalContentReport.createInternalContentReport({
        strapi: parseFailureBoundary.strapi,
        rawPayload: contentReportPayload({ email: EMAIL }),
    })).ok, false);
    assert.equal(parseFailureBoundary.calls.length, 0);

    const createFailureBoundary = contentDocumentsDouble({ failCreate: true });
    await assert.rejects(
        internalContentReport.createInternalContentReport({
            strapi: createFailureBoundary.strapi,
            rawPayload: contentReportPayload(),
        }),
        /controlled create failure/,
    );
    assert.equal(createFailureBoundary.created.length, 0);

    const forbiddenPublicMethods = ["update", "delete", "publish", "unpublish"];
    for (const boundary of [slugBoundary, lifecycleBoundary, createFailureBoundary]) {
        assert.equal(boundary.calls.some(
            (call) => forbiddenPublicMethods.includes(call.method),
        ), false);
    }

    const schema = JSON.parse(await fs.readFile(path.join(
        backendRoot,
        "src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json",
    ), "utf8"));
    assert.deepEqual(schema.attributes.estado_denuncia.enum, [
        "pendiente", "revisada", "cerrada",
    ]);
    assert.equal(schema.attributes.estado_denuncia.default, "pendiente");
    assert.equal(await fs.stat(path.join(
        backendRoot,
        "src/api/denuncia-contenido/content-types/denuncia-contenido/schema.json",
    )).then(() => true), true);
    await assert.rejects(
        fs.stat(path.join(
            backendRoot,
            "src/api/denuncia-contenido/content-types/denuncia-contenido/lifecycles.js",
        )),
        { code: "ENOENT" },
    );
}

function contentReportForm(overrides = {}) {
    const values = {
        tipo_contenido: "agenda",
        contenido_document_id: "agenda-1",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
        email_contacto: EMAIL,
        email_verification_token: "t".repeat(43),
        "bot-field": "",
        ...overrides,
    };
    const form = new FormData();
    for (const [key, value] of Object.entries(values)) {
        if (value !== undefined) form.set(key, value);
    }
    return form;
}

function contentReportRequest(form = contentReportForm(), init = {}) {
    return new Request("http://localhost/api/submissions/content-report", {
        method: "POST",
        body: form,
        ...init,
    });
}

async function responseJson(response) {
    return {
        status: response.status,
        body: await response.json(),
    };
}

async function testFunctionGroup() {
    assert.deepEqual([...contentReport.CONTENT_TYPES], [
        "agenda", "veu", "millora", "comercio",
    ]);
    assert.deepEqual([...contentReport.REASONS], [
        "informacion_falsa",
        "spam_fraude",
        "contenido_inapropiado_ilegal",
        "privacidad_datos",
        "otro",
    ]);
    assert.deepEqual(contentReportHttp.config, {
        path: "/api/submissions/content-report",
        rateLimit: {
            windowLimit: 5,
            windowSize: 60,
            aggregateBy: ["ip", "domain"],
        },
    });
    assert.equal(contentReportHttp.MAX_REPORT_REQUEST_BYTES, 16 * 1024);

    const valid = contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({
            email_contacto: "  QA-CONTENT-REPORT@EXAMPLE.INVALID  ",
        }),
    ));
    assert.equal(valid.ok, true);
    assert.equal(valid.verificationEmail, EMAIL);
    assert.deepEqual(valid.payload, {
        tipo_contenido: "agenda",
        contenido_document_id: "agenda-1",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
    });
    for (const tipo_contenido of contentReport.CONTENT_TYPES) {
        assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
            contentReportForm({ tipo_contenido }),
        )).ok, true);
    }
    for (const idioma_solicitud of contentReport.LANGUAGES) {
        assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
            contentReportForm({ idioma_solicitud }),
        )).ok, true);
    }
    for (const motivo of contentReport.REASONS) {
        const parsed = contentReport.buildContentReportPayload(Object.fromEntries(
            contentReportForm({
                motivo,
                ...(motivo === "otro" ? { explicacion: "Context" } : {}),
            }),
        ));
        assert.equal(parsed.ok, true);
    }
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ contenido_document_id: "a" }),
    )).ok, true);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ contenido_document_id: "a".repeat(128) }),
    )).ok, true);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ contenido_document_id: "a".repeat(129) }),
    )).ok, false);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ motivo: "otro", explicacion: "x".repeat(1000) }),
    )).ok, true);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ motivo: "otro", explicacion: "x".repeat(1001) }),
    )).ok, false);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ motivo: "otro", explicacion: "   " }),
    )).ok, false);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ email_contacto: `${"a".repeat(170)}@b.example` }),
    )).ok, true);
    assert.equal(contentReport.buildContentReportPayload(Object.fromEntries(
        contentReportForm({ email_contacto: `${"a".repeat(171)}@b.example` }),
    )).ok, false);
    for (const forbidden of [
        "contenido_slug", "estado_denuncia", "ip", "user_agent", "profile",
    ]) {
        assert.equal(contentReport.buildContentReportPayload({
            ...Object.fromEntries(contentReportForm()),
            [forbidden]: "forbidden",
        }).ok, false);
    }

    let consumeCount = 0;
    let backendCount = 0;
    let forwarded = null;
    const dependencies = {
        consumeVerification: async (input) => {
            consumeCount += 1;
            assert.equal(input.scope, "content-report");
            assert.equal(input.email, EMAIL);
            return { ok: true };
        },
        createSubmission: async (input) => {
            backendCount += 1;
            forwarded = input;
        },
        env: {
            GUIAPINEDA_STRAPI_URL: "https://strapi.example.invalid",
            GUIAPINEDA_INTERNAL_SUBMISSION_SECRET: "s".repeat(32),
        },
    };
    assert.deepEqual(await responseJson(await contentReportHttp.handleContentReport(
        contentReportRequest(),
        dependencies,
    )), {
        status: 201,
        body: { ok: true },
    });
    assert.equal(consumeCount, 1);
    assert.equal(backendCount, 1);
    assert.equal(forwarded.section, "content_report");
    assert.deepEqual(forwarded.payload, {
        tipo_contenido: "agenda",
        contenido_document_id: "agenda-1",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
    });
    for (const forbidden of [
        "email_contacto", "email_verification_token", "bot-field",
        "contenido_slug", "estado_denuncia", "ip", "user_agent",
    ]) {
        assert.equal(Object.hasOwn(forwarded.payload, forbidden), false);
    }

    const deterministicCases = [];
    deterministicCases.push(new Request("http://localhost/api/submissions/content-report", {
        method: "GET",
        headers: { "content-type": "multipart/form-data; boundary=x" },
    }));
    deterministicCases.push(new Request("http://localhost/api/submissions/content-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
    }));
    const duplicate = contentReportForm();
    duplicate.append("motivo", "otro");
    deterministicCases.push(contentReportRequest(duplicate));
    deterministicCases.push(contentReportRequest(contentReportForm({ unexpected: "value" })));
    deterministicCases.push(contentReportRequest(contentReportForm({ "bot-field": "robot" })));
    deterministicCases.push(contentReportRequest(contentReportForm({
        explicacion: "x".repeat(16 * 1024),
    })));
    const withFile = contentReportForm();
    withFile.set("imatge", new Blob(["file"], { type: "text/plain" }), "file.txt");
    deterministicCases.push(contentReportRequest(withFile));
    deterministicCases.push(new Request("http://localhost/api/submissions/content-report", {
        method: "POST",
        headers: {
            "content-type": "multipart/form-data; boundary=missing",
        },
        body: "invalid",
    }));

    for (const request of deterministicCases) {
        const beforeConsume = consumeCount;
        const beforeBackend = backendCount;
        const response = await contentReportHttp.handleContentReport(request, dependencies);
        assert.ok([400, 405, 413, 415].includes(response.status));
        assert.equal(consumeCount, beforeConsume);
        assert.equal(backendCount, beforeBackend);
        assert.equal((await response.json()).ok, false);
    }

    for (const verification of [
        { ok: false, status: 400, reason: "verification:invalid" },
        { ok: false, status: 503, reason: "verification:unavailable" },
    ]) {
        let rejectedBackend = 0;
        const response = await contentReportHttp.handleContentReport(
            contentReportRequest(),
            {
                consumeVerification: async () => verification,
                createSubmission: async () => { rejectedBackend += 1; },
            },
        );
        assert.equal(response.status, verification.status);
        assert.equal(rejectedBackend, 0);
    }

    for (const downstreamStatus of [401, 403, 404, 503]) {
        let consumed = 0;
        const response = await contentReportHttp.handleContentReport(
            contentReportRequest(),
            {
                consumeVerification: async () => {
                    consumed += 1;
                    return { ok: true };
                },
                createSubmission: async () => {
                    throw new Error(`controlled downstream ${downstreamStatus}`);
                },
            },
        );
        assert.equal(consumed, 1);
        assert.deepEqual(await responseJson(response), {
            status: 503,
            body: { ok: false, reason: "submission:unavailable" },
        });
    }

    let transportRequest = null;
    await strapiSubmission.createInternalStrapiSubmission({
        payload: valid.payload,
        rawUrl: "https://strapi.example.invalid/",
        secret: "s".repeat(32),
        section: "content_report",
        label: "Content report QA",
        fetchImpl: async (url, init) => {
            transportRequest = { url, init };
            return new Response(JSON.stringify({ ok: true }), { status: 201 });
        },
    });
    assert.equal(
        transportRequest.url,
        "https://strapi.example.invalid/api/internal/submissions/content_report",
    );
    assert.equal(transportRequest.init.method, "POST");
    assert.equal(transportRequest.init.headers.Authorization, `Bearer ${"s".repeat(32)}`);
    assert.equal(transportRequest.init.body instanceof FormData, true);
    assert.equal(transportRequest.init.body.get("payload"), JSON.stringify(valid.payload));
    assert.equal([...transportRequest.init.body.keys()].length, 1);

    const controllerSource = await fs.readFile(path.join(
        backendRoot,
        "src/api/internal-submission/controllers/internal-submission.js",
    ), "utf8");
    assert.ok(controllerSource.includes("createInternalContentReport"));
    assert.ok(controllerSource.includes("'content_report'"));
    assert.ok(controllerSource.includes("createInternalCommunicatReport"));
    assert.ok(controllerSource.includes("createInternalSubmission"));
}

async function testClientGroup() {
    const validInput = {
        contentType: "agenda",
        documentId: "agenda-1",
        reason: "informacion_falsa",
        explanation: "",
        email: EMAIL,
        emailValid: true,
        emailVerified: true,
    };

    assert.equal(contentReportFlow.validateContentReportInput(validInput), null);
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        documentId: "",
    }), "invalidReference");
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        documentId: "a",
    }), null);
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        documentId: "a".repeat(128),
    }), null);
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        documentId: "a".repeat(129),
    }), "invalidReference");

    for (const contentType of contentReportFlow.CONTENT_REPORT_TYPES) {
        assert.equal(contentReportFlow.validateContentReportInput({
            ...validInput,
            contentType,
        }), null);
    }
    for (const reason of contentReportFlow.CONTENT_REPORT_REASONS) {
        assert.equal(contentReportFlow.validateContentReportInput({
            ...validInput,
            reason,
            ...(reason === "otro" ? { explanation: "Context" } : {}),
        }), null);
    }

    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        reason: "otro",
        explanation: "   ",
    }), "requiredExplanation");
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        explanation: "x".repeat(1000),
    }), null);
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        explanation: "x".repeat(1001),
    }), "tooLong");
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        email: `${"a".repeat(170)}@b.example`,
    }), null);
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        email: `${"a".repeat(171)}@b.example`,
    }), "invalidEmail");
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        emailValid: false,
    }), "invalidEmail");
    assert.equal(contentReportFlow.validateContentReportInput({
        ...validInput,
        emailVerified: false,
    }), "verificationRequired");
    assert.equal(emailVerificationController.isVerificationEmailInputAcceptable(
        `${"a".repeat(170)}@b.example`, true,
    ), true);
    assert.equal(emailVerificationController.isVerificationEmailInputAcceptable(
        `${"a".repeat(171)}@b.example`, true,
    ), false);
    assert.equal(emailVerificationController.isVerificationEmailInputAcceptable(
        "malformed", false,
    ), false);

    assert.equal(contentReportFlow.classifyContentReportResponse(
        201, { ok: true },
    ), "success");
    for (const [status, body] of [
        [200, { ok: true }],
        [201, { ok: false }],
        [201, null],
    ]) {
        assert.equal(contentReportFlow.classifyContentReportResponse(
            status, body,
        ), "unavailable");
    }
    assert.equal(contentReportFlow.classifyContentReportResponse(
        429, { ok: false },
    ), "limited");
    assert.equal(contentReportFlow.classifyContentReportResponse(
        400, { ok: false },
    ), "invalidReference");
    assert.equal(contentReportFlow.classifyContentReportResponse(
        503, { ok: false },
    ), "unavailable");

    const controllerSource = await fs.readFile(path.join(
        frontendRoot,
        "src/lib/contentReportFlow.ts",
    ), "utf8");
    const componentSource = await fs.readFile(path.join(
        frontendRoot,
        "src/components/ContentReportFlow.astro",
    ), "utf8");
    assert.ok(controllerSource.includes('"/api/submissions/content-report"'));
    assert.ok(controllerSource.includes("resetSensitiveInput();"));
    assert.ok(controllerSource.includes('email.value = ""'));
    assert.ok(controllerSource.includes("verification?.reset()"));
    assert.ok(controllerSource.includes("error.focus()"));
    assert.equal(/localStorage|sessionStorage/.test(controllerSource), false);
    assert.ok(componentSource.includes("form class=\"mt-7 max-w-3xl\" data-content-report-form"));
    assert.ok(componentSource.includes("data-content-report-success"));
    assert.ok(componentSource.includes("data-content-report-error"));
    assert.ok(componentSource.includes('maxlength="1000"'));
    assert.ok(componentSource.includes('maxlength="180"'));
    assert.ok(componentSource.includes('scope="content-report"'));
    assert.equal(/name="(?:contenido_slug|title|body|email_verification_code)"/.test(
        componentSource,
    ), false);
}

async function testIntegrationGroup() {
    const expectations = [
        [
            "src/templates/AgendaArticlePage.astro",
            'contentType="agenda"',
            "documentId={event.documentId}",
        ],
        [
            "src/templates/VeuArticlePage.astro",
            'contentType="veu"',
            "documentId={veu.documentId}",
        ],
        [
            "src/templates/MilloraArticlePage.astro",
            'contentType="millora"',
            "documentId={millora.documentId}",
        ],
        [
            "src/templates/CommercePage.astro",
            'contentType="comercio"',
            "documentId={comercio.documentId}",
        ],
    ];

    for (const [relativePath, typeBinding, idBinding] of expectations) {
        const source = await fs.readFile(path.join(frontendRoot, relativePath), "utf8");
        assert.equal(
            source.match(/<ContentReportFlow\b/g)?.length,
            1,
            `${relativePath} must render exactly one shared report flow`,
        );
        assert.ok(source.includes(typeBinding), `${relativePath} has wrong type binding`);
        assert.ok(source.includes(idBinding), `${relativePath} has wrong stable ID binding`);
        assert.equal(
            source.match(/import ContentReportFlow from/g)?.length,
            1,
            `${relativePath} must import the shared component once`,
        );
    }

    const agenda = await fs.readFile(path.join(
        frontendRoot, "src/templates/AgendaArticlePage.astro",
    ), "utf8");
    const veu = await fs.readFile(path.join(
        frontendRoot, "src/templates/VeuArticlePage.astro",
    ), "utf8");
    const millora = await fs.readFile(path.join(
        frontendRoot, "src/templates/MilloraArticlePage.astro",
    ), "utf8");
    const commerce = await fs.readFile(path.join(
        frontendRoot, "src/templates/CommercePage.astro",
    ), "utf8");
    assert.ok(agenda.lastIndexOf("<StrapiBlocks") < agenda.indexOf("<ContentReportFlow"));
    assert.ok(veu.lastIndexOf("<StrapiBlocks") < veu.indexOf("<ContentReportFlow"));
    assert.ok(millora.indexOf("<ContentReportFlow") < millora.indexOf("<!-- Cierre -->"));
    assert.ok(commerce.lastIndexOf("<StrapiBlocks") < commerce.indexOf("<ContentReportFlow"));
    assert.ok(commerce.indexOf("<ContentReportFlow") < commerce.lastIndexOf("</main>"));

    const sourceRoot = path.join(frontendRoot, "src");
    const files = [];
    async function walk(directory) {
        for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) await walk(absolute);
            else if (/\.(?:astro|ts)$/.test(entry.name)) files.push(absolute);
        }
    }
    await walk(sourceRoot);
    const consumers = [];
    for (const absolute of files) {
        const source = await fs.readFile(absolute, "utf8");
        if (source.includes('import ContentReportFlow from')) {
            consumers.push(path.relative(frontendRoot, absolute));
        }
    }
    assert.deepEqual(consumers.sort(), expectations.map(([file]) => file).sort());

    const communicatSource = await fs.readFile(path.join(
        frontendRoot,
        "src/templates/ComunicatArticlePage.astro",
    ), "utf8");
    assert.equal(communicatSource.includes("ContentReportFlow"), false);
}

async function testLanguageGroup() {
    const componentSource = await fs.readFile(path.join(
        frontendRoot,
        "src/components/ContentReportFlow.astro",
    ), "utf8");
    const verificationSource = await fs.readFile(path.join(
        frontendRoot,
        "src/components/EmailVerificationBlock.astro",
    ), "utf8");

    const reportCopyKeys = [
        "action", "title", "intro", "types", "item", "reason", "choose",
        "reasons", "explanation", "optional", "help", "chars", "email",
        "emailHelp", "privacy", "send", "sending", "close", "retry", "back",
        "requiredReason", "requiredExplanation", "tooLong", "invalidEmail",
        "verificationRequired", "invalidReference", "limited", "unavailable",
        "successTitle", "success",
    ];
    for (const key of reportCopyKeys) {
        assert.equal(
            componentSource.match(new RegExp(`\\b${key}:`, "g"))?.length,
            3,
            `CA/ES/EN copy must each define ${key}`,
        );
    }
    for (const key of [
        "title", "intro", "request", "requesting", "codeLabel", "codeHelp",
        "verify", "verifying", "verified", "resend", "invalid", "limited",
        "unavailable",
    ]) {
        assert.equal(
            verificationSource.match(new RegExp(`\\b${key}:`, "g"))?.length,
            3,
            `verification CA/ES/EN copy must each define ${key}`,
        );
    }
    assert.ok(componentSource.includes("const text = copy[lang]"));
    assert.equal(componentSource.includes("copy.ca"), false);

    assert.equal(componentSource.match(/const reasonValues = \[/g)?.length, 1);
    for (const reason of contentReportFlow.CONTENT_REPORT_REASONS) {
        assert.equal(
            componentSource.match(new RegExp(`"${reason}"`, "g"))?.length,
            1,
            `${reason} must be one language-independent value`,
        );
    }
    assert.equal(componentSource.match(/name="idioma_solicitud"/g)?.length, 1);
    assert.ok(componentSource.includes('value={lang}'));

    const routeMatrix = [
        ["ca", "agenda", ["src/pages/agenda/[slug].astro"]],
        ["es", "agenda", ["src/pages/es/agenda/[slug].astro"]],
        ["en", "agenda", ["src/pages/en/agenda/[slug].astro"]],
        ["ca", "veu", ["src/pages/veus/[slug].astro"]],
        ["es", "veu", ["src/pages/es/veus/[slug].astro"]],
        ["en", "veu", ["src/pages/en/veus/[slug].astro"]],
        ["ca", "millora", ["src/pages/millorem-pineda/[slug].astro"]],
        ["es", "millora", ["src/pages/es/millorem-pineda/[slug].astro"]],
        ["en", "millora", ["src/pages/en/millorem-pineda/[slug].astro"]],
        ["ca", "comercio", [
            "src/pages/[categoriaSlug]/[comercioSlug].astro",
            "src/pages/[categoriaSlug]/[subcategoriaSlug]/[comercioSlug].astro",
        ]],
        ["es", "comercio", [
            "src/pages/es/[categoriaSlug]/[comercioSlug].astro",
            "src/pages/es/[categoriaSlug]/[subcategoriaSlug]/[comercioSlug].astro",
        ]],
        ["en", "comercio", [
            "src/pages/en/[categoriaSlug]/[comercioSlug].astro",
            "src/pages/en/[categoriaSlug]/[subcategoriaSlug]/[comercioSlug].astro",
        ]],
    ];
    const templateNames = {
        agenda: "AgendaArticlePage",
        veu: "VeuArticlePage",
        millora: "MilloraArticlePage",
        comercio: "CommercePage",
    };
    for (const [lang, surface, routes] of routeMatrix) {
        for (const route of routes) {
            const source = await fs.readFile(path.join(frontendRoot, route), "utf8");
            assert.ok(source.includes(templateNames[surface]), `${route} misses its shared template`);
            if (surface === "comercio") {
                assert.ok(source.includes(`lang="${lang}"`), `${route} misses active ${lang}`);
            } else {
                assert.ok(source.includes("lang={lang}"), `${route} misses its active language`);
            }
        }
    }
}

async function testFeature003Group() {
    const protectedFingerprints = new Map([
        ["src/templates/ComunicatArticlePage.astro", "af21e6dd209d43616fca26f37287f57892f7e0b3458e7070a3570870456236e8"],
        ["src/components/CommunicatReportFlow.astro", "9e13714bd6a6d6044bb85f0ed7b829753dfb229d44367c569064d93ba37f4b97"],
        ["src/lib/communicatReportFlow.ts", "5be64f4e9a1fa06c6e606fcd58a9e1c418fc3ab725f44ed7dc818ce22df36525"],
        ["netlify/functions/communicat-report.mjs", "6e0c764c6727fdbbf25bc503d10f47419447a2397e7ed1fc675eb932eb1b1588"],
        ["netlify/functions/communicat-report-http.mjs", "71dbae47c86a5be33584595d4f8f73e8d7076eb1e9a4027b21ed5a503b6be39d"],
    ]);
    for (const [relativePath, expected] of protectedFingerprints) {
        const bytes = await fs.readFile(path.join(frontendRoot, relativePath));
        assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
    }
    const backendFingerprints = new Map([
        ["src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json", "4b27ddd200c19e7352c637369b607d290e7951cfb61a808139d8db7028b25aac"],
        ["src/services/internal-communicat-report.js", "1683a1f7375c8628cba6abc69d039187808453a91efb4a4011b7c3264fa105f0"],
    ]);
    for (const [relativePath, expected] of backendFingerprints) {
        const bytes = await fs.readFile(path.join(backendRoot, relativePath));
        assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
    }

    const validBrowserData = {
        comunicat_document_id: "communicat-1",
        comunicat_slug: "communicat-original",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
        email_contacto: EMAIL,
        email_verification_token: "t".repeat(43),
        "bot-field": "",
    };
    const browserPayload = communicatReport.buildCommunicatReportPayload(validBrowserData);
    assert.equal(browserPayload.ok, true);
    assert.deepEqual(browserPayload.payload, {
        comunicat_document_id: "communicat-1",
        comunicat_slug: "communicat-original",
        motivo: "informacion_falsa",
        idioma_solicitud: "ca",
    });
    for (const overrides of [
        { comunicat_document_id: "" },
        { comunicat_document_id: "bad id" },
        { comunicat_slug: "Bad Slug" },
        { comunicat_slug: "" },
    ]) {
        assert.equal(communicatReport.buildCommunicatReportPayload({
            ...validBrowserData,
            ...overrides,
        }).ok, false);
    }

    const form = new FormData();
    for (const [key, value] of Object.entries(validBrowserData)) form.set(key, value);
    let consumeCount = 0;
    let transportInput = null;
    const httpResponse = await communicatReportHttp.handleCommunicatReport(
        new Request("http://localhost/api/submissions/communicat-report", {
            method: "POST",
            body: form,
        }),
        {
            consumeVerification: async ({ scope }) => {
                consumeCount += 1;
                assert.equal(scope, "communicat-report");
                return { ok: true };
            },
            createSubmission: async (input) => {
                transportInput = input;
            },
        },
    );
    assert.deepEqual(await responseJson(httpResponse), {
        status: 201,
        body: { ok: true },
    });
    assert.equal(consumeCount, 1);
    assert.equal(transportInput.section, "communicat_report");
    assert.deepEqual(transportInput.payload, browserPayload.payload);

    const issued = await issueVerification("communicat-report");
    const token = await verifyIssued(issued, "communicat-report");
    assert.equal((await issued.tokenService.consume({
        token,
        email: EMAIL,
        scope: "content-report",
    })).ok, false);
    assert.equal((await issued.tokenService.consume({
        token,
        email: EMAIL,
        scope: "communicat-report",
    })).ok, true);
    assert.equal((await issued.tokenService.consume({
        token,
        email: EMAIL,
        scope: "communicat-report",
    })).ok, false);

    const created = [];
    const calls = [];
    const strapi = {
        documents(uid) {
            return {
                async findOne(query) {
                    calls.push({ uid, method: "findOne", query });
                    return {
                        documentId: "communicat-1",
                        slug: "communicat-original",
                    };
                },
                async create(input) {
                    calls.push({ uid, method: "create", input });
                    created.push(structuredClone(input.data));
                    return { documentId: `report-${created.length}` };
                },
            };
        },
    };
    const rawPayload = JSON.stringify(browserPayload.payload);
    assert.deepEqual(await internalCommunicatReport.createInternalCommunicatReport({
        strapi, rawPayload,
    }), { ok: true });
    assert.deepEqual(await internalCommunicatReport.createInternalCommunicatReport({
        strapi, rawPayload,
    }), { ok: true });
    assert.equal(created.length, 2);
    assert.deepEqual(created[0], {
        ...browserPayload.payload,
        estado_denuncia: "pendiente",
    });
    assert.equal(Object.hasOwn(created[0], "email_contacto"), false);
    assert.equal(calls.filter((call) => call.method === "findOne").length, 2);
    const mismatch = await internalCommunicatReport.createInternalCommunicatReport({
        strapi,
        rawPayload: JSON.stringify({
            ...browserPayload.payload,
            comunicat_slug: "wrong-slug",
        }),
    });
    assert.equal(mismatch.ok, false);
    assert.equal(created.length, 2);

    const schema = JSON.parse(await fs.readFile(path.join(
        backendRoot,
        "src/api/denuncia-comunicat/content-types/denuncia-comunicat/schema.json",
    ), "utf8"));
    assert.deepEqual(schema.attributes.estado_denuncia.enum, [
        "pendiente", "revisada", "cerrada",
    ]);
    assert.equal(schema.attributes.estado_denuncia.default, "pendiente");

    const communicatComponent = await fs.readFile(path.join(
        frontendRoot, "src/components/CommunicatReportFlow.astro",
    ), "utf8");
    for (const key of ["action", "reason", "send", "unavailable", "success"]) {
        assert.equal(communicatComponent.match(new RegExp(`\\b${key}:`, "g"))?.length, 3);
    }

    const sqliteBytes = await fs.readFile(path.join(backendRoot, ".tmp/data.db"));
    assert.equal(
        createHash("sha256").update(sqliteBytes).digest("hex"),
        "ff39926c4f13e45364859035c5debf0021b573f6c11a573a34c91460183e4843",
    );
    const generatedTypes = await fs.readFile(path.join(
        backendRoot, "types/generated/contentTypes.d.ts",
    ), "utf8");
    assert.ok(generatedTypes.includes("ApiDenunciaComunicatDenunciaComunicat"));
    assert.ok(generatedTypes.includes("ApiDenunciaContenidoDenunciaContenido"));
}

const groupRunners = new Map([
    ["scope", testScopeGroup],
    ["schema", testSchemaGroup],
    ["backend", testBackendGroup],
    ["function", testFunctionGroup],
    ["client", testClientGroup],
    ["integration", testIntegrationGroup],
    ["language", testLanguageGroup],
    ["feature003", testFeature003Group],
]);

function requestedGroups() {
    const groupIndex = process.argv.indexOf("--group");
    if (groupIndex === -1) return [...groupStatus.keys()];
    const value = process.argv[groupIndex + 1];
    assert.ok(groupStatus.has(value), `unknown QA group: ${value ?? "<missing>"}`);
    return [value];
}

let failures = 0;
for (const group of requestedGroups()) {
    const status = groupStatus.get(group);
    if (status !== "implemented") {
        console.error(`NOT IMPLEMENTED: ${group}`);
        failures += 1;
        continue;
    }

    try {
        await groupRunners.get(group)();
        console.log(`PASS: ${group}`);
    } catch (error) {
        failures += 1;
        console.error(`FAIL: ${group}`);
        console.error(error);
    }
}

if (failures > 0) {
    process.exitCode = 1;
} else {
    console.log("PASS: requested Feature 006 QA groups");
}

void requireBackend;
