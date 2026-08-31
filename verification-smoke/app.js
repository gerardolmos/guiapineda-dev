const email =
    document.getElementById(
        "email",
    );

const language =
    document.getElementById(
        "language",
    );

const requestButton =
    document.getElementById(
        "request",
    );

const codeStep =
    document.getElementById(
        "code-step",
    );

const code =
    document.getElementById(
        "code",
    );

const verifyButton =
    document.getElementById(
        "verify",
    );

const status =
    document.getElementById(
        "status",
    );

let challengeId = "";
let verifiedToken = "";

function message(
    value,
) {
    status.textContent = value;
}

async function post(
    url,
    body,
) {
    const response =
        await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body:
                    JSON.stringify(
                        body,
                    ),
            },
        );

    const data =
        await response.json();

    return {
        response,
        data,
    };
}

requestButton.addEventListener(
    "click",
    async () => {
        const address =
            email.value.trim();

        if (
            !address ||
            !email.checkValidity()
        ) {
            email.reportValidity();
            return;
        }

        challengeId = "";
        verifiedToken = "";
        codeStep.hidden = true;

        requestButton.disabled = true;

        message(
            "Solicitando código...",
        );

        try {
            const {
                response,
                data,
            } =
                await post(
                    "/api/verification/request-code",
                    {
                        email:
                            address,
                        language:
                            language.value,
                    },
                );

            if (
                !response.ok ||
                !data.ok
            ) {
                message(
                    `Error: ${
                        data.reason ??
                        response.status
                    }`,
                );
                return;
            }

            challengeId =
                data.challengeId;

            code.value = "";
            codeStep.hidden = false;
            code.focus();

            message(
                "Código enviado. Revisa el correo.",
            );
        } catch {
            message(
                "No se ha podido contactar con la función.",
            );
        } finally {
            requestButton.disabled = false;
        }
    },
);

code.addEventListener(
    "input",
    () => {
        code.value =
            code.value
                .replace(
                    /\D/g,
                    "",
                )
                .slice(
                    0,
                    6,
                );
    },
);

verifyButton.addEventListener(
    "click",
    async () => {
        const address =
            email.value.trim();

        const value =
            code.value.trim();

        if (
            !challengeId ||
            value.length !== 6
        ) {
            message(
                "Introduce un código válido de 6 cifras.",
            );
            return;
        }

        verifyButton.disabled = true;

        message(
            "Comprobando código...",
        );

        try {
            const {
                response,
                data,
            } =
                await post(
                    "/api/verification/verify-code",
                    {
                        challengeId,
                        email:
                            address,
                        code:
                            value,
                    },
                );

            if (
                !response.ok ||
                !data.ok
            ) {
                message(
                    `Código no aceptado: ${
                        data.reason ??
                        response.status
                    }`,
                );
                return;
            }

            verifiedToken =
                data.token;

            challengeId = "";
            codeStep.hidden = true;

            message(
                verifiedToken
                    ? "EMAIL VERIFICADO — circuito completo OK."
                    : "ERROR: no se recibió token.",
            );
        } catch {
            message(
                "No se ha podido contactar con la función.",
            );
        } finally {
            verifyButton.disabled = false;
        }
    },
);
