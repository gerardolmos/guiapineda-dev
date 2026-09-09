import {
    buildMilloraPayload,
} from "./millora-submission.mjs";

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

const MAX_MILLORA_REQUEST_BYTES =
    5 * 1024 * 1024;

const MAX_MILLORA_IMAGE_BYTES =
    4 * 1024 * 1024;

export async function handleMilloraSubmission(
    request,
) {
    const incoming =
        await readMultipartSubmission(
            request,
            {
                imageField:
                    "imatge",
                maxRequestBytes:
                    MAX_MILLORA_REQUEST_BYTES,
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

    const imageValidation =
        validateSubmissionImage(
            incoming.image,
            {
                maxBytes:
                    MAX_MILLORA_IMAGE_BYTES,
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
        buildMilloraPayload(
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
                "millora",
            label:
                "Millora",
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
    return handleMilloraSubmission(
        request,
    );
}

export const config = {
    path:
        "/api/submissions/millora",
    rateLimit: {
        windowLimit: 10,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};
