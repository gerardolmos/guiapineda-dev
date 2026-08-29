import {
    requestEmailVerification,
    verifyEmailCode,
} from "./emailVerification.ts";

type VerificationLanguage =
    | "ca"
    | "es"
    | "en";

export function normalizeVerificationCode(
    value: string,
): string {
    return value
        .replace(/\D/g, "")
        .slice(0, 6);
}

function readLanguage(
    value: string | undefined,
): VerificationLanguage {
    return value === "es" ||
        value === "en"
        ? value
        : "ca";
}

export function initEmailVerificationController(
    form: HTMLFormElement,
) {
    const block =
        form.querySelector<HTMLElement>(
            "[data-email-verification]",
        );

    const emailInput =
        form.querySelector<HTMLInputElement>(
            '[name="email_contacto"]',
        );

    const requestButton =
        block?.querySelector<HTMLButtonElement>(
            "[data-verification-request]",
        );

    const resendButton =
        block?.querySelector<HTMLButtonElement>(
            "[data-verification-resend]",
        );

    const confirmButton =
        block?.querySelector<HTMLButtonElement>(
            "[data-verification-confirm]",
        );

    const codeStep =
        block?.querySelector<HTMLElement>(
            "[data-verification-code-step]",
        );

    const codeInput =
        block?.querySelector<HTMLInputElement>(
            "[data-verification-code]",
        );

    const successMessage =
        block?.querySelector<HTMLElement>(
            "[data-verification-success]",
        );

    const errorMessage =
        block?.querySelector<HTMLElement>(
            "[data-verification-error]",
        );

    const tokenInput =
        block?.querySelector<HTMLInputElement>(
            "[data-verification-token]",
        );

    if (
        !block ||
        !emailInput ||
        !requestButton ||
        !resendButton ||
        !confirmButton ||
        !codeStep ||
        !codeInput ||
        !successMessage ||
        !errorMessage ||
        !tokenInput
    ) {
        return null;
    }

    const language =
        readLanguage(
            block.dataset
                .verificationLanguage,
        );

    let challengeId = "";
    let verifiedEmail = "";
    let requesting = false;
    let verifying = false;
    let tokenExpiryTimer:
        | ReturnType<typeof setTimeout>
        | undefined;

    function currentEmail(): string {
        return emailInput.value.trim();
    }

    function setButtonLabel(
        button: HTMLButtonElement,
        loading: boolean,
    ) {
        const defaultLabel =
            button.dataset.defaultLabel;

        const loadingLabel =
            button.dataset.loadingLabel;

        if (
            loading &&
            loadingLabel
        ) {
            button.textContent =
                loadingLabel;
            return;
        }

        if (defaultLabel) {
            button.textContent =
                defaultLabel;
        }
    }

    function clearError() {
        errorMessage.hidden = true;
        errorMessage.textContent = "";
    }

    function showError(
        kind:
            | "invalid"
            | "limited"
            | "unavailable",
    ) {
        const message =
            kind === "invalid"
                ? errorMessage.dataset
                      .invalidMessage
                : kind === "limited"
                  ? errorMessage.dataset
                        .limitedMessage
                  : errorMessage.dataset
                        .unavailableMessage;

        errorMessage.textContent =
            message ??
            errorMessage.dataset
                .unavailableMessage ??
            "";

        errorMessage.hidden = false;
    }

    function clearExpiryTimer() {
        if (!tokenExpiryTimer) return;

        clearTimeout(
            tokenExpiryTimer,
        );

        tokenExpiryTimer =
            undefined;
    }

    function updateBusyState() {
        requestButton.disabled =
            requesting || verifying;

        resendButton.disabled =
            requesting || verifying;

        confirmButton.disabled =
            requesting || verifying;

        codeInput.disabled =
            requesting || verifying;

        setButtonLabel(
            requestButton,
            requesting,
        );

        setButtonLabel(
            confirmButton,
            verifying,
        );
    }

    function resetVerification() {
        clearExpiryTimer();

        challengeId = "";
        verifiedEmail = "";
        tokenInput.value = "";
        codeInput.value = "";

        requestButton.hidden = false;
        codeStep.hidden = true;
        successMessage.hidden = true;

        clearError();
        updateBusyState();
    }

    function validateEmail():
        | string
        | null {
        const email =
            currentEmail();

        if (
            !email ||
            !emailInput.checkValidity()
        ) {
            emailInput.reportValidity();
            return null;
        }

        return email;
    }

    async function requestCode() {
        if (
            requesting ||
            verifying
        ) {
            return;
        }

        const email =
            validateEmail();

        if (!email) return;

        requesting = true;
        clearError();
        updateBusyState();

        try {
            const result =
                await requestEmailVerification({
                    email,
                    language,
                });

            if (!result.ok) {
                if (
                    result.reason ===
                        "cooldown" ||
                    result.reason ===
                        "rate-limit"
                ) {
                    showError(
                        "limited",
                    );
                } else {
                    showError(
                        "unavailable",
                    );
                }

                return;
            }

            challengeId =
                result.challengeId;

            verifiedEmail = "";
            tokenInput.value = "";
            codeInput.value = "";

            requestButton.hidden = true;
            codeStep.hidden = false;
            successMessage.hidden = true;

            codeInput.focus();
        } finally {
            requesting = false;
            updateBusyState();
        }
    }

    async function verifyCode() {
        if (
            requesting ||
            verifying
        ) {
            return;
        }

        const email =
            validateEmail();

        if (!email) return;

        if (!challengeId) {
            showError(
                "invalid",
            );
            return;
        }

        const code =
            normalizeVerificationCode(
                codeInput.value,
            );

        codeInput.value = code;

        if (code.length !== 6) {
            showError(
                "invalid",
            );

            codeInput.focus();
            return;
        }

        verifying = true;
        clearError();
        updateBusyState();

        try {
            const result =
                await verifyEmailCode({
                    challengeId,
                    email,
                    code,
                });

            if (!result.ok) {
                if (
                    result.reason ===
                    "verification:unavailable"
                ) {
                    showError(
                        "unavailable",
                    );
                } else {
                    showError(
                        "invalid",
                    );
                }

                return;
            }

            tokenInput.value =
                result.token;

            verifiedEmail = email;
            challengeId = "";

            requestButton.hidden = true;
            codeStep.hidden = true;
            successMessage.hidden = false;

            clearExpiryTimer();

            tokenExpiryTimer =
                setTimeout(
                    () => {
                        if (
                            currentEmail() ===
                            verifiedEmail
                        ) {
                            resetVerification();
                        }
                    },
                    result.expiresIn *
                        1000,
                );
        } finally {
            verifying = false;
            updateBusyState();
        }
    }

    requestButton.addEventListener(
        "click",
        requestCode,
    );

    resendButton.addEventListener(
        "click",
        requestCode,
    );

    confirmButton.addEventListener(
        "click",
        verifyCode,
    );

    codeInput.addEventListener(
        "input",
        () => {
            codeInput.value =
                normalizeVerificationCode(
                    codeInput.value,
                );

            clearError();
        },
    );

    codeInput.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();
            void verifyCode();
        },
    );

    emailInput.addEventListener(
        "input",
        () => {
            if (
                challengeId ||
                verifiedEmail ||
                tokenInput.value
            ) {
                resetVerification();
            }
        },
    );

    form.addEventListener(
        "reset",
        resetVerification,
    );

    block.hidden = false;
    resetVerification();

    return {
        isVerified() {
            return (
                Boolean(
                    tokenInput.value,
                ) &&
                verifiedEmail ===
                    currentEmail()
            );
        },

        getToken() {
            return tokenInput.value;
        },

        reset:
            resetVerification,
    };
}
