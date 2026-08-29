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
