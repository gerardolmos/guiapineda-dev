import {
    fail,
    readString,
} from "./_shared/submission-common.mjs";

const LANGUAGES = new Set([
    "ca",
    "es",
    "en",
]);

const CATEGORIES = new Set([
    "incidencies",
    "civisme",
    "propostes",
]);

const ZONES = new Set([
    "centre",
    "poblenou",
    "les_creus",
    "pinemar",
    "can_cornet",
    "can_pelai",
    "can_more",
    "feliu_de_manola",
    "verge_del_carme",
    "montessol_can_carreras",
    "altres",
]);

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readEnum(
    data,
    name,
    allowed,
) {
    const value =
        readString(
            data,
            name,
            {
                required: true,
                min: 1,
                max: 120,
            },
        );

    if (!value.ok) {
        return value;
    }

    if (!allowed.has(value.value)) {
        return fail(
            `${name}:invalid`,
        );
    }

    return value;
}

export function buildMilloraPayload(
    data,
) {
    const language =
        readEnum(
            data,
            "idioma_solicitud",
            LANGUAGES,
        );

    if (!language.ok) {
        return language;
    }

    const category =
        readEnum(
            data,
            "categoria",
            CATEGORIES,
        );

    if (!category.ok) {
        return category;
    }

    const zone =
        readEnum(
            data,
            "zona",
            ZONES,
        );

    if (!zone.ok) {
        return zone;
    }

    const publicAuthor =
        readString(
            data,
            "autor_public",
            {
                required: true,
                min: 2,
                max: 120,
            },
        );

    if (!publicAuthor.ok) {
        return publicAuthor;
    }

    const title =
        readString(
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

    const summary =
        readString(
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

    const content =
        readString(
            data,
            "contingut",
            {
                required: true,
                min: 80,
                max: 6000,
            },
        );

    if (!content.ok) {
        return content;
    }

    const contactEmail =
        readString(
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

    return {
        ok: true,
        payload: {
            idioma_solicitud:
                language.value,
            categoria:
                category.value,
            zona:
                zone.value,
            autor_public:
                publicAuthor.value,
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
        },
    };
}
