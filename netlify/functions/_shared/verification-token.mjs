import {
    hashVerificationValue,
    isValidVerificationEmail,
    normalizeVerificationEmail,
    verificationHashesMatch,
} from "./verification-core.mjs";

function validToken(
    value,
) {
    return (
        typeof value === "string" &&
        value.length >= 32 &&
        value.length <= 200
    );
}

export function createVerificationTokenService({
    store,
    secret =
        process.env
            .GUIAPINEDA_VERIFICATION_SECRET,
} = {}) {
    if (
        !store ||
        typeof store.consumeVerifiedToken !==
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
        async consume({
            token,
            email,
        }) {
            if (
                !validToken(token) ||
                !isValidVerificationEmail(
                    email,
                )
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

            const tokenHash =
                hashVerificationValue(
                    secret,
                    "token",
                    token,
                );

            /*
             * GETDEL hace que el token sea
             * estrictamente de un solo uso.
             */
            const verifiedEmailHash =
                await store
                    .consumeVerifiedToken(
                        tokenHash,
                    );

            if (
                typeof verifiedEmailHash !==
                    "string" ||
                !verificationHashesMatch(
                    verifiedEmailHash,
                    emailHash,
                )
            ) {
                return {
                    ok: false,
                    reason:
                        "verification:invalid",
                };
            }

            return {
                ok: true,
            };
        },
    };
}
