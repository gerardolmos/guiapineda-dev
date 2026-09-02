// Puerta común de verificación de email para solicitudes.
//
// El token:
// - debe existir;
// - debe corresponder al email privado;
// - se consume de forma atómica;
// - nunca se devuelve ni se envía a Strapi.

import {
    createVerificationRedis,
    createVerificationStore,
} from "./verification-store.mjs";

import {
    createVerificationTokenService,
} from "./verification-token.mjs";

import {
    readString,
} from "./submission-common.mjs";

export async function consumeSubmissionVerification({
    data,
    email,
}) {
    const token = readString(
        data,
        "email_verification_token",
        {
            required: true,
            min: 32,
            max: 200,
        },
    );

    if (!token.ok) {
        return {
            ok: false,
            status: 400,
            reason: "verification:required",
        };
    }

    try {
        const redis =
            createVerificationRedis();

        const store =
            createVerificationStore(redis);

        const service =
            createVerificationTokenService({
                store,
            });

        const result =
            await service.consume({
                token: token.value,
                email,
            });

        if (!result.ok) {
            return {
                ok: false,
                status: 400,
                reason: "verification:invalid",
            };
        }

        return {
            ok: true,
        };
    } catch {
        return {
            ok: false,
            status: 503,
            reason: "verification:unavailable",
        };
    }
}
