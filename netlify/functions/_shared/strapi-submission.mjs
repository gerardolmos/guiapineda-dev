// Transporte común de solicitudes participativas hacia Strapi.
// Los endpoints, tokens y payloads específicos permanecen fuera de este módulo.

export async function createStrapiSubmission({
    payload,
    rawUrl,
    token,
    endpoint,
    label,
}) {
    if (!rawUrl || !token) {
        throw new Error(
            `${label} Strapi configuration is missing.`,
        );
    }

    const baseUrl =
        rawUrl.trim().replace(/\/+$/, "");

    const response = await fetch(
        `${baseUrl}${endpoint}`,
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
            `${label} Strapi request failed: ${response.status}`,
        );
    }
}

const INTERNAL_SUBMISSION_SECTIONS =
    new Set([
        "agenda",
        "comunicat",
        "veu",
    ]);

const INTERNAL_IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const INTERNAL_SUBMISSION_TIMEOUT_MS =
    15_000;

function requireInternalSubmissionConfig({
    rawUrl,
    secret,
    section,
    label,
}) {
    if (
        typeof rawUrl !== "string" ||
        !rawUrl.trim()
    ) {
        throw new Error(
            `${label} internal Strapi URL is missing.`,
        );
    }

    if (
        typeof secret !== "string" ||
        secret.length < 32
    ) {
        throw new Error(
            `${label} internal submission secret is missing.`,
        );
    }

    if (
        !INTERNAL_SUBMISSION_SECTIONS
            .has(section)
    ) {
        throw new Error(
            `${label} internal submission section is invalid.`,
        );
    }
}

async function buildInternalSubmissionBody({
    payload,
    image,
}) {
    const body =
        new FormData();

    body.set(
        "payload",
        JSON.stringify(payload),
    );

    if (!image) {
        return body;
    }

    const mimeType =
        image.type
            .trim()
            .toLowerCase();

    const extension =
        INTERNAL_IMAGE_EXTENSIONS[
            mimeType
        ];

    if (!extension) {
        throw new Error(
            "Internal submission image type is invalid.",
        );
    }

    /*
     * No reenviamos el nombre original del
     * archivo aportado por el usuario.
     *
     * Strapi recibe únicamente un nombre
     * técnico generado y después reconstruye
     * la imagen antes de guardarla en cuarentena.
     */
    const bytes =
        await image.arrayBuffer();

    const safeImage =
        new Blob(
            [bytes],
            {
                type: mimeType,
            },
        );

    body.set(
        "files",
        safeImage,
        `submission${extension}`,
    );

    return body;
}

export async function createInternalStrapiSubmission({
    payload,
    image = null,
    rawUrl,
    secret,
    section,
    label,
    fetchImpl = fetch,
}) {
    requireInternalSubmissionConfig({
        rawUrl,
        secret,
        section,
        label,
    });

    const baseUrl =
        rawUrl
            .trim()
            .replace(/\/+$/, "");

    const body =
        await buildInternalSubmissionBody({
            payload,
            image,
        });

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () =>
                controller.abort(),
            INTERNAL_SUBMISSION_TIMEOUT_MS,
        );

    let response;

    try {
        response =
            await fetchImpl(
                `${baseUrl}/api/internal/submissions/${section}`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${secret}`,

                        Accept:
                            "application/json",
                    },

                    /*
                     * No establecer Content-Type:
                     * FormData debe generar su boundary.
                     */
                    body,

                    signal:
                        controller.signal,
                },
            );
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        throw new Error(
            `${label} internal Strapi request failed: ${response.status}`,
        );
    }
}
