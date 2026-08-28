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

const CONTROL_CHARACTERS =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function fail(reason) {
    return {
        ok: false,
        reason,
    };
}

function readString(
    data,
    field,
    {
        required = false,
        min = 0,
        max,
    } = {},
) {
    const raw = data[field];

    if (
        raw === undefined ||
        raw === null
    ) {
        return required
            ? fail(`${field}:missing`)
            : {
                  ok: true,
                  value: null,
              };
    }

    if (typeof raw !== "string") {
        return fail(`${field}:type`);
    }

    const value = raw.trim();

    if (!value) {
        return required
            ? fail(`${field}:empty`)
            : {
                  ok: true,
                  value: null,
              };
    }

    if (
        CONTROL_CHARACTERS.test(value)
    ) {
        return fail(
            `${field}:control-characters`,
        );
    }

    if (value.length < min) {
        return fail(
            `${field}:too-short`,
        );
    }

    if (
        max &&
        value.length > max
    ) {
        return fail(
            `${field}:too-long`,
        );
    }

    return {
        ok: true,
        value,
    };
}

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
    const rawUrl =
        process.env
            .GUIAPINEDA_STRAPI_URL;

    const token =
        process.env
            .GUIAPINEDA_STRAPI_VEU_TOKEN;

    if (!rawUrl || !token) {
        throw new Error(
            "Veu Strapi configuration is missing.",
        );
    }

    const baseUrl =
        rawUrl
            .trim()
            .replace(/\/+$/, "");

    const response = await fetch(
        `${baseUrl}/api/solicitudes-veu`,
        {
            method: "POST",
            headers: {
                Authorization:
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                data: payload,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            `Veu Strapi request failed: ${response.status}`,
        );
    }
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
