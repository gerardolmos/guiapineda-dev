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
        "comercio",
        "comunicat",
        "communicat_report",
        "foto_mes",
        "millora",
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
    images,
    section,
}) {
    const body =
        new FormData();

    body.set(
        "payload",
        JSON.stringify(payload),
    );

    if (!image) {
        if (section !== "comercio") {
            if (images !== null) {
                throw new Error(
                    "Internal submission images are not supported for this section.",
                );
            }

            return body;
        }

        if (
            !images ||
            typeof images !== "object" ||
            Array.isArray(images)
        ) {
            throw new Error(
                "Commerce internal submission images are missing.",
            );
        }

        const allowedRoles =
            new Set([
                "imagen_principal",
                "logo",
                "galeria",
            ]);

        if (
            Object.keys(images).some(
                (role) =>
                    !allowedRoles.has(role),
            )
        ) {
            throw new Error(
                "Commerce internal submission image role is invalid.",
            );
        }

        const principal =
            images.imagen_principal;

        const logo = images.logo ?? null;
        const gallery =
            images.galeria ?? [];

        if (
            !principal ||
            (logo !== null && !logo) ||
            !Array.isArray(gallery) ||
            gallery.length > 4
        ) {
            throw new Error(
                "Commerce internal submission image cardinality is invalid.",
            );
        }

        const entries = [
            {
                field: "imagen_principal",
                file: principal,
                name: "principal",
            },
            ...(logo
                ? [
                      {
                          field: "logo",
                          file: logo,
                          name: "logo",
                      },
                  ]
                : []),
            ...gallery.map(
                (file, index) => ({
                    field: "galeria",
                    file,
                    name:
                        `galeria-${index + 1}`,
                }),
            ),
        ];

        for (const entry of entries) {
            if (
                !entry.file ||
                typeof entry.file !==
                    "object" ||
                typeof entry.file.type !==
                    "string" ||
                typeof entry.file.arrayBuffer !==
                    "function"
            ) {
                throw new Error(
                    "Commerce internal submission image is invalid.",
                );
            }

            const mimeType =
                entry.file.type
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

            const bytes =
                await entry.file
                    .arrayBuffer();

            const safeImage =
                new Blob(
                    [bytes],
                    {
                        type: mimeType,
                    },
                );

            body.append(
                entry.field,
                safeImage,
                `${entry.name}${extension}`,
            );
        }

        return body;
    }

    if (
        section === "comercio" ||
        images !== null
    ) {
        throw new Error(
            "Internal submission image shape is invalid.",
        );
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
    images = null,
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
            images,
            section,
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
