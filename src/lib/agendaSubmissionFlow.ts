import { submitNetlifyForm } from "./netlifySubmission";

export function initAgendaSubmissionFlow() {
    const form =
        document.querySelector<HTMLFormElement>(
            "[data-agenda-submission-flow]",
        );

    if (!form) return;

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

    const reviewFields =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-agenda-review]",
            ),
        );

    const firstStepFields =
        Array.from(
            formStep?.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement
            >(
                "input:not([type='hidden']), textarea",
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

    function validateDates(): boolean {
        startDate?.setCustomValidity("");
        endDate?.setCustomValidity("");
        startTime?.setCustomValidity("");
        endTime?.setCustomValidity("");

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

            return false;
        }

        return true;
    }

    function validateForm(): boolean {
        if (!validateDates()) {
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

        submitButton.disabled =
            submitting ||
            !privacy?.checked;
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
                await submitNetlifyForm(
                    form,
                    {
                        successUrl,
                        minimumDuration:
                            3200,
                    },
                );
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

    updateCharacterCounters();
    updateSubmitState();
}
