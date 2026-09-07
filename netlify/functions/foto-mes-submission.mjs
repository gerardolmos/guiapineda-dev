import {
    fail,
    readString,
} from "./_shared/submission-common.mjs";

const LANGUAGES =
    new Set([
        "ca",
        "es",
        "en",
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
    "imatge",
];

export function buildFotoMesPayload(
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
                data[field] !==
                undefined,
        )
    ) {
        return fail(
            "submission:protected-field",
        );
    }

    const language =
        readString(
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
            "idioma_solicitud:invalid",
        );
    }

    const author =
        readString(
            data,
            "autor",
            {
                required: true,
                min: 1,
                max: 120,
            },
        );

    if (!author.ok) {
        return author;
    }

    const email =
        readString(
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
            email.value,
        )
    ) {
        return fail(
            "email_contacto:invalid",
        );
    }

    const title =
        readString(
            data,
            "titol",
            {
                max: 140,
            },
        );

    if (!title.ok) {
        return title;
    }

    const place =
        readString(
            data,
            "lloc",
            {
                max: 140,
            },
        );

    if (!place.ok) {
        return place;
    }

    if (
        data
            .aceptacion_privacidad !==
        "true"
    ) {
        return fail(
            "aceptacion_privacidad:required",
        );
    }

    if (
        data
            .aceptacion_autoria_publicacion !==
        "true"
    ) {
        return fail(
            "aceptacion_autoria_publicacion:required",
        );
    }

    const payload = {
        idioma_solicitud:
            language.value,

        autor:
            author.value,

        email_contacto:
            email.value,

        aceptacion_privacidad:
            true,

        aceptacion_autoria_publicacion:
            true,
    };

    if (title.value) {
        payload.titol =
            title.value;
    }

    if (place.value) {
        payload.lloc =
            place.value;
    }

    return {
        ok: true,
        payload,
    };
}
