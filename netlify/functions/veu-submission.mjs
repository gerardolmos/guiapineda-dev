import { fail, readString } from "./_shared/submission-common.mjs";
import { createStrapiSubmission } from "./_shared/strapi-submission.mjs";

const LANGUAGES = new Set([
    "ca",
    "es",
    "en",
]);

const AUTHOR_TYPES = new Set([
    "nom_complet",
    "nom",
    "pseudonim",
]);

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildVeuPayload(data) {
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
        data.estado_solicitud !==
            undefined ||
        data.observaciones_internas !==
            undefined
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

    const title = readString(
        data,
        "titol",
        {
            required: true,
            min: 8,
            max: 140,
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
            max: 400,
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
            min: 500,
            max: 6000,
        },
    );

    if (!content.ok) {
        return content;
    }

    const authorType = readString(
        data,
        "tipo_autoria",
        {
            required: true,
            min: 3,
            max: 20,
        },
    );

    if (!authorType.ok) {
        return authorType;
    }

    if (
        !AUTHOR_TYPES.has(
            authorType.value,
        )
    ) {
        return fail(
            "tipo_autoria:invalid",
        );
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

    const contactName =
        readString(
            data,
            "nombre_contacto",
            {
                required: true,
                min: 2,
                max: 120,
            },
        );

    if (!contactName.ok) {
        return contactName;
    }

    const contactEmail =
        readString(
            data,
            "email_contacto",
            {
                required: true,
                min: 5,
                max: 254,
            },
        );

    if (
        !contactEmail.ok ||
        !EMAIL_PATTERN.test(
            contactEmail.value,
        )
    ) {
        return fail(
            "email_contacto:invalid",
        );
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

    return {
        ok: true,
        payload: {
            idioma_solicitud:
                language.value,
            titol:
                title.value,
            resum:
                summary.value,
            contingut:
                content.value,
            tipo_autoria:
                authorType.value,
            autor_public:
                publicAuthor.value,
            nombre_contacto:
                contactName.value,
            email_contacto:
                contactEmail.value,
            aceptacion_privacidad:
                true,
        },
    };
}

async function createVeuRequest(
    payload,
) {
    await createStrapiSubmission({
        payload,
        rawUrl:
            process.env.GUIAPINEDA_STRAPI_URL,
        token:
            process.env.GUIAPINEDA_STRAPI_VEU_TOKEN,
        endpoint:
            "/api/solicitudes-veu",
        label:
            "Veu",
    });
}

export default {
    async formSubmitted(event) {
        const data = event?.data;

        if (
            !data ||
            data["form-name"] !==
                "veu"
        ) {
            return;
        }

        const result =
            buildVeuPayload(data);

        if (!result.ok) {
            console.warn(
                `Veu submission rejected: ${result.reason}`,
            );
            return;
        }

        await createVeuRequest(
            result.payload,
        );

        console.info(
            "Veu submission stored in Strapi.",
        );
    },
};
