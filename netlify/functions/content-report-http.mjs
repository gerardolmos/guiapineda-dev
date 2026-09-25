import {
    buildContentReportPayload,
} from "./content-report.mjs";

import {
    createInternalStrapiSubmission,
} from "./_shared/strapi-submission.mjs";

import {
    readMultipartSubmission,
    submissionJsonResponse,
} from "./_shared/submission-http.mjs";

import {
    consumeSubmissionVerification,
} from "./_shared/submission-verification.mjs";

const MAX_REPORT_REQUEST_BYTES =
    16 * 1024;

export async function handleContentReport(
    request,
    {
        consumeVerification =
            consumeSubmissionVerification,
        createSubmission =
            createInternalStrapiSubmission,
        env = process.env,
    } = {},
) {
    const incoming =
        await readMultipartSubmission(
            request,
            {
                maxRequestBytes:
                    MAX_REPORT_REQUEST_BYTES,
            },
        );

    if (!incoming.ok) {
        return submissionJsonResponse(
            {
                ok: false,
                reason: incoming.reason,
            },
            incoming.status,
        );
    }

    if (incoming.image) {
        return submissionJsonResponse(
            {
                ok: false,
                reason:
                    "report:files-not-allowed",
            },
            400,
        );
    }

    const result =
        buildContentReportPayload(
            incoming.data,
        );

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
        await consumeVerification({
            data: incoming.data,
            email:
                result.verificationEmail,
            scope: "content-report",
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
        await createSubmission({
            payload: result.payload,
            rawUrl:
                env.GUIAPINEDA_STRAPI_URL,
            secret:
                env.GUIAPINEDA_INTERNAL_SUBMISSION_SECRET,
            section: "content_report",
            label: "Content report",
        });

        return submissionJsonResponse(
            { ok: true },
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

export default async function handler(request) {
    return handleContentReport(request);
}

export const config = {
    path:
        "/api/submissions/content-report",

    rateLimit: {
        windowLimit: 5,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};

export {
    MAX_REPORT_REQUEST_BYTES,
};
