import {
    buildAgendaPayload,
} from "./agenda-submission.mjs";

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

export async function handleAgendaSubmission(
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
     *
     * Hasta entonces jamás aceptamos una imagen
     * para después perderla silenciosamente.
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
        buildAgendaPayload(incoming.data);

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
                    .GUIAPINEDA_STRAPI_AGENDA_TOKEN,
            endpoint:
                "/api/solicitudes-agenda",
            label: "Agenda",
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
    return handleAgendaSubmission(request);
}

export const config = {
    path: "/api/submissions/agenda",
    rateLimit: {
        windowLimit: 10,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};
