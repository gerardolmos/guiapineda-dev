import {
    VERIFICATION_MAX_ATTEMPTS,
    VERIFICATION_TOKEN_TTL_SECONDS,
    generateVerificationToken,
    hashVerificationValue,
    isValidVerificationEmail,
    normalizeVerificationEmail,
    verificationHashesMatch,
} from "./verification-core.mjs";

function validOpaqueValue(
    value,
) {
    return (
        typeof value === "string" &&
        value.length >= 32 &&
        value.length <= 200
    );
}

function validCode(
    value,
) {
    return (
        typeof value === "string" &&
        /^\d{6}$/.test(value)
    );
}

export function createVerificationCheckService({
    store,
    secret =
        process.env
            .GUIAPINEDA_VERIFICATION_SECRET,
} = {}) {
    if (
        !store ||
        typeof store.getChallenge !==
            "function" ||
        typeof store.consumeChallenge !==
            "function" ||
        typeof store.incrementAttempts !==
            "function" ||
        typeof store.clearChallenge !==
            "function" ||
        typeof store.saveVerifiedToken !==
            "function"
    ) {
        throw new Error(
            "Verification store is missing.",
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
        async verifyCode({
            challengeId,
            email,
            code,
        }) {
            if (
                !validOpaqueValue(
                    challengeId,
                ) ||
                !isValidVerificationEmail(
                    email,
                ) ||
                !validCode(code)
            ) {
                return {
                    ok: false,
                    reason:
                        "verification:invalid",
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

            const challenge =
                await store.getChallenge(
                    challengeId,
                );

            if (
                !challenge ||
                typeof challenge.emailHash !==
                    "string" ||
                typeof challenge.codeHash !==
                    "string"
            ) {
                return {
                    ok: false,
                    reason:
                        "verification:invalid",
                };
            }

            const attempts =
                await store.incrementAttempts(
                    challengeId,
                );

            if (
                attempts >
                VERIFICATION_MAX_ATTEMPTS
            ) {
                await store.clearChallenge(
                    challengeId,
                );

                return {
                    ok: false,
                    reason:
                        "attempts:exhausted",
                };
            }

            const expectedCodeHash =
                hashVerificationValue(
                    secret,
                    "code",
                    challengeId,
                    emailHash,
                    code,
                );

            const emailMatches =
                verificationHashesMatch(
                    challenge.emailHash,
                    emailHash,
                );

            const codeMatches =
                verificationHashesMatch(
                    challenge.codeHash,
                    expectedCodeHash,
                );

            if (
                !emailMatches ||
                !codeMatches
            ) {
                if (
                    attempts >=
                    VERIFICATION_MAX_ATTEMPTS
                ) {
                    await store
                        .clearChallenge(
                            challengeId,
                        );

                    return {
                        ok: false,
                        reason:
                            "attempts:exhausted",
                    };
                }

                return {
                    ok: false,
                    reason:
                        "verification:invalid",
                    attemptsRemaining:
                        VERIFICATION_MAX_ATTEMPTS -
                        attempts,
                };
            }

            /*
             * Claim atómico.
             * Solo una petición concurrente puede
             * consumir el challenge correcto.
             */
            const consumed =
                await store.consumeChallenge(
                    challengeId,
                );

            if (
                !consumed ||
                typeof consumed.emailHash !==
                    "string" ||
                typeof consumed.codeHash !==
                    "string" ||
                !verificationHashesMatch(
                    consumed.emailHash,
                    emailHash,
                ) ||
                !verificationHashesMatch(
                    consumed.codeHash,
                    expectedCodeHash,
                )
            ) {
                return {
                    ok: false,
                    reason:
                        "verification:invalid",
                };
            }

            await store.clearChallenge(
                challengeId,
            );

            const token =
                generateVerificationToken();

            const tokenHash =
                hashVerificationValue(
                    secret,
                    "token",
                    token,
                );

            await store.saveVerifiedToken({
                tokenHash,
                emailHash,
            });

            return {
                ok: true,
                token,
                expiresIn:
                    VERIFICATION_TOKEN_TTL_SECONDS,
            };
        },
    };
}
