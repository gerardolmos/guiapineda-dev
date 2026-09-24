import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
 * Controlled doubles and their boundaries:
 * - in-memory verification store/limiter/email sender: Redis/rate-limit/email delivery only;
 * - injected fetch: outbound Function -> Strapi HTTP only;
 * - Strapi Documents Service/catalogue: database/CMS boundary only; real parsers, guard,
 *   lifecycle and rollback orchestration remain under test;
 * - injected second-image/DB failures: failure boundary only; real quarantine and cleanup run.
 * Sharp, client validators, Function validators/handler, verification hashing/services,
 * write guard, moderation lifecycle, image storage and orphan cleanup are never mocked.
 */

const scriptFile = fileURLToPath(import.meta.url);
const frontendRoot = path.resolve(path.dirname(scriptFile), "../..");
const backendRoot = path.resolve(frontendRoot, "../guiapineda-strapi");
const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "guiapineda-commerce-qa-"));
process.env.GUIAPINEDA_PRIVATE_UPLOAD_DIR = path.join(fixtureRoot, "quarantine");

const requireBackend = createRequire(path.join(backendRoot, "package.json"));
const sharp = requireBackend("sharp");

const client = await import(pathToFileURL(path.join(frontendRoot, "src/lib/commerceSubmission.ts")));
const commerceFunction = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/comercio-submission.mjs")));
const commerceHttp = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/comercio-submission-http.mjs")));
const verificationCore = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/_shared/verification-core.mjs")));
const verificationRequest = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/_shared/verification-request.mjs")));
const verificationCheck = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/_shared/verification-check.mjs")));
const verificationToken = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/_shared/verification-token.mjs")));
const internalTransport = await import(pathToFileURL(path.join(frontendRoot, "netlify/functions/_shared/strapi-submission.mjs")));

const backendRequest = requireBackend(path.join(backendRoot, "src/services/internal-submission-request.js"));
const guard = requireBackend(path.join(backendRoot, "src/services/commerce-submission-write-guard.js"));
const moderation = requireBackend(path.join(backendRoot, "src/services/submission-moderation-lifecycle.js"));
const privateImages = requireBackend(path.join(backendRoot, "src/services/private-submission-image.js"));
const cleanup = requireBackend(path.join(backendRoot, "src/services/private-submission-image-cleanup.js"));
const moderationImages = requireBackend(path.join(backendRoot, "src/services/private-moderation-image.js"));

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const NETWORKS = ["instagram", "facebook", "tiktok", "youtube", "linkedin", "x"];
const SCOPES = ["agenda", "veu", "comunicat", "communicat-report", "foto-mes", "millora", "comercio"];
const SECRET = "commerce-qa-secret";
const EMAIL = "qa-commerce@example.invalid";

function schedule() {
    return DAYS.map((dia, index) => index === 0
        ? { dia, cerrado: false, apertura_1: "09:00", cierre_1: "13:00", apertura_2: "16:00", cierre_2: "20:00" }
        : { dia, cerrado: true });
}

function clone(value) {
    return structuredClone(value);
}

function browserFile(buffer, name = "principal.png", type = "image/png") {
    return new File([buffer], name, { type });
}

function clientValues(language, image, overrides = {}) {
    return {
        idioma_solicitud: language,
        nombre: " Comerç QA ",
        categoria_document_id: "cat_qa",
        subcategoria_document_id: "sub_qa",
        descripcion_corta: "Descripció curta",
        descripcion_completa: "Descripció completa",
        direccion: "Carrer Major 1",
        telefono: "600000000",
        whatsapp: "",
        email: "",
        web: " https://example.com/comerc ",
        atencion_presencial: true,
        atencion_domicilio: false,
        atencion_online: true,
        recogida_local: false,
        reparto: false,
        horario_semanal: schedule(),
        servicios: [{ nombre: "Servei", descripcion: "Descripció" }],
        redes_sociales: [{ plataforma: "instagram", url: " https://example.com/ig " }],
        informacion_adicional: "",
        nombre_contacto: "Persona QA",
        email_contacto: EMAIL,
        telefono_contacto: "",
        aceptacion_privacidad: true,
        email_verification_token: "t".repeat(64),
        imagen_principal: image,
        logo: undefined,
        galeria: [],
        ...overrides,
    };
}

function textDataFromForm(form) {
    const data = {};
    const images = { imagen_principal: null, logo: null, galeria: [] };
    for (const [key, value] of form.entries()) {
        if (value instanceof File) {
            if (key === "galeria") images.galeria.push(value);
            else images[key] = value;
        } else {
            data[key] = value;
        }
    }
    return { data, images };
}

function response(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function makeImages() {
    const jpeg = await sharp({ create: { width: 20, height: 12, channels: 3, background: "#225588" } })
        .jpeg({ quality: 80 }).withMetadata({ orientation: 6 }).toBuffer();
    const png = await sharp({ create: { width: 16, height: 12, channels: 4, background: "#44aa66" } })
        .png().withMetadata({ orientation: 6 }).toBuffer();
    const webp = await sharp({ create: { width: 14, height: 10, channels: 3, background: "#aa6633" } })
        .webp().toBuffer();
    const large = await sharp({ create: { width: 4000, height: 2000, channels: 3, background: "#123456" } })
        .png().toBuffer();
    const tooManyPixels = await sharp({ create: { width: 7000, height: 6000, channels: 3, background: "#ffffff" } })
        .jpeg({ quality: 20 }).toBuffer();
    return { jpeg, png, webp, large, tooManyPixels };
}

function paddedImage(buffer, size) {
    assert.ok(buffer.length <= size);
    return Buffer.concat([buffer, Buffer.alloc(size - buffer.length)]);
}

function fileDescriptor(filepath, mimetype) {
    return { filepath, mimetype, originalFilename: "visitor-name-ignored.bin" };
}

async function writeFixture(name, buffer) {
    const filepath = path.join(fixtureRoot, name);
    await fs.writeFile(filepath, buffer);
    return filepath;
}

function assertIssue(values, field) {
    assert.equal(client.findCommerceFieldIssue(values)?.field, field);
}

async function testClientAndContracts(images) {
    for (const language of ["ca", "es", "en"]) {
        const values = clientValues(language, browserFile(images.png));
        const form = client.buildCommerceFormData(values);
        assert.equal(form.get("idioma_solicitud"), language);
        assert.equal(form.get("nombre"), " Comerç QA ");
        assert.equal(form.get("web"), " https://example.com/comerc ");
        assert.equal(form.get("aceptacion_privacidad"), "true");
        assert.ok(form.get("imagen_principal") instanceof File);
        const parsed = commerceFunction.buildCommercePayload(...Object.values(textDataFromForm(form)));
        assert.equal(parsed.ok, true);
        assert.equal(parsed.payload.idioma_solicitud, language);
        assert.equal(parsed.payload.nombre, "Comerç QA");
        assert.equal(parsed.payload.web, "https://example.com/comerc");
    }

    const noSubcategory = client.buildCommerceFormData(clientValues("ca", browserFile(images.png), {
        subcategoria_document_id: undefined,
        web: "",
        telefono: "600000000",
        email: "",
        whatsapp: "",
        informacion_adicional: "",
        telefono_contacto: "",
    }));
    assert.equal(noSubcategory.has("subcategoria_document_id"), false);
    assert.equal(noSubcategory.has("web"), false);

    assert.equal(client.isValidCommerceHttpUrl(""), true);
    assert.equal(client.isValidCommerceHttpUrl(" http://example.com/a "), true);
    assert.equal(client.isValidCommerceHttpUrl("https://example.com/a"), true);
    assert.equal(client.isValidCommerceHttpUrl("ftp://example.com"), false);
    assert.equal(client.isValidCommerceHttpUrl("not a url"), false);

    for (const platform of NETWORKS) {
        assert.equal(client.findCommerceNetworkIssue([{ plataforma: platform, url: "https://example.com/" + platform }]), null);
    }
    assert.equal(client.findCommerceNetworkIssue([]), null);
    assert.equal(client.findCommerceNetworkIssue([{ plataforma: "instagram", url: "" }])?.index, 0);
    assertIssue({ web: "", horario_semanal: schedule(), redes_sociales: [{ plataforma: "facebook", url: "bad" }] }, "redes_sociales");
    assertIssue({ web: "javascript:alert(1)", horario_semanal: schedule(), redes_sociales: [] }, "web");
    assert.ok(client.findCommerceNetworkIssue([
        { plataforma: "x", url: "https://example.com/a" },
        { plataforma: "x", url: "https://example.com/b" },
    ]));
    assert.ok(client.findCommerceNetworkIssue([{ plataforma: "otra", url: "https://example.com" }]));
    assert.ok(client.findCommerceNetworkIssue([{ plataforma: "instagram", url: 42 }]));

    assert.equal(client.findCommerceScheduleIssue(schedule()), null);
    const invalidSchedules = [];
    invalidSchedules.push(null);
    invalidSchedules.push(schedule().slice(0, 6));
    const incomplete = schedule(); delete incomplete[0].cierre_1; invalidSchedules.push(incomplete);
    const backwards = schedule(); backwards[0].apertura_1 = "13:00"; backwards[0].cierre_1 = "09:00"; invalidSchedules.push(backwards);
    const overlap = schedule(); overlap[0].apertura_2 = "12:00"; invalidSchedules.push(overlap);
    const closedWithHours = schedule(); closedWithHours[0] = { dia: "lunes", cerrado: true, apertura_1: "09:00" }; invalidSchedules.push(closedWithHours);
    const badType = schedule(); badType[0].cerrado = "false"; invalidSchedules.push(badType);
    const partialSecond = schedule(); delete partialSecond[0].cierre_2; invalidSchedules.push(partialSecond);
    for (const value of invalidSchedules) {
        assert.ok(client.findCommerceScheduleIssue(value));
    }

    assert.throws(() => client.validateCommerceImages({
        imagen_principal: browserFile(Buffer.alloc(4_000_001)),
        galeria: [],
    }));
    client.validateCommerceImages({
        imagen_principal: browserFile(Buffer.alloc(2_000_000)),
        logo: browserFile(Buffer.alloc(1_000_000), "logo.webp", "image/webp"),
        galeria: [browserFile(Buffer.alloc(1_000_000), "g.jpg", "image/jpeg")],
    });
    assert.throws(() => client.validateCommerceImages({
        imagen_principal: browserFile(Buffer.alloc(2_000_001)),
        logo: browserFile(Buffer.alloc(2_000_000), "logo.png"),
        galeria: [],
    }));
    assert.throws(() => client.validateCommerceImages({
        imagen_principal: browserFile(images.png),
        galeria: new Array(5).fill(browserFile(images.png)),
    }));

    const requiredText = [
        "nombre", "categoria_document_id", "descripcion_corta", "descripcion_completa",
        "direccion", "nombre_contacto", "email_contacto",
    ];
    for (const field of requiredText) {
        const candidate = validFunctionData(images, { [field]: "" });
        assert.equal(commerceFunction.buildCommercePayload(candidate.data, candidate.images).ok, false);
    }
}

function validFunctionData(images, overrides = {}) {
    const form = client.buildCommerceFormData(clientValues("ca", browserFile(images.png)));
    const result = textDataFromForm(form);
    Object.assign(result.data, overrides);
    return result;
}

async function testFunctionAndM1(images) {
    const valid = validFunctionData(images);
    const validResult = commerceFunction.buildCommercePayload(valid.data, valid.images);
    assert.equal(validResult.ok, true);
    assert.equal(Object.hasOwn(validResult.payload, "email_verification_token"), false);
    assert.equal(Object.hasOwn(validResult.payload, "bot-field"), false);
    assert.equal(Object.hasOwn(validResult.payload, "estado_solicitud"), false);

    const scheduleWithUnexpectedKey = schedule();
    scheduleWithUnexpectedKey[0].unexpected = true;

    const invalidCases = [
        { redes_sociales: JSON.stringify([{ plataforma: "instagram", url: "" }]) },
        { redes_sociales: JSON.stringify([{ plataforma: "x", url: "https://a.example" }, { plataforma: "x", url: "https://b.example" }]) },
        { redes_sociales: JSON.stringify([{ plataforma: "otra", url: "https://example.com" }]) },
        { web: "ftp://example.com" },
        { servicios: JSON.stringify([]) },
        { servicios: JSON.stringify(new Array(7).fill({ nombre: "Servei" })) },
        { servicios: JSON.stringify([{ nombre: "Servei", destacado: true }]) },
        { horario_semanal: JSON.stringify(null) },
        { horario_semanal: JSON.stringify([{ dia: "lunes", cerrado: false }]) },
        { horario_semanal: JSON.stringify(scheduleWithUnexpectedKey) },
        { descripcion_corta: null },
        { aceptacion_privacidad: "false" },
        { atencion_presencial: "false", atencion_online: "false" },
    ];
    for (const overrides of invalidCases) {
        const candidate = validFunctionData(images, overrides);
        assert.equal(commerceFunction.buildCommercePayload(candidate.data, candidate.images).ok, false);
    }

    const sixServices = validFunctionData(images, {
        servicios: JSON.stringify(new Array(6).fill(null).map((_, index) => ({ nombre: "Servei " + index }))),
    });
    assert.equal(commerceFunction.buildCommercePayload(sixServices.data, sixServices.images).ok, true);

    const scalarBoundaries = {
        nombre: [100, "n"],
        categoria_document_id: [128, "c"],
        subcategoria_document_id: [128, "s"],
        descripcion_corta: [160, "c"],
        descripcion_completa: [900, "d"],
        direccion: [180, "a"],
        telefono: [30, "6"],
        whatsapp: [30, "7"],
        informacion_adicional: [800, "i"],
        nombre_contacto: [120, "p"],
        telefono_contacto: [30, "8"],
    };
    for (const [field, [limit, character]] of Object.entries(scalarBoundaries)) {
        const atLimit = validFunctionData(images, { [field]: character.repeat(limit) });
        assert.equal(commerceFunction.buildCommercePayload(atLimit.data, atLimit.images).ok, true, field + " limit");
        const overLimit = validFunctionData(images, { [field]: character.repeat(limit + 1) });
        assert.equal(commerceFunction.buildCommercePayload(overLimit.data, overLimit.images).ok, false, field + " over limit");
    }
    for (const field of ["email", "email_contacto"]) {
        const exactEmail = "a".repeat(175) + "@e.co";
        assert.equal(exactEmail.length, 180);
        const atLimit = validFunctionData(images, { [field]: exactEmail });
        assert.equal(commerceFunction.buildCommercePayload(atLimit.data, atLimit.images).ok, true);
        const overLimit = validFunctionData(images, { [field]: "a" + exactEmail });
        assert.equal(commerceFunction.buildCommercePayload(overLimit.data, overLimit.images).ok, false);
    }
    const exactWeb = "https://e.co/".padEnd(250, "a");
    assert.equal(commerceFunction.buildCommercePayload(validFunctionData(images, { web: exactWeb }).data, valid.images).ok, true);
    assert.equal(commerceFunction.buildCommercePayload(validFunctionData(images, { web: exactWeb + "a" }).data, valid.images).ok, false);

    const exact = validFunctionData(images);
    exact.images.imagen_principal = browserFile(Buffer.alloc(2_000_000));
    exact.images.logo = browserFile(Buffer.alloc(1_000_000), "logo.webp", "image/webp");
    exact.images.galeria = [browserFile(Buffer.alloc(1_000_000), "gallery.jpg", "image/jpeg")];
    assert.equal(commerceFunction.buildCommercePayload(exact.data, exact.images).ok, true);
    exact.images.galeria.push(browserFile(Buffer.from([1]), "over.jpg", "image/jpeg"));
    assert.equal(commerceFunction.buildCommercePayload(exact.data, exact.images).ok, false);

    const unknownText = validFunctionData(images);
    unknownText.data.ip = "127.0.0.1";
    assert.equal(commerceFunction.buildCommercePayload(unknownText.data, unknownText.images).ok, false);
    const unknownImage = validFunctionData(images);
    unknownImage.images.unknown = browserFile(images.png);
    assert.equal(commerceFunction.buildCommercePayload(unknownImage.data, unknownImage.images).ok, true);

    function requestFrom(candidate) {
        const body = new FormData();
        for (const [key, value] of Object.entries(candidate.data)) {
            if (value !== null && value !== undefined) body.append(key, value);
        }
        body.append("imagen_principal", candidate.images.imagen_principal);
        if (candidate.images.logo) body.append("logo", candidate.images.logo);
        for (const image of candidate.images.galeria) body.append("galeria", image);
        return new Request("http://local/api/submissions/comercio", { method: "POST", body });
    }

    let consumes = 0;
    let backendCalls = 0;
    const consumedTokens = new Set();
    const deps = {
        consumeVerification: async ({ data, scope }) => {
            consumes += 1;
            assert.equal(scope, "comercio");
            const token = data.email_verification_token;
            if (consumedTokens.has(token)) return { ok: false, status: 400, reason: "verification:invalid" };
            consumedTokens.add(token);
            return { ok: true };
        },
        createSubmission: async () => { backendCalls += 1; },
        env: {},
    };
    const invalid = validFunctionData(images, {
        redes_sociales: JSON.stringify([{ plataforma: "instagram", url: "" }]),
    });
    const invalidResponse = await commerceHttp.handleCommerceSubmission(requestFrom(invalid), deps);
    assert.equal(invalidResponse.status, 400);
    assert.equal(consumes, 0);
    assert.equal(backendCalls, 0);

    const duplicateBody = await requestFrom(validFunctionData(images)).formData();
    duplicateBody.append("nombre", "Duplicado");
    assert.equal((await commerceHttp.handleCommerceSubmission(new Request(
        "http://local/api/submissions/comercio", { method: "POST", body: duplicateBody },
    ), deps)).status, 400);
    const unknownFileBody = await requestFrom(validFunctionData(images)).formData();
    unknownFileBody.append("unknown_file", browserFile(images.png));
    assert.equal((await commerceHttp.handleCommerceSubmission(new Request(
        "http://local/api/submissions/comercio", { method: "POST", body: unknownFileBody },
    ), deps)).status, 400);
    assert.equal(consumes, 0);
    assert.equal(backendCalls, 0);

    const corrected = validFunctionData(images);
    const success = await commerceHttp.handleCommerceSubmission(requestFrom(corrected), deps);
    assert.equal(success.status, 201);
    assert.equal(consumes, 1);
    assert.equal(backendCalls, 1);

    const unavailableDeps = {
        consumeVerification: async () => ({ ok: false, status: 503, reason: "verification:unavailable" }),
        createSubmission: async () => { throw new Error("backend must not be called"); },
        env: {},
    };
    const unavailable = await commerceHttp.handleCommerceSubmission(requestFrom(validFunctionData(images)), unavailableDeps);
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).reason, "verification:unavailable");
    const reused = await commerceHttp.handleCommerceSubmission(requestFrom(corrected), deps);
    assert.equal(reused.status, 400);
    assert.equal(consumes, 2);
    assert.equal(backendCalls, 1);

    const tooLarge = new Request("http://local/api/submissions/comercio", {
        method: "POST",
        headers: { "content-type": "multipart/form-data; boundary=x", "content-length": "5000001" },
        body: "--x--\r\n",
    });
    assert.equal((await commerceHttp.handleCommerceSubmission(tooLarge, deps)).status, 413);
    assert.equal((await commerceHttp.handleCommerceSubmission(new Request("http://local", { method: "GET" }), deps)).status, 405);
    assert.equal((await commerceHttp.handleCommerceSubmission(new Request("http://local", { method: "POST", body: "{}" }), deps)).status, 415);
}

async function testM2(images) {
    const priorWindow = globalThis.window;
    globalThis.window = { setTimeout, clearTimeout };
    try {
        const values = clientValues("ca", browserFile(images.png));
        const principal = values.imagen_principal;
        let calls = 0;
        await assert.rejects(
            () => client.submitCommerce(values, {
                fetchImpl: async () => {
                    calls += 1;
                    return response(503, { ok: false, reason: "verification:unavailable" });
                },
            }),
            (error) => {
                assert.equal(error.kind, "ambiguous");
                assert.equal(error.requiresReverification, true);
                return true;
            },
        );
        assert.equal(calls, 1);
        assert.equal(values.nombre, " Comerç QA ");
        assert.equal(values.imagen_principal, principal);

        const flowSource = await fs.readFile(path.join(frontendRoot, "src/components/CommerceSignupFlow.astro"), "utf8");
        assert.ok(flowSource.includes('submissionFailure.message === "verification:unavailable"'));
        assert.ok(flowSource.includes("verificationController.reset();"));
        assert.equal(/retry\s*\(/i.test(flowSource), false);
        assert.equal(/idempotency/i.test(flowSource), false);
    } finally {
        globalThis.window = priorWindow;
    }
}

function memoryVerificationStore() {
    const challenges = new Map();
    const attempts = new Map();
    const tokens = new Map();
    return {
        async claimResendCooldown() { return true; },
        async saveChallenge(value) { challenges.set(value.challengeId, { emailHash: value.emailHash, codeHash: value.codeHash }); },
        async clearChallenge(id) { challenges.delete(id); },
        async getChallenge(id) { return challenges.get(id) ?? null; },
        async consumeChallenge(id) { const value = challenges.get(id); challenges.delete(id); return value ?? null; },
        async incrementAttempts(id) { const value = (attempts.get(id) ?? 0) + 1; attempts.set(id, value); return value; },
        async saveVerifiedToken({ tokenHash, emailHash }) { tokens.set(tokenHash, emailHash); },
        async consumeVerifiedToken(tokenHash) { const value = tokens.get(tokenHash); tokens.delete(tokenHash); return value ?? null; },
    };
}

async function testScopes() {
    assert.deepEqual(verificationCore.VERIFICATION_SCOPES, SCOPES);
    for (const scope of SCOPES) {
        const store = memoryVerificationStore();
        let sentCode = null;
        const requestService = verificationRequest.createVerificationRequestService({
            store,
            secret: SECRET,
            limiter: { limit: async () => ({ success: true, limit: 5, remaining: 4, reset: 0 }) },
            sendCode: async ({ email, code }) => { assert.equal(email, EMAIL); sentCode = code; },
        });
        const requested = await requestService.requestCode({ email: EMAIL, language: "ca", scope });
        assert.equal(requested.ok, true);
        const checkService = verificationCheck.createVerificationCheckService({ store, secret: SECRET });
        const other = SCOPES.find((candidate) => candidate !== scope);
        assert.equal((await checkService.verifyCode({
            challengeId: requested.challengeId, email: EMAIL, code: sentCode, scope: other,
        })).ok, false);
        const checked = await checkService.verifyCode({
            challengeId: requested.challengeId, email: EMAIL, code: sentCode, scope,
        });
        assert.equal(checked.ok, true);
        const tokenService = verificationToken.createVerificationTokenService({ store, secret: SECRET });
        assert.equal((await tokenService.consume({ token: checked.token, email: EMAIL, scope: other })).ok, false);
        assert.equal((await tokenService.consume({ token: checked.token, email: EMAIL, scope })).ok, true);
        assert.equal((await tokenService.consume({ token: checked.token, email: EMAIL, scope })).ok, false);
    }

    const handlerScopes = {
        "agenda-submission-http.mjs": "agenda",
        "veu-submission-http.mjs": "veu",
        "comunicat-submission-http.mjs": "comunicat",
        "communicat-report-http.mjs": "communicat-report",
        "foto-mes-submission-http.mjs": "foto-mes",
        "millora-submission-http.mjs": "millora",
    };
    for (const [file, scope] of Object.entries(handlerScopes)) {
        const source = await fs.readFile(path.join(frontendRoot, "netlify/functions", file), "utf8");
        assert.ok(source.includes('"' + scope + '"'));
    }
}

async function testInternalTransport(images) {
    let captured = null;
    await internalTransport.createInternalStrapiSubmission({
        payload: { idioma_solicitud: "ca" },
        images: {
            imagen_principal: browserFile(images.png, "visitor.png"),
            logo: browserFile(images.webp, "visitor.webp", "image/webp"),
            galeria: [browserFile(images.jpeg, "visitor.jpeg", "image/jpeg")],
        },
        rawUrl: "http://strapi.local/",
        secret: "s".repeat(32),
        section: "comercio",
        label: "Commerce QA",
        fetchImpl: async (url, init) => {
            captured = { url, init };
            return new Response(null, { status: 204 });
        },
    });
    assert.equal(captured.url, "http://strapi.local/api/internal/submissions/comercio");
    assert.equal(captured.init.body.getAll("imagen_principal").length, 1);
    assert.equal(captured.init.body.getAll("logo").length, 1);
    assert.equal(captured.init.body.getAll("galeria").length, 1);
    assert.equal(captured.init.body.get("imagen_principal").name, "principal.png");
    assert.equal(captured.init.body.get("logo").name, "logo.webp");
    assert.equal(captured.init.body.get("galeria").name, "galeria-1.jpg");

    let legacyBody = null;
    await internalTransport.createInternalStrapiSubmission({
        payload: { idioma_solicitud: "ca" },
        image: browserFile(images.jpeg, "visitor-secret-name.jpg", "image/jpeg"),
        images: null,
        rawUrl: "http://strapi.local",
        secret: "s".repeat(32),
        section: "agenda",
        label: "Agenda QA",
        fetchImpl: async (_url, init) => {
            legacyBody = init.body;
            return new Response(null, { status: 204 });
        },
    });
    assert.equal(legacyBody.get("files").name, "submission.jpg");
}

function backendPayload(language = "ca", overrides = {}) {
    return {
        idioma_solicitud: language,
        nombre: "Comerç QA",
        categoria_document_id: "cat_qa",
        subcategoria_document_id: "sub_qa",
        descripcion_corta: "Curta",
        descripcion_completa: "Completa",
        direccion: "Carrer Major 1",
        telefono: "600000000",
        atencion_presencial: true,
        atencion_domicilio: false,
        atencion_online: false,
        recogida_local: false,
        reparto: false,
        horario_semanal: schedule(),
        servicios: [{ nombre: "Servei" }],
        redes_sociales: NETWORKS.map((plataforma) => ({ plataforma, url: "https://example.com/" + plataforma })),
        nombre_contacto: "Persona QA",
        email_contacto: EMAIL,
        aceptacion_privacidad: true,
        ...overrides,
    };
}

function makeStrapi({ failCreate = false, initial = null, categoryHasSubcategories = true, categoryAvailable = true } = {}) {
    let middleware = null;
    let state = initial ? clone(initial) : null;
    let publicCalls = 0;
    const documents = (uid) => {
        if (uid === "api::comercio.comercio") {
            publicCalls += 1;
            throw new Error("Public commerce access is forbidden in QA");
        }
        if (uid === "api::categoria-comercio.categoria-comercio") {
            return {
                findMany: async () => categoryAvailable ? [{
                    documentId: "cat_qa",
                    activa: true,
                    publishedAt: "2026-01-01",
                    subcategorias: categoryHasSubcategories
                        ? [{ documentId: "sub_qa", activa: true, publishedAt: "2026-01-01" }]
                        : [],
                }] : [],
            };
        }
        if (uid === guard.COMMERCE_SUBMISSION_UID) {
            return {
                findOne: async () => state,
                findMany: async () => state ? [state] : [],
                create: async (params) => {
                    if (failCreate) throw new Error("database failure");
                    await middleware({ uid, action: "create", params }, async () => {
                        state = { documentId: "submission_qa", ...clone(params.data) };
                    });
                    return state;
                },
                update: async (params) => middleware({ uid, action: "update", params }, async () => {
                    Object.assign(state, clone(params.data));
                    return state;
                }),
            };
        }
        return { findMany: async () => [], findOne: async () => null };
    };
    documents.use = (fn) => { middleware = fn; };
    const strapi = {
        documents,
        db: { query: () => ({ findOne: async () => state }) },
        plugin: () => { throw new Error("Media must not be used for commerce"); },
        log: { warn() {}, error() {} },
    };
    guard.registerCommerceSubmissionWriteGuard(strapi);
    return {
        strapi,
        get state() { return state; },
        get publicCalls() { return publicCalls; },
        runGuard: (action, params) => middleware({ uid: guard.COMMERCE_SUBMISSION_UID, action, params }, async () => "next"),
    };
}

async function testBackendGuardModerationAndImages(images) {
    const normalized = [];
    for (const [buffer, mime] of [[images.jpeg, "image/jpeg"], [images.png, "image/png"], [images.webp, "image/webp"]]) {
        const output = await privateImages.normalizeImage(buffer, mime);
        const metadata = await sharp(output).metadata();
        assert.equal(metadata.format, "webp");
        assert.ok(metadata.width <= 3000 && metadata.height <= 3000);
        assert.equal(metadata.exif, undefined);
        normalized.push(output);
    }
    const rotated = await sharp(normalized[0]).metadata();
    assert.equal(rotated.width, 12);
    assert.equal(rotated.height, 20);
    const large = await sharp(await privateImages.normalizeImage(images.large, "image/png")).metadata();
    assert.equal(large.width, 3000);
    assert.equal(large.height, 1500);
    await assert.rejects(() => privateImages.normalizeImage(images.tooManyPixels, "image/jpeg"));
    await assert.rejects(() => privateImages.normalizeImage(images.png, "image/jpeg"));
    await assert.rejects(() => privateImages.normalizeImage(Buffer.from("corrupt"), "image/png"));

    for (const language of ["ca", "es", "en"]) {
        assert.equal(backendRequest.parseCommercePayload(JSON.stringify(backendPayload(language))).ok, true);
    }
    assert.equal(backendRequest.parseCommercePayload(JSON.stringify(backendPayload("ca", { unexpected: true }))).ok, false);
    assert.equal(backendRequest.parseCommercePayload(JSON.stringify(backendPayload("ca", { redes_sociales: [{ plataforma: "otra", url: "https://example.com" }] }))).ok, false);
    assert.equal(backendRequest.parseCommercePayload(JSON.stringify(backendPayload("ca", { servicios: [] }))).ok, false);
    assert.equal(backendRequest.parseCommercePayload(JSON.stringify(backendPayload("ca", { horario_semanal: null }))).ok, false);

    const paths = {
        png: await writeFixture("principal.png", images.png),
        jpeg: await writeFixture("logo.jpg", images.jpeg),
        webp: await writeFixture("gallery.webp", images.webp),
    };
    const requestFiles = {
        imagen_principal: fileDescriptor(paths.png, "image/png"),
        logo: fileDescriptor(paths.jpeg, "image/jpeg"),
        galeria: [
            fileDescriptor(paths.webp, "image/webp"),
            fileDescriptor(paths.png, "image/png"),
            fileDescriptor(paths.jpeg, "image/jpeg"),
            fileDescriptor(paths.webp, "image/webp"),
        ],
    };
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: makeStrapi().strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { ...requestFiles, galeria: new Array(5).fill(fileDescriptor(paths.webp, "image/webp")) },
    })).ok, false);
    const app = makeStrapi();
    const created = await backendRequest.createCommerceSubmission({
        strapi: app.strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles,
    });
    assert.equal(created.ok, true);
    assert.equal(app.state.estado_solicitud, "pendent");
    assert.equal(app.state.galeria_quarantena_ids.length, 4);
    assert.equal(app.publicCalls, 0);

    const duplicateApp = makeStrapi();
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: duplicateApp.strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { imagen_principal: fileDescriptor(paths.png, "image/png") },
    })).ok, true);
    assert.equal(duplicateApp.state.estado_solicitud, "pendent");
    assert.equal(duplicateApp.publicCalls, 0);
    assert.equal((await privateImages.listPrivateSubmissionImages()).length, 7);

    const noSubcategoryApp = makeStrapi({ categoryHasSubcategories: false });
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: noSubcategoryApp.strapi,
        rawPayload: JSON.stringify(backendPayload("ca", { subcategoria_document_id: undefined })),
        requestFiles: { imagen_principal: fileDescriptor(paths.png, "image/png") },
    })).ok, true);
    const missingRequiredSubcategory = await backendRequest.createCommerceSubmission({
        strapi: makeStrapi().strapi,
        rawPayload: JSON.stringify(backendPayload("ca", { subcategoria_document_id: undefined })),
        requestFiles: { imagen_principal: fileDescriptor(paths.png, "image/png") },
    });
    assert.equal(missingRequiredSubcategory.ok, false);
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: makeStrapi({ categoryAvailable: false }).strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { imagen_principal: fileDescriptor(paths.png, "image/png") },
    })).ok, false);
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: makeStrapi().strapi,
        rawPayload: JSON.stringify(backendPayload("ca", { subcategoria_document_id: "sub_mismatch" })),
        requestFiles: { imagen_principal: fileDescriptor(paths.png, "image/png") },
    })).ok, false);

    const principalPreview = await moderationImages.loadPrivateModerationImage({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", role: "principal",
    });
    assert.equal(principalPreview.ok, true);
    assert.equal(principalPreview.image.mimeType, "image/webp");
    assert.equal((await moderationImages.loadPrivateModerationImage({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", role: "galeria", index: "4",
    })).ok, false);

    const directActions = ["create", "delete", "clone", "publish", "unpublish", "discardDraft"];
    for (const action of directActions) {
        await assert.rejects(() => app.runGuard(action, { documentId: "submission_qa", data: {} }));
    }
    for (const field of guard.PROTECTED_FIELDS) {
        await assert.rejects(() => app.runGuard("update", {
            documentId: "submission_qa",
            data: { [field]: field === "email_contacto" ? "other@example.invalid" : "forged" },
        }));
    }
    assert.equal(await app.runGuard("update", {
        documentId: "submission_qa", data: { observaciones_internas: "Editorial" },
    }), "next");
    const authorizedShape = guard.authorizeCommerceSubmissionWrite({ data: {} });
    assert.equal(Object.getOwnPropertySymbols(authorizedShape).length, 1);
    assert.equal(Object.keys(authorizedShape).includes("INTERNAL_WRITE"), false);

    assert.equal((await moderation.approve({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", user: { id: 7 },
    })).ok, false);
    assert.equal((await moderation.startReview({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", user: { id: 7 },
    })).state, "en_revisio");
    const approved = await moderation.approve({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", user: { id: 7 },
    });
    assert.equal(approved.state, "aprovat");
    assert.equal(approved.imagePromoted, false);
    assert.equal(approved.publicContentCreated, false);
    assert.equal(app.state.email_contacto, null);
    assert.ok(app.state.moderacion_iniciada_en);
    assert.ok(app.state.moderacion_resuelta_en);
    assert.equal((await moderation.startReview({
        strapi: app.strapi, section: "comercio", documentId: "submission_qa", user: { id: 7 },
    })).ok, false);
    assert.equal(app.publicCalls, 0);

    const rejectedApp = makeStrapi({ initial: {
        ...clone(app.state),
        documentId: "submission_reject",
        estado_solicitud: "en_revisio",
        email_contacto: EMAIL,
        moderacion_resuelta_en: null,
        moderacion_resuelta_por_admin_id: null,
    } });
    const rejected = await moderation.reject({
        strapi: rejectedApp.strapi, section: "comercio", documentId: "submission_reject", user: { id: 8 },
    });
    assert.equal(rejected.state, "rebutjat");
    assert.equal(rejected.imagePromoted, false);
    assert.equal(rejected.publicContentCreated, false);
    assert.equal(rejectedApp.state.email_contacto, null);

    await fs.rm(process.env.GUIAPINEDA_PRIVATE_UPLOAD_DIR, { recursive: true, force: true });
    const rollbackPaths = {
        principal: fileDescriptor(paths.png, "image/png"),
        logo: fileDescriptor(paths.jpeg, "image/jpeg"),
    };
    let quarantineCalls = 0;
    const secondFailureApp = makeStrapi();
    const secondFailure = await backendRequest.createCommerceSubmission({
        strapi: secondFailureApp.strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { imagen_principal: rollbackPaths.principal, logo: rollbackPaths.logo },
        quarantineImage: async (...args) => {
            quarantineCalls += 1;
            if (quarantineCalls === 2) return { ok: false, reason: "image:invalid-content" };
            return backendRequest.quarantineIncomingImage(...args);
        },
    });
    assert.equal(secondFailure.ok, false);
    assert.equal(secondFailureApp.state, null);
    assert.equal((await privateImages.listPrivateSubmissionImages()).length, 0);

    const databaseFailureApp = makeStrapi({ failCreate: true });
    await assert.rejects(() => backendRequest.createCommerceSubmission({
        strapi: databaseFailureApp.strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { imagen_principal: rollbackPaths.principal, logo: rollbackPaths.logo },
    }));
    assert.equal(databaseFailureApp.state, null);
    assert.equal((await privateImages.listPrivateSubmissionImages()).length, 0);

    const exactA = paddedImage(images.png, 2_000_000);
    const exactB = paddedImage(images.png, 2_000_000);
    const exactAPath = await writeFixture("exact-a.png", exactA);
    const exactBPath = await writeFixture("exact-b.png", exactB);
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: makeStrapi().strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: {
            imagen_principal: fileDescriptor(exactAPath, "image/png"),
            logo: fileDescriptor(exactBPath, "image/png"),
        },
    })).ok, true);
    await fs.rm(process.env.GUIAPINEDA_PRIVATE_UPLOAD_DIR, { recursive: true, force: true });
    const overPath = await writeFixture("over.png", paddedImage(images.png, 4_000_001));
    assert.equal((await backendRequest.createCommerceSubmission({
        strapi: makeStrapi().strapi,
        rawPayload: JSON.stringify(backendPayload()),
        requestFiles: { imagen_principal: fileDescriptor(overPath, "image/png") },
    })).ok, false);

    const referenced = await privateImages.storePrivateSubmissionImage({ buffer: images.png, mimeType: "image/png", maxBytes: 4_000_000 });
    const referencedLogo = await privateImages.storePrivateSubmissionImage({ buffer: images.jpeg, mimeType: "image/jpeg", maxBytes: 4_000_000 });
    const referencedGallery = await privateImages.storePrivateSubmissionImage({ buffer: images.webp, mimeType: "image/webp", maxBytes: 4_000_000 });
    const orphan = await privateImages.storePrivateSubmissionImage({ buffer: images.webp, mimeType: "image/webp", maxBytes: 4_000_000 });
    const cleanupStrapi = {
        documents: (uid) => ({
            findMany: async () => uid === guard.COMMERCE_SUBMISSION_UID
                ? [{ imagen_principal_quarantena_id: referenced.id, logo_quarantena_id: referencedLogo.id, galeria_quarantena_ids: [referencedGallery.id] }]
                : [],
        }),
        log: { warn() {} },
    };
    const summary = await cleanup.cleanupOrphanedPrivateSubmissionImages({
        strapi: cleanupStrapi,
        now: Date.now() + 1000,
        graceMs: 0,
    });
    assert.equal(summary.referenced, 3);
    assert.equal(summary.deleted, 1);
    assert.ok(await privateImages.findPrivateSubmissionImage(referenced.id));
    assert.ok(await privateImages.findPrivateSubmissionImage(referencedLogo.id));
    assert.ok(await privateImages.findPrivateSubmissionImage(referencedGallery.id));
    assert.equal(await privateImages.findPrivateSubmissionImage(orphan.id), null);
}

async function testHomeCtaParity() {
    const source = await fs.readFile(path.join(frontendRoot, "src/pages/index.astro"), "utf8");
    assert.equal(source.includes('lang !== "en"'), false);
    assert.ok(source.includes("data-business-cta"));
    assert.ok(source.includes("{t.home.businessCtaButton}"));
    for (const href of ["/alta-comerc/", "/es/alta-comercio/", "/en/businesses/add-a-business/"]) {
        assert.ok(source.includes(`"${href}"`), `missing canonical home CTA destination: ${href}`);
    }
}

async function testReviewEventStructure() {
    const source = await fs.readFile(path.join(frontendRoot, "src/components/CommerceSignupFlow.astro"), "utf8");
    const handlerChecks = [
        ["contactContinueButton?.addEventListener", "showCommerceFieldIssue(fieldIssue);", "if (returnToReviewIfEditing()) return;"],
        ["hoursContinueButton?.addEventListener", "const fieldIssue = findCommerceScheduleIssue(collectSchedule());", "if (returnToReviewIfEditing()) return;"],
        ["offerContinueButton?.addEventListener", "const fieldIssue = findCommerceNetworkIssue(collectNetworks());", "if (returnToReviewIfEditing()) return;"],
    ];
    for (const [startText, validationText, returnText] of handlerChecks) {
        const start = source.indexOf(startText);
        const validation = source.indexOf(validationText, start);
        const reviewReturn = source.indexOf(returnText, start);
        assert.ok(start >= 0 && validation > start && reviewReturn > validation);
    }
    const captureBlock = source.slice(source.indexOf('document.addEventListener(\n        "click"'), source.indexOf("[applicantName, applicantEmail]"));
    assert.ok(captureBlock.includes("#checkpoint-back"));
    assert.equal(captureBlock.includes("#checkpoint-continue"), false);
    assert.ok(captureBlock.includes("event.stopImmediatePropagation();"));
    for (const marker of [
        "refreshVisibleCommerceScheduleIssue();",
        'target.setAttribute("aria-invalid", "true");',
        'target.setAttribute("aria-describedby", error.id);',
        'input.removeAttribute("aria-invalid");',
        'input.removeAttribute("aria-describedby");',
        "copyMondayWeekdays?.addEventListener",
        "copyMondayAll?.addEventListener",
        'secondToggle?.addEventListener("click"',
        'closed?.addEventListener("change"',
    ]) {
        assert.ok(source.includes(marker), "missing review/schedule marker: " + marker);
    }
}

async function main() {
    const images = await makeImages();
    await testClientAndContracts(images);
    await testFunctionAndM1(images);
    await testM2(images);
    await testScopes();
    await testInternalTransport(images);
    await testBackendGuardModerationAndImages(images);
    await testHomeCtaParity();
    await testReviewEventStructure();
}

try {
    await main();
    console.log("PASS: complete commerce submission QA (T038/T040/T045-T051, M1/M2, B1/H1, images, moderation, scopes)");
} catch (error) {
    console.error("FAIL: commerce submission QA");
    console.error(error);
    process.exitCode = 1;
} finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
}
