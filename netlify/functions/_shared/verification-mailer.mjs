import {
    Resend,
} from "resend";

const CONTENT = {
    ca: {
        subject:
            "Codi de verificació de GUIAPINEDA",
        intro:
            "El teu codi de verificació és:",
        expiry:
            "Caduca al cap de 10 minuts.",
        ignore:
            "Si no has sol·licitat aquest codi, pots ignorar aquest missatge.",
    },
    es: {
        subject:
            "Código de verificación de GUIAPINEDA",
        intro:
            "Tu código de verificación es:",
        expiry:
            "Caduca en 10 minutos.",
        ignore:
            "Si no has solicitado este código, puedes ignorar este mensaje.",
    },
    en: {
        subject:
            "GUIAPINEDA verification code",
        intro:
            "Your verification code is:",
        expiry:
            "It expires in 10 minutes.",
        ignore:
            "If you did not request this code, you can ignore this message.",
    },
};

function getContent(
    language,
) {
    return (
        CONTENT[language] ??
        CONTENT.ca
    );
}

export function createVerificationMailer({
    apiKey =
        process.env.RESEND_API_KEY,
    from =
        process.env
            .GUIAPINEDA_VERIFICATION_FROM,
    client,
} = {}) {
    if (
        typeof from !== "string" ||
        !from.trim()
    ) {
        throw new Error(
            "Verification mail sender is missing.",
        );
    }

    const resend =
        client ??
        (
            typeof apiKey === "string" &&
            apiKey
                ? new Resend(apiKey)
                : null
        );

    if (
        !resend ||
        !resend.emails ||
        typeof resend.emails.send !==
            "function"
    ) {
        throw new Error(
            "Verification mail configuration is missing.",
        );
    }

    return async function sendCode({
        email,
        code,
        language = "ca",
    }) {
        const content =
            getContent(language);

        const text = [
            content.intro,
            "",
            code,
            "",
            content.expiry,
            "",
            content.ignore,
        ].join("\n");

        const {
            data,
            error,
        } = await resend.emails.send({
            from:
                from.trim(),
            to: email,
            subject:
                content.subject,
            text,
        });

        if (error) {
            throw new Error(
                "Verification email delivery failed.",
            );
        }

        return {
            id:
                data?.id ?? null,
        };
    };
}
