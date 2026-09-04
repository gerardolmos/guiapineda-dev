import {
    fail,
    readString,
} from "./_shared/submission-common.mjs";

const LANGUAGES = new Set([
    "ca",
    "es",
]);

const SENDER_TYPES = new Set([
    "entitat_associacio",
    "club_grup",
    "escola_centre",
    "comerc_empresa",
    "particular",
    "altres",
]);

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROTECTED_FIELDS = [
    "estado_solicitud",
    "observaciones_internas",
    "imatge_quarantena_id",
    "moderacion_iniciada_en",
    "moderacion_iniciada_por_admin_id",
    "moderacion_resuelta_en",
    "moderacion_resuelta_por_admin_id",
];

function readOptionalString(
    data,
    field,
    {
        max,
    },
) {
    const raw = data[field];

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
            `${field}:invalid`,
        );
    }

    const value = raw.trim();

    if (value.length > max) {
        return fail(
            `${field}:too-long`,
        );
    }

    return {
        ok: true,
        value,
    };
}

export function buildComunicatPayload(
    data,
) {
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return fail(
            "submission:invalid",
        );
    }

    if (
        typeof data["bot-field"] ===
            "string" &&
        data["bot-field"].trim()
    ) {
        return fail(
            "submission:honeypot",
        );
    }

    if (
        PROTECTED_FIELDS.some(
            (field) =>
                data[field] !== undefined,
        )
    ) {
        return fail(
            "submission:protected-field",
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

    if (!language.ok) {
        return language;
    }

    if (
        !LANGUAGES.has(
            language.value,
        )
    ) {
        return fail(
            "idioma_solicitud:invalid",
        );
    }

    const senderType = readString(
        data,
        "tipus_remitent",
        {
            required: true,
            min: 5,
            max: 32,
        },
    );

    if (!senderType.ok) {
        return senderType;
    }

    if (
        !SENDER_TYPES.has(
            senderType.value,
        )
    ) {
        return fail(
            "tipus_remitent:invalid",
        );
    }

    const author = readString(
        data,
        "autor",
        {
            required: true,
            min: 1,
            max: 140,
        },
    );

    if (!author.ok) {
        return author;
    }

    const title = readString(
        data,
        "titol",
        {
            required: true,
            min: 8,
            max: 120,
        },
    );

    if (!title.ok) {
        return title;
    }

    const summary = readString(
        data,
        "resum",
        {
            required: true,
            min: 30,
            max: 280,
        },
    );

    if (!summary.ok) {
        return summary;
    }

    const content = readString(
        data,
        "contingut",
        {
            required: true,
            min: 80,
            max: 8000,
        },
    );

    if (!content.ok) {
        return content;
    }

    const contactName =
        readOptionalString(
            data,
            "nombre_contacto",
            {
                max: 120,
            },
        );

    if (!contactName.ok) {
        return contactName;
    }

    const contactEmail = readString(
        data,
        "email_contacto",
        {
            required: true,
            min: 5,
            max: 180,
        },
    );

    if (!contactEmail.ok) {
        return contactEmail;
    }

    if (
        !EMAIL_PATTERN.test(
            contactEmail.value,
        )
    ) {
        return fail(
            "email_contacto:invalid",
        );
    }

    if (
        data.aceptacion_privacidad !==
        "true"
    ) {
        return fail(
            "aceptacion_privacidad:required",
        );
    }

    const payload = {
        idioma_solicitud:
            language.value,
        tipus_remitent:
            senderType.value,
        autor:
            author.value,
        titol:
            title.value,
        resum:
            summary.value,
        contingut:
            content.value,
        email_contacto:
            contactEmail.value,
        aceptacion_privacidad:
            true,
    };

    if (contactName.value) {
        payload.nombre_contacto =
            contactName.value;
    }

    return {
        ok: true,
        payload,
    };
}
