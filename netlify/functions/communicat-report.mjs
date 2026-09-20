import {
    fail,
    readString,
} from "./_shared/submission-common.mjs";

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
    "comunicat_document_id",
    "comunicat_slug",
    "motivo",
    "explicacion",
    "idioma_solicitud",
    "email_contacto",
    "email_verification_token",
    "bot-field",
]);

const DOCUMENT_ID_PATTERN =
    /^[A-Za-z0-9_-]+$/;

const SLUG_PATTERN =
    /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL_CHARACTERS =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function readOptionalExplanation(
    data,
) {
    const raw =
        data.explicacion;

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
        return fail(
            "explicacion:invalid",
        );
    }

    const value = raw.trim();

    if (
        value.length > 1000 ||
        CONTROL_CHARACTERS.test(
            value,
        )
    ) {
        return fail(
            "explicacion:too-long",
        );
    }

    return {
        ok: true,
        value,
    };
}

export function buildCommunicatReportPayload(
    data,
) {
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return fail(
            "report:invalid",
        );
    }

    if (
        Object.keys(data).some(
            (field) =>
                !ALLOWED_FIELDS.has(
                    field,
                ),
        )
    ) {
        return fail(
            "report:forbidden-field",
        );
    }

    if (
        typeof data["bot-field"] ===
            "string" &&
        data["bot-field"].trim()
    ) {
        return fail(
            "report:honeypot",
        );
    }

    const documentId = readString(
        data,
        "comunicat_document_id",
        {
            required: true,
            min: 1,
            max: 128,
        },
    );

    if (
        !documentId.ok ||
        !DOCUMENT_ID_PATTERN.test(
            documentId.value ?? "",
        )
    ) {
        return fail(
            "report:invalid-comunicat",
        );
    }

    const slug = readString(
        data,
        "comunicat_slug",
        {
            required: true,
            min: 1,
            max: 250,
        },
    );

    if (
        !slug.ok ||
        !SLUG_PATTERN.test(
            slug.value ?? "",
        )
    ) {
        return fail(
            "report:invalid-comunicat",
        );
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
        !REASONS.has(
            reason.value,
        )
    ) {
        return fail(
            "report:invalid-reason",
        );
    }

    const explanation =
        readOptionalExplanation(
            data,
        );

    if (!explanation.ok) {
        return explanation;
    }

    if (
        reason.value === "otro" &&
        !explanation.value
    ) {
        return fail(
            "explicacion:required",
        );
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
        !LANGUAGES.has(
            language.value,
        )
    ) {
        return fail(
            "report:invalid-language",
        );
    }

    const email = readString(
        data,
        "email_contacto",
        {
            required: true,
            min: 5,
            max: 180,
        },
    );

    if (
        !email.ok ||
        !EMAIL_PATTERN.test(
            email.value ?? "",
        )
    ) {
        return fail(
            "email_contacto:invalid",
        );
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
        return fail(
            "verification:required",
        );
    }

    const payload = {
        comunicat_document_id:
            documentId.value,
        comunicat_slug:
            slug.value,
        motivo:
            reason.value,
        idioma_solicitud:
            language.value,
    };

    if (explanation.value) {
        payload.explicacion =
            explanation.value;
    }

    return {
        ok: true,
        verificationEmail:
            email.value,
        payload,
    };
}

export {
    ALLOWED_FIELDS,
    LANGUAGES,
    REASONS,
};
