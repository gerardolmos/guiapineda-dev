import {
    createVerificationRedis,
    createVerificationStore,
} from "./_shared/verification-store.mjs";

import {
    createVerificationCheckService,
} from "./_shared/verification-check.mjs";

const MAX_BODY_BYTES = 4096;

function jsonResponse(
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
                "Cache-Control":
                    "no-store",
            },
        },
    );
}

async function readRequestData(
    request,
) {
    const rawLength =
        request.headers.get(
            "content-length",
        );

    if (rawLength !== null) {
        const length =
            Number(rawLength);

        if (
            Number.isFinite(length) &&
            length > MAX_BODY_BYTES
        ) {
            return {
                ok: false,
                status: 413,
                reason:
                    "request:too-large",
            };
        }
    }

    const raw =
        await request.text();

    if (
        new TextEncoder()
            .encode(raw).byteLength >
        MAX_BODY_BYTES
    ) {
        return {
            ok: false,
            status: 413,
            reason:
                "request:too-large",
        };
    }

    let data;

    try {
        data =
            JSON.parse(raw);
    } catch {
        return {
            ok: false,
            status: 400,
            reason:
                "request:invalid",
        };
    }

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return {
            ok: false,
            status: 400,
            reason:
                "request:invalid",
        };
    }

    return {
        ok: true,
        data,
    };
}

export async function handleVerificationCheck(
    request,
    {
        service,
    },
) {
    if (
        request.method !== "POST"
    ) {
        return jsonResponse(
            {
                ok: false,
                reason:
                    "method:not-allowed",
            },
            405,
        );
    }

    const parsed =
        await readRequestData(
            request,
        );

    if (!parsed.ok) {
        return jsonResponse(
            {
                ok: false,
                reason:
                    parsed.reason,
            },
            parsed.status,
        );
    }

    try {
        const result =
            await service.verifyCode({
                challengeId:
                    parsed.data
                        .challengeId,
                email:
                    parsed.data.email,
                code:
                    parsed.data.code,
            });

        if (result.ok) {
            return jsonResponse({
                ok: true,
                token:
                    result.token,
                expiresIn:
                    result.expiresIn,
            });
        }

        if (
            result.reason ===
                "attempts:exhausted"
        ) {
            return jsonResponse(
                {
                    ok: false,
                    reason:
                        result.reason,
                },
                429,
            );
        }

        return jsonResponse(
            {
                ok: false,
                reason:
                    "verification:invalid",
                ...(Number.isInteger(
                    result
                        .attemptsRemaining,
                )
                    ? {
                          attemptsRemaining:
                              result
                                  .attemptsRemaining,
                      }
                    : {}),
            },
            400,
        );
    } catch {
        return jsonResponse(
            {
                ok: false,
                reason:
                    "verification:unavailable",
            },
            503,
        );
    }
}

export default async function handler(
    request,
) {
    const redis =
        createVerificationRedis();

    const store =
        createVerificationStore(
            redis,
        );

    const service =
        createVerificationCheckService({
            store,
        });

    return handleVerificationCheck(
        request,
        {
            service,
        },
    );
}

export const config = {
    path:
        "/api/verification/verify-code",

    rateLimit: {
        windowLimit: 20,
        windowSize: 60,
        aggregateBy: [
            "ip",
            "domain",
        ],
    },
};
