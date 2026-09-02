// Infraestructura HTTP común para solicitudes participativas.
//
// Responsabilidades:
// - aceptar únicamente POST multipart/form-data;
// - limitar el tamaño total recibido;
// - separar campos de texto y archivo;
// - no confiar en validaciones del navegador;
// - responder siempre en JSON y sin cache.

const DEFAULT_MAX_REQUEST_BYTES =
    3 * 1024 * 1024;

function isFileLike(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.name === "string" &&
        typeof value.size === "number" &&
        typeof value.arrayBuffer === "function"
    );
}

export function submissionJsonResponse(
    data,
    status = 200,
) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json; charset=utf-8",
                "Cache-Control": "no-store",
            },
        },
    );
}

export async function readMultipartSubmission(
    request,
    {
        imageField = "imatge",
        maxRequestBytes =
            DEFAULT_MAX_REQUEST_BYTES,
    } = {},
) {
    if (request.method !== "POST") {
        return {
            ok: false,
            status: 405,
            reason: "request:method-not-allowed",
        };
    }

    const contentType =
        request.headers.get("content-type") ?? "";

    if (
        !contentType
            .toLowerCase()
            .startsWith("multipart/form-data")
    ) {
        return {
            ok: false,
            status: 415,
            reason: "request:unsupported-media-type",
        };
    }

    const rawLength =
        request.headers.get("content-length");

    if (rawLength !== null) {
        const length = Number(rawLength);

        if (
            Number.isFinite(length) &&
            length > maxRequestBytes
        ) {
            return {
                ok: false,
                status: 413,
                reason: "request:too-large",
            };
        }
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return {
            ok: false,
            status: 400,
            reason: "request:invalid-form-data",
        };
    }

    const data = {};
    let image = null;
    let measuredBytes = 0;
    const seenFields = new Set();
    const encoder = new TextEncoder();

    for (
        const [field, value]
        of formData.entries()
    ) {
        if (seenFields.has(field)) {
            return {
                ok: false,
                status: 400,
                reason: "request:duplicate-field",
            };
        }

        seenFields.add(field);

        if (isFileLike(value)) {
            /*
             * Un input file vacío puede llegar como
             * File("", 0). Lo tratamos como ausencia
             * de imagen.
             */
            if (
                value.size === 0 &&
                !value.name
            ) {
                continue;
            }

            if (field !== imageField) {
                return {
                    ok: false,
                    status: 400,
                    reason: "request:unexpected-file",
                };
            }

            image = value;
            measuredBytes += value.size;
            continue;
        }

        const stringValue =
            typeof value === "string"
                ? value
                : String(value);

        measuredBytes +=
            encoder.encode(stringValue).byteLength;

        data[field] = stringValue;
    }

    if (measuredBytes > maxRequestBytes) {
        return {
            ok: false,
            status: 413,
            reason: "request:too-large",
        };
    }

    return {
        ok: true,
        data,
        image,
    };
}

export const MAX_SUBMISSION_IMAGE_BYTES =
    2 * 1024 * 1024;

export const SUBMISSION_IMAGE_MIME_TYPES =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

export function validateSubmissionImage(
    image,
    {
        maxBytes =
            MAX_SUBMISSION_IMAGE_BYTES,
    } = {},
) {
    if (!image) {
        return {
            ok: true,
        };
    }

    if (
        typeof image !== "object" ||
        typeof image.size !== "number" ||
        typeof image.type !== "string" ||
        typeof image.arrayBuffer !==
            "function"
    ) {
        return {
            ok: false,
            status: 400,
            reason: "image:invalid",
        };
    }

    if (
        image.size <= 0
    ) {
        return {
            ok: false,
            status: 400,
            reason: "image:empty",
        };
    }

    if (
        image.size > maxBytes
    ) {
        return {
            ok: false,
            status: 413,
            reason: "image:too-large",
        };
    }

    const mimeType =
        image.type
            .trim()
            .toLowerCase();

    if (
        !SUBMISSION_IMAGE_MIME_TYPES
            .has(mimeType)
    ) {
        return {
            ok: false,
            status: 415,
            reason:
                "image:unsupported-type",
        };
    }

    return {
        ok: true,
        mimeType,
    };
}
