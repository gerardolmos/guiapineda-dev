import {
    buildFotoMesPayload,
} from "./foto-mes-submission.mjs";

import {
    createInternalStrapiSubmission,
} from "./_shared/strapi-submission.mjs";

import {
    readMultipartSubmission,
    submissionJsonResponse,
    validateSubmissionImage,
} from "./_shared/submission-http.mjs";

import {
    consumeSubmissionVerification,
} from "./_shared/submission-verification.mjs";

export const FOTO_MES_MAX_IMAGE_BYTES =
    4 * 1024 * 1024;

export const FOTO_MES_MAX_REQUEST_BYTES =
    5 * 1024 * 1024;

export async function handleFotoMesSubmission(
    request,
) {
    const incoming =
        await readMultipartSubmission(
            request,
            {
                imageField:
                    "imatge",
                maxRequestBytes:
                    FOTO_MES_MAX_REQUEST_BYTES,
            },
        );

    if (!incoming.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    incoming.reason,
            },
            incoming.status,
        );
    }

    if (!incoming.image) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    "image:required",
            },
            400,
        );
    }

    const imageValidation =
        validateSubmissionImage(
            incoming.image,
            {
                maxBytes:
                    FOTO_MES_MAX_IMAGE_BYTES,
            },
        );

    if (!imageValidation.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    imageValidation.reason,
            },
            imageValidation.status,
        );
    }

    const result =
        buildFotoMesPayload(
            incoming.data,
        );

    if (!result.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    result.reason,
            },
            400,
        );
    }

    const verification =
        await consumeSubmissionVerification({
            data:
                incoming.data,

            email:
                result.payload
                    .email_contacto,
        });

    if (!verification.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    verification.reason,
            },
            verification.status,
        );
    }

    try {
        await createInternalStrapiSubmission({
            payload:
                result.payload,

            image:
                incoming.image,

            rawUrl:
                process.env
                    .GUIAPINEDA_STRAPI_URL,

            secret:
                process.env
                    .GUIAPINEDA_INTERNAL_SUBMISSION_SECRET,

            section:
                "foto_mes",

            label:
                "Foto del mes",
        });

        return submissionJsonResponse(
            {
                ok: true,
            },
            201,
        );
    } catch {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    "submission:unavailable",
            },
            503,
        );
    }
}

export default async function handler(
    request,
) {
    return handleFotoMesSubmission(
        request,
    );
}

export const config = {
    path:
        "/api/submissions/foto-mes",

    rateLimit: {
        windowLimit: 10,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};
