import {
    fail,
    readString,
} from "./_shared/submission-common.mjs";

import {
    isValidVerificationEmail,
    normalizeVerificationEmail,
} from "./_shared/verification-core.mjs";

const CONTENT_TYPES = new Set([
    "agenda",
    "veu",
    "millora",
    "comercio",
]);

const LANGUAGES = new Set([
    "ca",
    "es",
    "en",
]);

const REASONS = new Set([
    "informacion_falsa",
    "spam_fraude",
    "contenido_inapropiado_ilegal",
    "privacidad_datos",
    "otro",
]);

const ALLOWED_FIELDS = new Set([
    "tipo_contenido",
    "contenido_document_id",
    "motivo",
    "explicacion",
    "idioma_solicitud",
    "email_contacto",
    "email_verification_token",
    "bot-field",
]);

const DOCUMENT_ID_PATTERN =
    /^[A-Za-z0-9_-]+$/;

const CONTROL_CHARACTERS =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function readOptionalExplanation(data) {
    const raw = data.explicacion;

    if (
        raw === undefined ||
        raw === null ||
        raw === ""
    ) {
        return {
            ok: true,
            value: "",
        };
    }

    if (typeof raw !== "string") {
        return fail("explicacion:invalid");
    }

    const value = raw.trim();

    if (
        value.length > 1000 ||
        CONTROL_CHARACTERS.test(value)
    ) {
        return fail("explicacion:too-long");
    }

    return {
        ok: true,
        value,
    };
}

export function buildContentReportPayload(data) {
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return fail("report:invalid");
    }

    if (
        Object.keys(data).some(
            (field) => !ALLOWED_FIELDS.has(field),
        )
    ) {
        return fail("report:forbidden-field");
    }

    if (
        typeof data["bot-field"] === "string" &&
        data["bot-field"].trim()
    ) {
        return fail("report:honeypot");
    }

    const type = readString(
        data,
        "tipo_contenido",
        {
            required: true,
            min: 3,
            max: 16,
        },
    );

    const documentId = readString(
        data,
        "contenido_document_id",
        {
            required: true,
            min: 1,
            max: 128,
        },
    );

    if (
        !type.ok ||
        !CONTENT_TYPES.has(type.value) ||
        !documentId.ok ||
        !DOCUMENT_ID_PATTERN.test(
            documentId.value ?? "",
        )
    ) {
        return fail("report:invalid-reference");
    }

    const reason = readString(
        data,
        "motivo",
        {
            required: true,
            min: 4,
            max: 64,
        },
    );

    if (
        !reason.ok ||
        !REASONS.has(reason.value)
    ) {
        return fail("report:invalid-reason");
    }

    const explanation =
        readOptionalExplanation(data);

    if (!explanation.ok) {
        return explanation;
    }

    if (
        reason.value === "otro" &&
        !explanation.value
    ) {
        return fail("explicacion:required");
    }

    const language = readString(
        data,
        "idioma_solicitud",
        {
            required: true,
            min: 2,
            max: 2,
        },
    );

    if (
        !language.ok ||
        !LANGUAGES.has(language.value)
    ) {
        return fail("report:invalid-language");
    }

    const email = normalizeVerificationEmail(
        data.email_contacto,
    );

    if (
        !email ||
        email.length > 180 ||
        !isValidVerificationEmail(email)
    ) {
        return fail("email_contacto:invalid");
    }

    const token = readString(
        data,
        "email_verification_token",
        {
            required: true,
            min: 32,
            max: 200,
        },
    );

    if (!token.ok) {
        return fail("verification:required");
    }

    return {
        ok: true,
        verificationEmail: email,
        payload: {
            tipo_contenido: type.value,
            contenido_document_id:
                documentId.value,
            motivo: reason.value,
            ...(explanation.value
                ? {
                      explicacion:
                          explanation.value,
                  }
                : {}),
            idioma_solicitud:
                language.value,
        },
    };
}

export {
    ALLOWED_FIELDS,
    CONTENT_TYPES,
    LANGUAGES,
    REASONS,
};
