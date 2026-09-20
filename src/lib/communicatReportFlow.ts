import {
    initEmailVerificationController,
} from "./emailVerificationController";

const REPORT_REASONS = new Set([
    "informacion_falsa",
    "spam_fraude",
    "contenido_inapropiado_ilegal",
    "privacidad_datos",
    "otro",
]);

type VerificationController =
    ReturnType<
        typeof initEmailVerificationController
    >;

type ReportValidationInput = {
    reason: string;
    explanation: string;
    emailValid: boolean;
    emailVerified: boolean;
};

export type CommunicatReportValidationError =
    | "requiredReason"
    | "requiredExplanation"
    | "tooLong"
    | "verificationRequired";

export function validateCommunicatReportInput({
    reason,
    explanation,
    emailValid,
    emailVerified,
}: ReportValidationInput):
    | CommunicatReportValidationError
    | null {
    if (!REPORT_REASONS.has(reason)) {
        return "requiredReason";
    }

    if (explanation.length > 1000) {
        return "tooLong";
    }

    if (
        reason === "otro" &&
        !explanation.trim()
    ) {
        return "requiredExplanation";
    }

    if (
        !emailValid ||
        !emailVerified
    ) {
        return "verificationRequired";
    }

    return null;
}

function message(
    form: HTMLFormElement,
    key:
        | "requiredReason"
        | "requiredExplanation"
        | "tooLong"
        | "verificationRequired"
        | "unavailable",
): string {
    return form.dataset[key] ?? "";
}

function setError(
    error: HTMLElement,
    text = "",
) {
    error.textContent = text;
    error.hidden = !text;
}

function initForm(
    form: HTMLFormElement,
) {
    const reason =
        form.querySelector<HTMLSelectElement>(
            "[data-report-reason]",
        );

    const explanation =
        form.querySelector<HTMLTextAreaElement>(
            "[data-report-explanation]",
        );

    const explanationCount =
        form.querySelector<HTMLElement>(
            "[data-report-explanation-count]",
        );

    const optionalLabel =
        form.querySelector<HTMLElement>(
            "[data-report-optional]",
        );

    const email =
        form.querySelector<HTMLInputElement>(
            "[data-report-email]",
        );

    const submit =
        form.querySelector<HTMLButtonElement>(
            "[data-report-submit]",
        );

    const error =
        form.querySelector<HTMLElement>(
            "[data-report-error]",
        );

    const wrap =
        form.closest<HTMLElement>(
            "[data-communicat-report-form-wrap]",
        );

    const success =
        wrap?.parentElement
            ?.querySelector<HTMLElement>(
                "[data-communicat-report-success]",
            );

    if (
        !reason ||
        !explanation ||
        !explanationCount ||
        !optionalLabel ||
        !email ||
        !submit ||
        !error ||
        !wrap ||
        !success
    ) {
        return;
    }

    const verification:
        VerificationController =
        initEmailVerificationController(
            form,
        );

    const idleLabel =
        submit.dataset.defaultLabel ??
        submit.textContent?.trim() ??
        "";

    const sendingLabel =
        form.dataset.sendingLabel ??
        idleLabel;

    let submitting = false;

    function emailIsValid() {
        return Boolean(
            email.value.trim() &&
            email.checkValidity(),
        );
    }

    function updateExplanation() {
        const isOther =
            reason.value === "otro";

        explanation.required =
            isOther;

        optionalLabel.hidden =
            isOther;

        explanationCount.textContent =
            String(
                explanation.value.length,
            );

        explanation.setAttribute(
            "aria-invalid",
            validateCommunicatReportInput({
                reason:
                    reason.value,
                explanation:
                    explanation.value,
                emailValid: true,
                emailVerified: true,
            }) !==
                "requiredExplanation" &&
                explanation.value.length <=
                    1000
                ? "false"
                : "true",
        );
    }

    function updateSubmitState() {
        updateExplanation();

        const validation =
            validateCommunicatReportInput({
                reason:
                    reason.value,
                explanation:
                    explanation.value,
                emailValid:
                    emailIsValid(),
                emailVerified:
                    Boolean(
                        verification?.isVerified(),
                    ),
            });

        const ready =
            !submitting &&
            validation === null;

        submit.disabled =
            !ready;
    }

    function validateForSubmission() {
        const validation =
            validateCommunicatReportInput({
                reason:
                    reason.value,
                explanation:
                    explanation.value,
                emailValid:
                    emailIsValid(),
                emailVerified:
                    Boolean(
                        verification?.isVerified(),
                    ),
            });

        if (!validation) {
            return true;
        }

        setError(
            error,
            message(
                form,
                validation,
            ),
        );

        if (
            validation ===
            "requiredReason"
        ) {
            reason.focus();
        } else if (
            validation ===
                "requiredExplanation" ||
            validation === "tooLong"
        ) {
            explanation.focus();
        } else {
            email.focus();
        }

        return false;
    }

    reason.addEventListener(
        "change",
        () => {
            setError(error);
            updateSubmitState();
        },
    );

    explanation.addEventListener(
        "input",
        () => {
            setError(error);
            updateSubmitState();
        },
    );

    email.addEventListener(
        "input",
        () => {
            setError(error);
            updateSubmitState();
        },
    );

    form.addEventListener(
        "guiapineda:email-verification-change",
        updateSubmitState,
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (
                submitting ||
                !validateForSubmission()
            ) {
                updateSubmitState();
                return;
            }

            submitting = true;
            submit.disabled = true;
            submit.textContent =
                sendingLabel;
            setError(error);

            try {
                const response =
                    await fetch(
                        "/api/submissions/communicat-report",
                        {
                            method: "POST",
                            headers: {
                                Accept:
                                    "application/json",
                            },
                            body:
                                new FormData(
                                    form,
                                ),
                        },
                    );

                let data: unknown = null;

                try {
                    data =
                        await response.json();
                } catch {
                    data = null;
                }

                if (
                    !response.ok ||
                    !data ||
                    typeof data !==
                        "object" ||
                    !("ok" in data) ||
                    data.ok !== true
                ) {
                    throw new Error(
                        "Communicat report was not accepted.",
                    );
                }

                wrap.hidden = true;
                success.hidden = false;
                success.focus();
            } catch {
                verification?.reset();

                setError(
                    error,
                    message(
                        form,
                        "unavailable",
                    ),
                );
            } finally {
                submitting = false;
                submit.textContent =
                    idleLabel;
                updateSubmitState();
            }
        },
    );

    updateSubmitState();
}

export function initCommunicatReportFlow() {
    document
        .querySelectorAll<HTMLFormElement>(
            "[data-communicat-report-flow]",
        )
        .forEach(initForm);
}
