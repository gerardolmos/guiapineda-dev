import {
    Ratelimit,
} from "@upstash/ratelimit";

import {
    VERIFICATION_MAX_REQUESTS_PER_HOUR,
} from "./verification-core.mjs";

import {
    createVerificationRedis,
} from "./verification-store.mjs";

const EMAIL_RATE_LIMIT_PREFIX =
    "guiapineda:verification:ratelimit:email";

export function createVerificationEmailRateLimiter({
    redis =
        createVerificationRedis(),
} = {}) {
    if (!redis) {
        throw new Error(
            "Verification Redis client is missing.",
        );
    }

    return new Ratelimit({
        redis,
        limiter:
            Ratelimit.slidingWindow(
                VERIFICATION_MAX_REQUESTS_PER_HOUR,
                "1 h",
            ),
        analytics: false,
        prefix:
            EMAIL_RATE_LIMIT_PREFIX,
    });
}

export async function checkVerificationEmailRateLimit({
    limiter,
    emailHash,
}) {
    if (
        !limiter ||
        typeof limiter.limit !== "function"
    ) {
        throw new Error(
            "Verification rate limiter is missing.",
        );
    }

    if (
        typeof emailHash !== "string" ||
        !emailHash ||
        emailHash.length > 200
    ) {
        throw new Error(
            "Invalid verification email hash.",
        );
    }

    const result =
        await limiter.limit(
            emailHash,
        );

    return {
        allowed:
            result.success === true,
        limit:
            result.limit,
        remaining:
            result.remaining,
        reset:
            result.reset,
    };
}
