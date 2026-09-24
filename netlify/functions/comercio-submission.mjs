const LANGUAGES = new Set(["ca", "es", "en"]);
const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const NETWORKS = new Set(["instagram", "facebook", "tiktok", "youtube", "linkedin", "x"]);
const MODALITIES = ["atencion_presencial", "atencion_domicilio", "atencion_online", "recogida_local", "reparto"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_ID = /^[A-Za-z0-9_-]{1,128}$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const COMMERCE_IMAGE_MAX_BYTES = 4_000_000;
export const COMMERCE_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const fail = (reason) => ({ ok: false, reason });

function text(data, key, { required = false, max = Infinity } = {}) {
    const raw = data[key];
    if (raw === undefined || raw === null || raw === "") {
        return required ? fail("submission:missing-field") : { ok: true, value: "" };
    }
    if (typeof raw !== "string") return fail("submission:invalid-field");
    const value = raw.trim();
    if ((required && !value) || value.length > max) return fail("submission:invalid-field");
    return { ok: true, value };
}

function jsonArray(data, key) {
    if (typeof data[key] !== "string") return fail("submission:invalid-field");
    try {
        const value = JSON.parse(data[key]);
        return Array.isArray(value) ? { ok: true, value } : fail("submission:invalid-field");
    } catch {
        return fail("submission:invalid-field");
    }
}

function validUrl(value) {
    if (!value) return true;
    try {
        return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

function validateSchedule(value) {
    if (value.length !== 7) return null;
    let openDays = 0;
    const result = [];
    for (let index = 0; index < DAYS.length; index += 1) {
        const item = value[index];
        if (!item || typeof item !== "object" || Array.isArray(item) ||
            Object.keys(item).some((key) => !["dia", "cerrado", "apertura_1", "cierre_1", "apertura_2", "cierre_2"].includes(key)) ||
            item.dia !== DAYS[index] || typeof item.cerrado !== "boolean") return null;
        if (item.cerrado) {
            if (["apertura_1", "cierre_1", "apertura_2", "cierre_2"].some((key) => Object.hasOwn(item, key))) return null;
            result.push({ dia: item.dia, cerrado: true });
            continue;
        }
        openDays += 1;
        if (typeof item.apertura_1 !== "string" || typeof item.cierre_1 !== "string" ||
            !TIME.test(item.apertura_1) || !TIME.test(item.cierre_1) || item.apertura_1 >= item.cierre_1) return null;
        const hasSecondStart = Object.hasOwn(item, "apertura_2");
        const hasSecondEnd = Object.hasOwn(item, "cierre_2");
        if (hasSecondStart !== hasSecondEnd) return null;
        const hasSecond = hasSecondStart && hasSecondEnd;
        if (hasSecond && (typeof item.apertura_2 !== "string" || typeof item.cierre_2 !== "string" ||
            !TIME.test(item.apertura_2) || !TIME.test(item.cierre_2) || item.apertura_2 >= item.cierre_2 || item.cierre_1 > item.apertura_2)) return null;
        result.push({ dia: item.dia, cerrado: false, apertura_1: item.apertura_1, cierre_1: item.cierre_1, ...(hasSecond ? { apertura_2: item.apertura_2, cierre_2: item.cierre_2 } : {}) });
    }
    return openDays ? result : null;
}

export function buildCommercePayload(data, images) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return fail("submission:invalid-payload");
    const allowed = new Set(["idioma_solicitud", "nombre", "categoria_document_id", "subcategoria_document_id", "descripcion_corta", "descripcion_completa", "direccion", "telefono", "whatsapp", "email", "web", ...MODALITIES, "horario_semanal", "servicios", "redes_sociales", "informacion_adicional", "nombre_contacto", "email_contacto", "telefono_contacto", "aceptacion_privacidad", "email_verification_token", "bot-field"]);
    if (Object.keys(data).some((key) => !allowed.has(key))) return fail("submission:forbidden-field");
    if (data["bot-field"]) return fail("submission:spam");

    const fields = {};
    for (const [key, options] of Object.entries({ nombre: { required: true, max: 100 }, categoria_document_id: { required: true, max: 128 }, subcategoria_document_id: { max: 128 }, descripcion_corta: { required: true, max: 160 }, descripcion_completa: { required: true, max: 900 }, direccion: { required: true, max: 180 }, telefono: { max: 30 }, whatsapp: { max: 30 }, email: { max: 180 }, web: { max: 250 }, informacion_adicional: { max: 800 }, nombre_contacto: { required: true, max: 120 }, email_contacto: { required: true, max: 180 }, telefono_contacto: { max: 30 } })) {
        const checked = text(data, key, options);
        if (!checked.ok) return checked;
        fields[key] = checked.value;
    }
    if (!LANGUAGES.has(data.idioma_solicitud) || !DOCUMENT_ID.test(fields.categoria_document_id) || (fields.subcategoria_document_id && !DOCUMENT_ID.test(fields.subcategoria_document_id)) ||
        (fields.email && !EMAIL.test(fields.email)) || !EMAIL.test(fields.email_contacto) || !validUrl(fields.web)) return fail("submission:invalid-field");

    const modalities = {};
    for (const key of MODALITIES) {
        if (data[key] !== "true" && data[key] !== "false") return fail("submission:invalid-field");
        modalities[key] = data[key] === "true";
    }
    if (!Object.values(modalities).some(Boolean) || data.aceptacion_privacidad !== "true") return fail("submission:invalid-field");

    const scheduleRaw = jsonArray(data, "horario_semanal");
    const servicesRaw = jsonArray(data, "servicios");
    const networksRaw = jsonArray(data, "redes_sociales");
    if (!scheduleRaw.ok || !servicesRaw.ok || !networksRaw.ok) return fail("submission:invalid-field");
    const schedule = validateSchedule(scheduleRaw.value);
    if (!schedule) return fail("submission:invalid-schedule");
    if (servicesRaw.value.length < 1 || servicesRaw.value.length > 6) return fail("submission:invalid-services");
    const services = servicesRaw.value.map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item) || Object.keys(item).some((key) => !["nombre", "descripcion"].includes(key))) return null;
        if (typeof item.nombre !== "string" ||
            (Object.hasOwn(item, "descripcion") && typeof item.descripcion !== "string")) return null;
        const nombre = item.nombre.trim();
        const descripcion = Object.hasOwn(item, "descripcion")
            ? item.descripcion.trim()
            : "";
        return nombre && nombre.length <= 100 && descripcion.length <= 300 ? { nombre, ...(descripcion ? { descripcion } : {}) } : null;
    });
    if (services.some((item) => !item)) return fail("submission:invalid-services");
    if (networksRaw.value.length > 6) return fail("submission:invalid-networks");
    const seen = new Set();
    const networks = networksRaw.value.map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item) || Object.keys(item).some((key) => !["plataforma", "url"].includes(key)) || !NETWORKS.has(item.plataforma) || seen.has(item.plataforma) || typeof item.url !== "string") return null;
        seen.add(item.plataforma);
        const url = item.url.trim();
        return url && url.length <= 250 && validUrl(url) ? { plataforma: item.plataforma, url } : null;
    });
    if (networks.some((item) => !item) || ![fields.telefono, fields.whatsapp, fields.email, fields.web].some(Boolean)) return fail("submission:invalid-field");
    if (!images?.imagen_principal || !Array.isArray(images.galeria)) return fail("image:required");
    if (images.galeria.length > 4) return fail("image:invalid-cardinality");
    const imageFiles = [images.imagen_principal, ...(images.logo ? [images.logo] : []), ...images.galeria];
    let imageBytes = 0;
    for (const file of imageFiles) {
        if (!(file instanceof File) || !COMMERCE_IMAGE_MIME_TYPES.has(file.type)) return fail("image:invalid-type");
        if (file.size <= 0 || file.size > COMMERCE_IMAGE_MAX_BYTES) return fail("image:invalid-size");
        imageBytes += file.size;
    }
    if (imageBytes > COMMERCE_IMAGE_MAX_BYTES) return fail("image:aggregate-too-large");

    const payload = { idioma_solicitud: data.idioma_solicitud, ...fields, ...modalities, horario_semanal: schedule, servicios: services, redes_sociales: networks, aceptacion_privacidad: true };
    for (const key of Object.keys(payload)) if (payload[key] === "") delete payload[key];
    return { ok: true, verificationEmail: fields.email_contacto, payload, images };
}
