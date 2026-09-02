import {
    buildVeuPayload,
} from "./veu-submission.mjs";

import {
    createStrapiSubmission,
} from "./_shared/strapi-submission.mjs";

import {
    readMultipartSubmission,
    submissionJsonResponse,
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

    /*
     * El upload seguro se implementa en el
     * siguiente cambio.
     */
    if (incoming.image) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    "image:upload-not-ready",
            },
            503,
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
        await createStrapiSubmission({
            payload: result.payload,
            rawUrl:
                process.env
                    .GUIAPINEDA_STRAPI_URL,
            token:
                process.env
                    .GUIAPINEDA_STRAPI_VEU_TOKEN,
            endpoint:
                "/api/solicitudes-veu",
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
