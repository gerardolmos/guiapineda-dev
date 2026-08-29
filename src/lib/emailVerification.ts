const REQUEST_CODE_ENDPOINT =
    "/api/verification/request-code";

const VERIFY_CODE_ENDPOINT =
    "/api/verification/verify-code";

async function postVerificationRequest(
    endpoint: string,
    payload: Record<string, unknown>,
    fetchImpl: typeof fetch = fetch,
) {
    let response: Response;

    try {
        response = await fetchImpl(
            endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body:
                    JSON.stringify(
                        payload,
                    ),
            },
        );
    } catch {
        return {
            ok: false as const,
            status: 0,
            reason:
                "verification:unavailable",
        };
    }

    let data: unknown;

    try {
        data =
            await response.json();
    } catch {
        return {
            ok: false as const,
            status:
                response.status,
            reason:
                "verification:unavailable",
        };
    }

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return {
            ok: false as const,
            status:
                response.status,
            reason:
                "verification:unavailable",
        };
    }

    return {
        status:
            response.status,
        ...data,
    } as {
        status: number;
        ok?: boolean;
        reason?: string;
        challengeId?: string;
        expiresIn?: number;
        token?: string;
        attemptsRemaining?: number;
    };
}

export async function requestEmailVerification(
    {
        email,
        language,
    }: {
        email: string;
        language: string;
    },
    fetchImpl: typeof fetch = fetch,
) {
    const result =
        await postVerificationRequest(
            REQUEST_CODE_ENDPOINT,
            {
                email,
                language,
            },
            fetchImpl,
        );

    if (
        result.ok === true &&
        typeof result.challengeId ===
            "string" &&
        result.challengeId &&
        typeof result.expiresIn ===
            "number"
    ) {
        return {
            ok: true as const,
            challengeId:
                result.challengeId,
            expiresIn:
                result.expiresIn,
        };
    }

    return {
        ok: false as const,
        status:
            result.status,
        reason:
            result.reason ??
            "verification:unavailable",
    };
}

export async function verifyEmailCode(
    {
        challengeId,
        email,
        code,
    }: {
        challengeId: string;
        email: string;
        code: string;
    },
    fetchImpl: typeof fetch = fetch,
) {
    const result =
        await postVerificationRequest(
            VERIFY_CODE_ENDPOINT,
            {
                challengeId,
                email,
                code,
            },
            fetchImpl,
        );

    if (
        result.ok === true &&
        typeof result.token ===
            "string" &&
        result.token &&
        typeof result.expiresIn ===
            "number"
    ) {
        return {
            ok: true as const,
            token:
                result.token,
            expiresIn:
                result.expiresIn,
        };
    }

    return {
        ok: false as const,
        status:
            result.status,
        reason:
            result.reason ??
            "verification:unavailable",
        attemptsRemaining:
            typeof result
                .attemptsRemaining ===
                "number"
                ? result
                      .attemptsRemaining
                : undefined,
    };
}
