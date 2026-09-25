import {
    initEmailVerificationController,
} from "./emailVerificationController.ts";

export const CONTENT_REPORT_TYPES = new Set([
    "agenda",
    "veu",
    "millora",
    "comercio",
]);

export const CONTENT_REPORT_REASONS = new Set([
    "informacion_falsa",
    "spam_fraude",
    "contenido_inapropiado_ilegal",
    "privacidad_datos",
    "otro",
]);

type ValidationInput = {
    contentType: string;
    documentId: string;
    reason: string;
    explanation: string;
    email: string;
    emailValid: boolean;
    emailVerified: boolean;
};

export type ContentReportValidationError =
    | "invalidReference"
    | "requiredReason"
    | "requiredExplanation"
    | "tooLong"
    | "invalidEmail"
    | "verificationRequired";

export type ContentReportResponseState =
    | "success"
    | "limited"
    | "invalidReference"
    | "unavailable";

export function normalizeContentReportEmail(
    value: string,
): string {
    return value.trim().toLowerCase();
}

export function validateContentReportInput({
    contentType,
    documentId,
    reason,
    explanation,
    email,
    emailValid,
    emailVerified,
}: ValidationInput): ContentReportValidationError | null {
    const stableId = documentId.trim();

    if (
        !CONTENT_REPORT_TYPES.has(contentType) ||
        stableId.length < 1 ||
        stableId.length > 128
    ) {
        return "invalidReference";
    }

    if (!CONTENT_REPORT_REASONS.has(reason)) {
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

    const normalizedEmail =
        normalizeContentReportEmail(email);

    if (
        !normalizedEmail ||
        normalizedEmail.length > 180 ||
        !emailValid
    ) {
        return "invalidEmail";
    }

    if (!emailVerified) {
        return "verificationRequired";
    }

    return null;
}

export function classifyContentReportResponse(
    status: number,
    data: unknown,
): ContentReportResponseState {
    if (
        status === 201 &&
        data !== null &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        "ok" in data &&
        data.ok === true
    ) {
        return "success";
    }

    if (status === 429) {
        return "limited";
    }

    if (status === 400) {
        return "invalidReference";
    }

    return "unavailable";
}

function initForm(form: HTMLFormElement) {
    const reason = form.querySelector<HTMLSelectElement>(
        "[data-report-reason]",
    );
    const explanation = form.querySelector<HTMLTextAreaElement>(
        "[data-report-explanation]",
    );
    const count = form.querySelector<HTMLElement>(
        "[data-report-explanation-count]",
    );
    const optional = form.querySelector<HTMLElement>(
        "[data-report-optional]",
    );
    const email = form.querySelector<HTMLInputElement>(
        "[data-report-email]",
    );
    const submit = form.querySelector<HTMLButtonElement>(
        "[data-report-submit]",
    );
    const error = form.querySelector<HTMLElement>(
        "[data-content-report-error]",
    );
    const retry = form.querySelector<HTMLButtonElement>(
        "[data-report-retry]",
    );
    const wrap = form.closest<HTMLElement>(
        "[data-content-report-form-wrap]",
    );
    const success = wrap?.parentElement?.querySelector<HTMLElement>(
        "[data-content-report-success]",
    );
    const details = form.closest<HTMLDetailsElement>(
        "[data-content-report-details]",
    );

    if (
        !reason ||
        !explanation ||
        !count ||
        !optional ||
        !email ||
        !submit ||
        !error ||
        !retry ||
        !wrap ||
        !success ||
        !details
    ) {
        return;
    }

    const verification =
        initEmailVerificationController(form);
    const idleLabel = submit.dataset.defaultLabel ?? "";
    const sendingLabel = form.dataset.sendingLabel ?? idleLabel;
    let submitting = false;

    function message(key: ContentReportValidationError | ContentReportResponseState) {
        return form.dataset[key] ?? "";
    }

    function setError(text = "") {
        error.textContent = text;
        error.hidden = !text;
        retry.hidden = !text;
    }

    function resetSensitiveInput() {
        verification?.reset();
        email.value = "";
        const honeypot = form.elements.namedItem("bot-field");
        if (honeypot instanceof HTMLInputElement) honeypot.value = "";
    }

    function currentValidation() {
        return validateContentReportInput({
            contentType: form.dataset.contentType ?? "",
            documentId: form.dataset.documentId ?? "",
            reason: reason.value,
            explanation: explanation.value,
            email: email.value,
            emailValid: email.checkValidity(),
            emailVerified: Boolean(verification?.isVerified()),
        });
    }

    function updateState() {
        const isOther = reason.value === "otro";
        explanation.required = isOther;
        optional.hidden = isOther;
        count.textContent = String(explanation.value.length);
        explanation.setAttribute(
            "aria-invalid",
            explanation.value.length > 1000 ||
                (isOther && !explanation.value.trim())
                ? "true"
                : "false",
        );
        submit.disabled = submitting || currentValidation() !== null;
    }

    function validateForSubmission() {
        const validation = currentValidation();
        if (!validation) return true;

        setError(message(validation));
        if (validation === "requiredReason") reason.focus();
        else if (
            validation === "requiredExplanation" ||
            validation === "tooLong"
        ) explanation.focus();
        else email.focus();
        return false;
    }

    reason.addEventListener("change", () => {
        setError();
        updateState();
    });
    explanation.addEventListener("input", () => {
        setError();
        updateState();
    });
    email.addEventListener("input", () => {
        setError();
        updateState();
    });
    form.addEventListener(
        "guiapineda:email-verification-change",
        updateState,
    );

    retry.addEventListener("click", () => {
        setError();
        email.focus();
    });

    details.addEventListener("toggle", () => {
        if (!details.open) {
            resetSensitiveInput();
            setError();
            updateState();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submitting || !validateForSubmission()) {
            updateState();
            return;
        }

        submitting = true;
        submit.textContent = sendingLabel;
        updateState();
        setError();

        let state: ContentReportResponseState = "unavailable";
        try {
            const response = await fetch(
                "/api/submissions/content-report",
                {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: new FormData(form),
                },
            );
            let data: unknown = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }
            state = classifyContentReportResponse(response.status, data);
        } catch {
            state = "unavailable";
        }

        if (state === "success") {
            wrap.hidden = true;
            success.hidden = false;
            success.focus();
        } else {
            resetSensitiveInput();
            setError(message(state));
            error.focus();
        }

        submitting = false;
        submit.textContent = idleLabel;
        updateState();
    });

    updateState();
}

export function initContentReportFlow() {
    document
        .querySelectorAll<HTMLFormElement>("form[data-content-report-form]")
        .forEach(initForm);
}
