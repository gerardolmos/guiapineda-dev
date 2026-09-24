import { buildCommercePayload } from "./comercio-submission.mjs";
import { createInternalStrapiSubmission } from "./_shared/strapi-submission.mjs";
import { consumeSubmissionVerification } from "./_shared/submission-verification.mjs";

const MAX_REQUEST_BYTES = 5_000_000;
const TEXT_FIELDS = new Set(["idioma_solicitud", "nombre", "categoria_document_id", "subcategoria_document_id", "descripcion_corta", "descripcion_completa", "direccion", "telefono", "whatsapp", "email", "web", "atencion_presencial", "atencion_domicilio", "atencion_online", "recogida_local", "reparto", "horario_semanal", "servicios", "redes_sociales", "informacion_adicional", "nombre_contacto", "email_contacto", "telefono_contacto", "aceptacion_privacidad", "email_verification_token", "bot-field"]);
const FILE_FIELDS = new Set(["imagen_principal", "logo", "galeria"]);
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const json = (body, status) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

async function readCommerceMultipart(request) {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(length) && length > MAX_REQUEST_BYTES) return { ok: false, status: 413, reason: "submission:too-large" };
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) return { ok: false, status: 415, reason: "submission:invalid-content-type" };
    try {
        if ((await request.clone().arrayBuffer()).byteLength > MAX_REQUEST_BYTES) {
            return { ok: false, status: 413, reason: "submission:too-large" };
        }
    } catch {
        return { ok: false, status: 400, reason: "submission:invalid-multipart" };
    }
    let form;
    try { form = await request.formData(); } catch { return { ok: false, status: 400, reason: "submission:invalid-multipart" }; }
    const data = {};
    const images = { imagen_principal: null, logo: null, galeria: [] };
    for (const [key, value] of form.entries()) {
        if (value instanceof File) {
            if (!FILE_FIELDS.has(key)) return { ok: false, status: 400, reason: "submission:forbidden-field" };
            if (value.size <= 0) return { ok: false, status: 400, reason: "image:invalid-size" };
            if (key === "imagen_principal") {
                if (images.imagen_principal) return { ok: false, status: 400, reason: "image:invalid-cardinality" };
                images.imagen_principal = value;
            } else if (key === "logo") {
                if (images.logo) return { ok: false, status: 400, reason: "image:invalid-cardinality" };
                images.logo = value;
            } else {
                images.galeria.push(value);
                if (images.galeria.length > 4) return { ok: false, status: 400, reason: "image:invalid-cardinality" };
            }
        } else {
            if (!TEXT_FIELDS.has(key)) return { ok: false, status: 400, reason: "submission:forbidden-field" };
            if (Object.hasOwn(data, key)) return { ok: false, status: 400, reason: "submission:duplicate-field" };
            data[key] = value;
        }
    }
    return { ok: true, data, images };
}

export async function handleCommerceSubmission(request, { consumeVerification = consumeSubmissionVerification, createSubmission = createInternalStrapiSubmission, env = process.env } = {}) {
    if (request.method !== "POST") return json({ ok: false, reason: "submission:method-not-allowed" }, 405);
    const incoming = await readCommerceMultipart(request);
    if (!incoming.ok) return json({ ok: false, reason: incoming.reason }, incoming.status);
    const result = buildCommercePayload(incoming.data, incoming.images);
    if (!result.ok) return json({ ok: false, reason: result.reason }, 400);
    const verification = await consumeVerification({ data: incoming.data, email: result.verificationEmail, scope: "comercio" });
    if (!verification.ok) return json({ ok: false, reason: verification.reason }, verification.status);
    try {
        await createSubmission({ payload: result.payload, images: result.images, rawUrl: env.GUIAPINEDA_STRAPI_URL, secret: env.GUIAPINEDA_INTERNAL_SUBMISSION_SECRET, section: "comercio", label: "Comercio" });
        return json({ ok: true }, 201);
    } catch { return json({ ok: false, reason: "submission:unavailable" }, 503); }
}

export default (request) => handleCommerceSubmission(request);
export const config = { path: "/api/submissions/comercio", rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ["ip", "domain"] } };
