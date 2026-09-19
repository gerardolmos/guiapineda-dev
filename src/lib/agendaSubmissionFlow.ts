import { initEmailVerificationController } from "./emailVerificationController";
import { submitVerifiedSubmissionForm } from "./netlifySubmission";
import { initSubmissionDraft } from "./submissionDraft";

const AGENDA_DRAFT_FIELDS = [
    "titol",
    "resum",
    "descripcio",
    "organitzador",
    "data_inici",
    "hora_inici",
    "data_final",
    "hora_final",
    "lloc",
    "adreca",
    "enllac_oficial",
    "nombre_contacto",
    "email_contacto",
] as const;

export function initAgendaSubmissionFlow() {
    const form =
        document.querySelector<HTMLFormElement>(
            "[data-agenda-submission-flow]",
        );

    if (!form) return;

    const clearDraft =
        initSubmissionDraft(
            form,
            "agenda",
            AGENDA_DRAFT_FIELDS,
        );

    initEmailVerificationController(
        form,
    );

    form.addEventListener(
        "guiapineda:email-verification-change",
        () => {
            updateSubmitState();
        },
    );

    const formStep =
        document.getElementById(
            "agenda-step-form",
        );

    const reviewStep =
        document.getElementById(
            "agenda-step-review",
        );

    const continueButton =
        document.getElementById(
            "agenda-continue",
        ) as HTMLButtonElement | null;

    const backButton =
        document.getElementById(
            "agenda-review-back",
        ) as HTMLButtonElement | null;

    const submitButton =
        document.getElementById(
            "agenda-submit",
        ) as HTMLButtonElement | null;

    const submitLabel =
        document.getElementById(
            "agenda-submit-label",
        );

    const submitError =
        document.getElementById(
            "agenda-submit-error",
        );

    const startDate =
        document.getElementById(
            "agenda-start-date",
        ) as HTMLInputElement | null;

    const endDate =
        document.getElementById(
            "agenda-end-date",
        ) as HTMLInputElement | null;

    const startTime =
        document.getElementById(
            "agenda-start-time",
        ) as HTMLInputElement | null;

    const endTime =
        document.getElementById(
            "agenda-end-time",
        ) as HTMLInputElement | null;

    const privacy =
        document.getElementById(
            "agenda-privacy",
        ) as HTMLInputElement | null;

    const imageInput =
        document.getElementById(
            "agenda-image-input",
        ) as HTMLInputElement | null;

    const imageEmpty =
        document.getElementById(
            "agenda-image-empty",
        );

    const imageSelected =
        document.getElementById(
            "agenda-image-selected",
        );

    const imagePreview =
        document.getElementById(
            "agenda-image-preview",
        ) as HTMLImageElement | null;

    const imageName =
        document.getElementById(
            "agenda-image-name",
        );

    const imageRemove =
        document.getElementById(
            "agenda-image-remove",
        ) as HTMLButtonElement | null;

    const imageError =
        document.getElementById(
            "agenda-image-error",
        );

    const reviewImageCard =
        document.getElementById(
            "agenda-review-image-card",
        );

    const reviewImage =
        document.getElementById(
            "agenda-review-image",
        ) as HTMLImageElement | null;

    const reviewFields =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-agenda-review]",
            ),
        );

    const firstStepFields =
        Array.from(
            formStep?.querySelectorAll<
                HTMLInputElement |
                HTMLTextAreaElement |
                HTMLSelectElement
            >(
                "input:not([type='hidden']), textarea, select",
            ) ?? [],
        );

    const characterCounters =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-agenda-counter]",
            ),
        );

    const sendingLabel =
        form.dataset.sendingLabel ??
        "Sending...";

    const initialSubmitLabel =
        submitLabel?.textContent?.trim() ??
        "";

    const MAX_IMAGE_SIZE =
        4 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES =
        new Set([
            "image/jpeg",
            "image/png",
            "image/webp",
        ]);

    const ALLOWED_IMAGE_EXTENSION =
        /\.(?:jpe?g|png|webp)$/i;

    let imageObjectUrl = "";
    let submitting = false;

    function todayLocal(): string {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(
            now.getMonth() + 1,
        ).padStart(2, "0");

        const day = String(
            now.getDate(),
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function clearImageError() {
        if (imageInput) {
            imageInput.setCustomValidity("");
        }

        if (imageError) {
            imageError.hidden = true;
            imageError.textContent = "";
        }
    }

    function showImageError(
        message: string,
    ) {
        if (imageInput) {
            imageInput.setCustomValidity(
                message,
            );
        }

        if (imageError) {
            imageError.textContent =
                message;
            imageError.hidden = false;
        }
    }

    function revokeImageObjectUrl() {
        if (!imageObjectUrl) return;

        URL.revokeObjectURL(
            imageObjectUrl,
        );

        imageObjectUrl = "";
    }

    function clearImagePreview() {
        revokeImageObjectUrl();

        if (imagePreview) {
            imagePreview.removeAttribute(
                "src",
            );
        }

        if (imageName) {
            imageName.textContent = "";
        }

        if (imageSelected) {
            imageSelected.hidden = true;
        }

        if (imageEmpty) {
            imageEmpty.hidden = false;
        }

        if (reviewImageCard) {
            reviewImageCard.hidden = true;
        }

        if (reviewImage) {
            reviewImage.removeAttribute(
                "src",
            );
        }
    }

    function imageValidationMessage(
        file: File,
    ): string {
        if (
            file.size > MAX_IMAGE_SIZE
        ) {
            return (
                form.dataset
                    .imageSizeError ??
                "The image is too large."
            );
        }

        if (
            !ALLOWED_IMAGE_TYPES.has(
                file.type,
            ) ||
            !ALLOWED_IMAGE_EXTENSION.test(
                file.name,
            )
        ) {
            return (
                form.dataset
                    .imageTypeError ??
                "Invalid image type."
            );
        }

        return "";
    }

    function validateImage(
        report = false,
    ): boolean {
        clearImageError();

        const file =
            imageInput?.files?.[0];

        if (!file) {
            return true;
        }

        const message =
            imageValidationMessage(
                file,
            );

        if (!message) {
            return true;
        }

        showImageError(message);

        if (report) {
            imageInput?.reportValidity();
            imageInput?.focus();
        }

        return false;
    }

    function updateImagePreview() {
        clearImagePreview();

        const file =
            imageInput?.files?.[0];

        if (!file) {
            clearImageError();
            return;
        }

        if (!validateImage(true)) {
            return;
        }

        imageObjectUrl =
            URL.createObjectURL(file);

        if (imagePreview) {
            imagePreview.src =
                imageObjectUrl;
        }

        if (imageName) {
            imageName.textContent =
                file.name;
        }

        if (imageEmpty) {
            imageEmpty.hidden = true;
        }

        if (imageSelected) {
            imageSelected.hidden = false;
        }
    }

    function removeImage() {
        if (imageInput) {
            imageInput.value = "";
        }

        clearImageError();
        clearImagePreview();
    }

    function renderReviewImage() {
        const file =
            imageInput?.files?.[0];

        if (
            !file ||
            !imageObjectUrl ||
            !reviewImage ||
            !reviewImageCard
        ) {
            if (reviewImageCard) {
                reviewImageCard.hidden =
                    true;
            }

            return;
        }

        reviewImage.src =
            imageObjectUrl;

        reviewImageCard.hidden = false;
    }

    const timeOrderError =
        document.createElement("p");

    timeOrderError.id =
        "agenda-time-order-error";
    timeOrderError.hidden = true;
    timeOrderError.className =
        "mt-2 text-sm font-bold text-red-700";
    timeOrderError.setAttribute(
        "role",
        "alert",
    );
    timeOrderError.setAttribute(
        "aria-live",
        "polite",
    );

    if (endTime) {
        const container =
            endTime.closest("label") ??
            endTime;

        container.insertAdjacentElement(
            "afterend",
            timeOrderError,
        );

        const describedBy =
            endTime
                .getAttribute("aria-describedby")
                ?.split(/\s+/)
                .filter(Boolean) ?? [];

        if (
            !describedBy.includes(
                timeOrderError.id,
            )
        ) {
            endTime.setAttribute(
                "aria-describedby",
                [
                    ...describedBy,
                    timeOrderError.id,
                ].join(" "),
            );
        }
    }

    function hideTimeOrderError() {
        timeOrderError.hidden = true;
        timeOrderError.textContent = "";
        endTime?.removeAttribute(
            "aria-invalid",
        );
    }

    function showTimeOrderError() {
        timeOrderError.textContent =
            form.dataset.timeOrderError ??
            "Invalid time order.";

        timeOrderError.hidden = false;

        endTime?.setAttribute(
            "aria-invalid",
            "true",
        );
    }

    function validateDates(): boolean {
        startDate?.setCustomValidity("");
        endDate?.setCustomValidity("");
        startTime?.setCustomValidity("");
        endTime?.setCustomValidity("");
        hideTimeOrderError();

        if (
            startDate?.value &&
            startDate.value < todayLocal()
        ) {
            startDate.setCustomValidity(
                form.dataset.pastDateError ??
                    "Invalid date.",
            );

            return false;
        }

        if (
            startDate?.value &&
            endDate?.value &&
            endDate.value < startDate.value
        ) {
            endDate.setCustomValidity(
                form.dataset.dateOrderError ??
                    "Invalid date order.",
            );

            return false;
        }

        if (
            endTime?.value &&
            !startTime?.value
        ) {
            endTime.setCustomValidity(
                form.dataset.endTimeError ??
                    "Start time is required.",
            );

            return false;
        }

        const sameDay =
            !endDate?.value ||
            endDate.value === startDate?.value;

        if (
            sameDay &&
            startTime?.value &&
            endTime?.value &&
            endTime.value <= startTime.value
        ) {
            endTime.setCustomValidity(
                form.dataset.timeOrderError ??
                    "Invalid time order.",
            );

            showTimeOrderError();

            return false;
        }

        return true;
    }

    function validateForm(): boolean {
        validateTextLengths();
        if (!validateDates()) {
            const temporalFields = [
                startDate,
                endDate,
                startTime,
                endTime,
            ];

            const invalidField =
                temporalFields.find(
                    (field) =>
                        field !== null &&
                        !field.checkValidity(),
                );

            if (invalidField) {
                invalidField.focus();
                invalidField.reportValidity();
            }

            return false;
        }

        if (!validateImage(true)) {
            return false;
        }

        for (const field of firstStepFields) {
            if (!field.checkValidity()) {
                field.reportValidity();
                field.focus();
                return false;
            }
        }

        return true;
    }

    function updateCharacterCounters() {
        characterCounters.forEach(
            (counter) => {
                const name =
                    counter.dataset
                        .agendaCounter;

                if (!name) return;

                const field =
                    form.elements.namedItem(
                        name,
                    );

                if (
                    !(field instanceof
                        HTMLTextAreaElement)
                ) {
                    return;
                }

                const min =
                    Number(
                        counter.dataset.min ??
                            "0",
                    );

                const max =
                    Number(
                        counter.dataset.max ??
                            "0",
                    );

                const minimumLabel =
                    counter.dataset
                        .minimumLabel ??
                    "minimum";

                const length =
                    field.value.length;

                counter.textContent =
                    `${length} / ${max} · ` +
                    `${minimumLabel} ${min}`;

                const ready =
                    field.value
                        .trim()
                        .length >= min;

                counter.classList.toggle(
                    "text-emerald-700",
                    ready,
                );

                counter.classList.toggle(
                    "text-slate-400",
                    !ready,
                );
            },
        );
    }

    function fieldValue(name: string): string {
        const field =
            form.elements.namedItem(name);

        if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
        ) {
            return field.value.trim();
        }

        return "";
    }

    function formatOptional(
        value: string,
    ): string {
        return value || "—";
    }

    function validateTextLengths() {
        // minlength/maxlength nativos no bastan para valores asignados por JS.
        // Leer los límites actuales del markup, sin duplicar sus reglas.
        for (const name of AGENDA_DRAFT_FIELDS) {
            const field = form.elements.namedItem(name);
            if (
                !(field instanceof HTMLInputElement ||
                    field instanceof HTMLTextAreaElement) ||
                (field instanceof HTMLInputElement &&
                    !["text", "email", "url"].includes(field.type))
            ) continue;

            field.setCustomValidity("");
            const length = field.value.length;
            const tooShort = length > 0 && field.minLength >= 0 && length < field.minLength;
            const tooLong = field.maxLength >= 0 && length > field.maxLength;
            if (!tooShort && !tooLong) continue;

            const limit = tooShort ? field.minLength : field.maxLength;
            const lang = document.documentElement.lang;
            const message = lang === "es"
                ? `Usa ${tooShort ? "al menos" : "como máximo"} ${limit} caracteres.`
                : lang === "en"
                    ? `Use ${tooShort ? "at least" : "at most"} ${limit} characters.`
                    : `Fes servir ${tooShort ? "com a mínim" : "com a màxim"} ${limit} caràcters.`;
            field.setCustomValidity(message);
        }
    }

    function updateContinueState() {
        validateTextLengths();
        if (!continueButton) return;

        const datesReady = validateDates();

        const fieldsReady =
            firstStepFields.every(
                (field) => field.checkValidity(),
            );

        const selectedImage =
            imageInput?.files?.[0];

        const imageReady =
            !selectedImage ||
            !imageValidationMessage(selectedImage);

        continueButton.disabled =
            !datesReady ||
            !fieldsReady ||
            !imageReady;
    }

    function renderReview() {
        const values: Record<
            string,
            string
        > = {
            titol:
                fieldValue("titol"),
            resum:
                fieldValue("resum"),
            descripcio:
                fieldValue("descripcio"),
            organitzador:
                fieldValue("organitzador"),
            data_inici:
                fieldValue("data_inici"),
            hora_inici:
                formatOptional(
                    fieldValue("hora_inici"),
                ),
            data_final:
                formatOptional(
                    fieldValue("data_final"),
                ),
            hora_final:
                formatOptional(
                    fieldValue("hora_final"),
                ),
            lloc:
                fieldValue("lloc"),
            adreca:
                formatOptional(
                    fieldValue("adreca"),
                ),
            enllac_oficial:
                formatOptional(
                    fieldValue(
                        "enllac_oficial",
                    ),
                ),
            nombre_contacto:
                fieldValue(
                    "nombre_contacto",
                ),
            email_contacto:
                fieldValue(
                    "email_contacto",
                ),
        };

        reviewFields.forEach(
            (element) => {
                const key =
                    element.dataset
                        .agendaReview;

                if (
                    key &&
                    key in values
                ) {
                    element.textContent =
                        values[key];
                }
            },
        );

        renderReviewImage();
    }

    function showStep(
        step: "form" | "review",
    ) {
        if (formStep) {
            formStep.hidden =
                step !== "form";
        }

        if (reviewStep) {
            reviewStep.hidden =
                step !== "review";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function updateSubmitState() {
        if (!submitButton) return;

        const emailVerified =
            form.dataset.emailVerified === "true";
        const privacyReady =
            Boolean(privacy?.checked);

        submitButton.disabled =
            submitting ||
            !emailVerified ||
            !privacyReady;

        const reviewValidation =
            document.getElementById(
                "agenda-review-validation",
            );

        if (!reviewValidation) return;

        let message = "";

        if (!emailVerified) {
            message =
                form.dataset.reviewEmailUnverified ?? "";
        } else if (!privacyReady) {
            message =
                form.dataset.reviewPrivacyRequired ?? "";
        }

        reviewValidation.textContent = message;
        reviewValidation.hidden =
            !message || submitting;
    }

    function setSubmitting(
        value: boolean,
    ) {
        submitting = value;

        if (submitLabel) {
            submitLabel.textContent =
                value
                    ? sendingLabel
                    : initialSubmitLabel;
        }

        updateSubmitState();
    }

    const minimumDate = todayLocal();

    if (startDate) {
        startDate.min = minimumDate;
    }

    if (endDate) {
        endDate.min = minimumDate;
    }

    startDate?.addEventListener(
        "change",
        () => {
            startDate.setCustomValidity("");

            if (
                endDate &&
                startDate.value
            ) {
                endDate.min =
                    startDate.value;

                if (
                    endDate.value &&
                    endDate.value <
                        startDate.value
                ) {
                    endDate.value = "";
                }
            }

            validateDates();
        },
    );

    endDate?.addEventListener(
        "change",
        validateDates,
    );

    startTime?.addEventListener(
        "change",
        validateDates,
    );

    endTime?.addEventListener(
        "change",
        validateDates,
    );

    imageInput?.addEventListener(
        "change",
        updateImagePreview,
    );

    imageRemove?.addEventListener(
        "click",
        removeImage,
    );

    privacy?.addEventListener(
        "change",
        updateSubmitState,
    );

    characterCounters.forEach(
        (counter) => {
            const name =
                counter.dataset
                    .agendaCounter;

            if (!name) return;

            const field =
                form.elements.namedItem(
                    name,
                );

            if (
                field instanceof
                HTMLTextAreaElement
            ) {
                field.addEventListener(
                    "input",
                    updateCharacterCounters,
                );
            }
        },
    );

    for (const field of firstStepFields) {
        field.addEventListener(
            "input",
            updateContinueState,
        );

        field.addEventListener(
            "change",
            updateContinueState,
        );
    }

    continueButton?.addEventListener(
        "click",
        () => {
            if (!validateForm()) {
                return;
            }

            renderReview();
            showStep("review");
            updateSubmitState();
        },
    );

    backButton?.addEventListener(
        "click",
        () => {
            showStep("form");
        },
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (reviewStep?.hidden) {
                return;
            }

            if (
                submitting ||
                form.dataset.emailVerified !== "true" ||
                !privacy?.checked ||
                !validateForm()
            ) {
                updateSubmitState();
                return;
            }

            const successUrl =
                form.dataset.successUrl;

            if (!successUrl) {
                return;
            }

            if (submitError) {
                submitError.hidden = true;
            }

            setSubmitting(true);

            try {
                await submitVerifiedSubmissionForm(
                    form,
                    {
                        successUrl,
                        minimumDuration:
                            3200,
                    },
                );

                clearDraft();
            } catch (error) {
                console.error(
                    "Error enviando Agenda:",
                    error,
                );

                setSubmitting(false);

                if (submitError) {
                    submitError.hidden =
                        false;

                    submitError.scrollIntoView(
                        {
                            behavior:
                                "smooth",
                            block: "center",
                        },
                    );
                }
            }
        },
    );

    window.addEventListener(
        "pageshow",
        () => {
            setSubmitting(false);

            if (submitError) {
                submitError.hidden =
                    true;
            }
        },
    );

    window.addEventListener(
        "pagehide",
        revokeImageObjectUrl,
    );

    function reconcileDraftState() {
        const minimum = todayLocal();
        if (startDate) startDate.min = minimum;
        if (endDate) endDate.min = startDate?.value || minimum;
        // No simular change: su handler puede borrar una fecha final inválida.
        if (privacy) privacy.checked = false;
        if (imageInput) imageInput.value = "";
        clearImageError();
        clearImagePreview();
        if (formStep) formStep.hidden = false;
        if (reviewStep) reviewStep.hidden = true;
        if (submitError) submitError.hidden = true;
        updateCharacterCounters();
        updateContinueState();
        updateSubmitState();
    }

    form.addEventListener("reset", (event) => {
        // El evento precede a la restauración nativa de los valores por defecto.
        queueMicrotask(() => {
            if (!event.defaultPrevented) reconcileDraftState();
        });
    });

    reconcileDraftState();
}
