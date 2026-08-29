import {
    VERIFICATION_CODE_TTL_SECONDS,
    generateVerificationCode,
    generateVerificationToken,
    hashVerificationValue,
    isValidVerificationEmail,
    normalizeVerificationEmail,
} from "./verification-core.mjs";

import {
    checkVerificationEmailRateLimit,
} from "./verification-rate-limit.mjs";

const LANGUAGES =
    new Set([
        "ca",
        "es",
        "en",
    ]);

export function createVerificationRequestService({
    store,
    limiter,
    sendCode,
    secret =
        process.env
            .GUIAPINEDA_VERIFICATION_SECRET,
} = {}) {
    if (
        !store ||
        typeof store.claimResendCooldown !==
            "function" ||
        typeof store.saveChallenge !==
            "function" ||
        typeof store.clearChallenge !==
            "function"
    ) {
        throw new Error(
            "Verification store is missing.",
        );
    }

    if (
        !limiter ||
        typeof limiter.limit !== "function"
    ) {
        throw new Error(
            "Verification rate limiter is missing.",
        );
    }

    if (typeof sendCode !== "function") {
        throw new Error(
            "Verification email sender is missing.",
        );
    }

    if (
        typeof secret !== "string" ||
        !secret
    ) {
        throw new Error(
            "Verification secret is missing.",
        );
    }

    return {
        async requestCode({
            email,
            language = "ca",
        }) {
            if (
                !isValidVerificationEmail(
                    email,
                )
            ) {
                return {
                    ok: false,
                    reason:
                        "email:invalid",
                };
            }

            if (
                !LANGUAGES.has(
                    language,
                )
            ) {
                return {
                    ok: false,
                    reason:
                        "language:invalid",
                };
            }

            const normalizedEmail =
                normalizeVerificationEmail(
                    email,
                );

            const emailHash =
                hashVerificationValue(
                    secret,
                    "email",
                    normalizedEmail,
                );

            /*
             * El cooldown se comprueba antes del
             * límite horario para que clics repetidos
             * durante esos 60 segundos no consuman
             * nuevas unidades del límite por hora.
             */
            const cooldownClaimed =
                await store
                    .claimResendCooldown(
                        emailHash,
                    );

            if (!cooldownClaimed) {
                return {
                    ok: false,
                    reason:
                        "cooldown",
                };
            }

            const rateLimit =
                await checkVerificationEmailRateLimit({
                    limiter,
                    emailHash,
                });

            if (!rateLimit.allowed) {
                return {
                    ok: false,
                    reason:
                        "rate-limit",
                    reset:
                        rateLimit.reset,
                };
            }

            const code =
                generateVerificationCode();

            const challengeId =
                generateVerificationToken();

            const codeHash =
                hashVerificationValue(
                    secret,
                    "code",
                    challengeId,
                    emailHash,
                    code,
                );

            await store.saveChallenge({
                challengeId,
                emailHash,
                codeHash,
            });

            try {
                await sendCode({
                    email:
                        normalizedEmail,
                    code,
                    language,
                });
            } catch (error) {
                await store
                    .clearChallenge(
                        challengeId,
                    );

                throw error;
            }

            return {
                ok: true,
                challengeId,
                expiresIn:
                    VERIFICATION_CODE_TTL_SECONDS,
            };
        },
    };
}
