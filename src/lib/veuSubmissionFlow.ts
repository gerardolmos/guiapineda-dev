import { initEmailVerificationController } from "./emailVerificationController";
import { submitNetlifyForm } from "./netlifySubmission";

export function initVeuSubmissionFlow() {
    const form =
        document.querySelector<HTMLFormElement>(
            "[data-veu-submission-flow]",
        );

    if (!form) return;

    initEmailVerificationController(
        form,
    );

    const formStep =
        document.getElementById(
            "veu-step-form",
        );

    const reviewStep =
        document.getElementById(
            "veu-step-review",
        );

    const continueButton =
        document.getElementById(
            "veu-continue",
        ) as HTMLButtonElement | null;

    const backButton =
        document.getElementById(
            "veu-review-back",
        ) as HTMLButtonElement | null;

    const submitButton =
        document.getElementById(
            "veu-submit",
        ) as HTMLButtonElement | null;

    const submitLabel =
        document.getElementById(
            "veu-submit-label",
        );

    const submitError =
        document.getElementById(
            "veu-submit-error",
        );

    const privacy =
        document.getElementById(
            "veu-privacy",
        ) as HTMLInputElement | null;

    const imageInput =
        document.getElementById(
            "veu-image-input",
        ) as HTMLInputElement | null;

    const imageEmpty =
        document.getElementById(
            "veu-image-empty",
        );

    const imageSelected =
        document.getElementById(
            "veu-image-selected",
        );

    const imagePreview =
        document.getElementById(
            "veu-image-preview",
        ) as HTMLImageElement | null;

    const imageName =
        document.getElementById(
            "veu-image-name",
        );

    const imageRemove =
        document.getElementById(
            "veu-image-remove",
        ) as HTMLButtonElement | null;

    const imageError =
        document.getElementById(
            "veu-image-error",
        );

    const reviewImageCard =
        document.getElementById(
            "veu-review-image-card",
        );

    const reviewImage =
        document.getElementById(
            "veu-review-image",
        ) as HTMLImageElement | null;

    const reviewFields =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-veu-review]",
            ),
        );

    const firstStepFields =
        Array.from(
            formStep?.querySelectorAll<
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement
            >(
                "input:not([type='hidden']):not([type='file']), textarea, select",
            ) ?? [],
        );

    const counters =
        Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-veu-counter]",
            ),
        );

    const sendingLabel =
        form.dataset.sendingLabel ??
        "Sending...";

    const initialSubmitLabel =
        submitLabel?.textContent?.trim() ??
        "";

    const MAX_IMAGE_SIZE =
        2 * 1024 * 1024;

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

    function clearImageError() {
        imageInput?.setCustomValidity("");

        if (imageError) {
            imageError.hidden = true;
            imageError.textContent = "";
        }
    }

    function showImageError(
        message: string,
    ) {
        imageInput?.setCustomValidity(
            message,
        );

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

        if (!file) return true;

        const message =
            imageValidationMessage(
                file,
            );

        if (!message) return true;

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

    function validateForm(): boolean {
        if (!validateImage(true)) {
            return false;
        }

        for (
            const field of firstStepFields
        ) {
            if (!field.checkValidity()) {
                field.reportValidity();
                field.focus();
                return false;
            }
        }

        return true;
    }

    function updateCounters() {
        counters.forEach(
            (counter) => {
                const name =
                    counter.dataset
                        .veuCounter;

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
                    "text-violet-700",
                    ready,
                );

                counter.classList.toggle(
                    "text-slate-400",
                    !ready,
                );
            },
        );
    }

    function fieldValue(
        name: string,
    ): string {
        const field =
            form.elements.namedItem(name);

        if (
            field instanceof
                HTMLInputElement ||
            field instanceof
                HTMLTextAreaElement ||
            field instanceof
                HTMLSelectElement
        ) {
            return field.value.trim();
        }

        return "";
    }

    function authorshipLabel(
        value: string,
    ): string {
        const select =
            form.elements.namedItem(
                "tipo_autoria",
            );

        if (
            select instanceof
            HTMLSelectElement
        ) {
            const option =
                Array.from(
                    select.options,
                ).find(
                    (item) =>
                        item.value ===
                        value,
                );

            return (
                option?.textContent?.trim() ??
                value
            );
        }

        return value;
    }

    function renderReview() {
        const type =
            fieldValue(
                "tipo_autoria",
            );

        const values:
            Record<string, string> = {
            titol:
                fieldValue("titol"),
            resum:
                fieldValue("resum"),
            contingut:
                fieldValue(
                    "contingut",
                ),
            tipo_autoria:
                authorshipLabel(type),
            autor_public:
                fieldValue(
                    "autor_public",
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
                        .veuReview;

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

    counters.forEach(
        (counter) => {
            const name =
                counter.dataset
                    .veuCounter;

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
                    updateCounters,
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

            if (!successUrl) return;

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
                    "Error enviando Veu:",
                    error,
                );

                setSubmitting(false);

                if (submitError) {
                    submitError.hidden =
                        false;

                    submitError
                        .scrollIntoView({
                            behavior:
                                "smooth",
                            block: "center",
                        });
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

    updateCounters();
    updateSubmitState();
}
