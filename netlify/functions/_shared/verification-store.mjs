import { Redis } from "@upstash/redis";

import {
    VERIFICATION_CODE_TTL_SECONDS,
    VERIFICATION_RESEND_COOLDOWN_SECONDS,
    VERIFICATION_TOKEN_TTL_SECONDS,
} from "./verification-core.mjs";

const KEY_PREFIX =
    "guiapineda:verification";

function requireKeyPart(
    value,
    label,
) {
    if (
        typeof value !== "string" ||
        !value ||
        value.length > 200
    ) {
        throw new Error(
            `Invalid verification ${label}.`,
        );
    }

    return value;
}

function key(
    type,
    value,
) {
    return [
        KEY_PREFIX,
        type,
        requireKeyPart(value, type),
    ].join(":");
}

export function createVerificationRedis({
    url =
        process.env.UPSTASH_REDIS_REST_URL,
    token =
        process.env.UPSTASH_REDIS_REST_TOKEN,
} = {}) {
    if (
        typeof url !== "string" ||
        !url.trim() ||
        typeof token !== "string" ||
        !token.trim()
    ) {
        throw new Error(
            "Verification Redis configuration is missing.",
        );
    }

    return new Redis({
        url: url.trim(),
        token: token.trim(),
    });
}

export function createVerificationStore(
    redis = createVerificationRedis(),
) {
    if (!redis) {
        throw new Error(
            "Verification Redis client is missing.",
        );
    }

    return {
        async claimResendCooldown(
            emailHash,
        ) {
            const result =
                await redis.set(
                    key(
                        "cooldown",
                        emailHash,
                    ),
                    "1",
                    {
                        ex:
                            VERIFICATION_RESEND_COOLDOWN_SECONDS,
                        nx: true,
                    },
                );

            return result === "OK";
        },

        async saveChallenge({
            challengeId,
            emailHash,
            codeHash,
        }) {
            await redis.set(
                key(
                    "challenge",
                    challengeId,
                ),
                {
                    emailHash:
                        requireKeyPart(
                            emailHash,
                            "emailHash",
                        ),
                    codeHash:
                        requireKeyPart(
                            codeHash,
                            "codeHash",
                        ),
                },
                {
                    ex:
                        VERIFICATION_CODE_TTL_SECONDS,
                },
            );
        },

        async getChallenge(
            challengeId,
        ) {
            return redis.get(
                key(
                    "challenge",
                    challengeId,
                ),
            );
        },

        async incrementAttempts(
            challengeId,
        ) {
            const attemptsKey =
                key(
                    "attempts",
                    challengeId,
                );

            const transaction =
                redis.multi();

            transaction.incr(
                attemptsKey,
            );

            transaction.expire(
                attemptsKey,
                VERIFICATION_CODE_TTL_SECONDS,
            );

            const results =
                await transaction.exec();

            const attempts =
                Number(results?.[0]);

            if (
                !Number.isInteger(attempts) ||
                attempts < 1
            ) {
                throw new Error(
                    "Invalid verification attempt counter.",
                );
            }

            return attempts;
        },

        async clearChallenge(
            challengeId,
        ) {
            await redis.del(
                key(
                    "challenge",
                    challengeId,
                ),
                key(
                    "attempts",
                    challengeId,
                ),
            );
        },

        async saveVerifiedToken({
            tokenHash,
            emailHash,
        }) {
            await redis.set(
                key(
                    "token",
                    tokenHash,
                ),
                requireKeyPart(
                    emailHash,
                    "emailHash",
                ),
                {
                    ex:
                        VERIFICATION_TOKEN_TTL_SECONDS,
                },
            );
        },

        async consumeVerifiedToken(
            tokenHash,
        ) {
            return redis.getdel(
                key(
                    "token",
                    tokenHash,
                ),
            );
        },
    };
}
