import {
    buildVeuPayload,
} from "./veu-submission.mjs";

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

export async function handleVeuSubmission(
    request,
) {
    const incoming =
        await readMultipartSubmission(request);

    if (!incoming.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason: incoming.reason,
            },
            incoming.status,
        );
    }

    const imageValidation =
        validateSubmissionImage(
            incoming.image,
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
        buildVeuPayload(incoming.data);

    if (!result.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason: result.reason,
            },
            400,
        );
    }

    const verification =
        await consumeSubmissionVerification({
            data: incoming.data,
            email:
                result.payload.email_contacto,
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
            payload: result.payload,
            image: incoming.image,
            rawUrl:
                process.env
                    .GUIAPINEDA_STRAPI_URL,
            secret:
                process.env
                    .GUIAPINEDA_INTERNAL_SUBMISSION_SECRET,
            section: "veu",
            label: "Veu",
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
    return handleVeuSubmission(request);
}

export const config = {
    path: "/api/submissions/veu",
    rateLimit: {
        windowLimit: 10,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};
