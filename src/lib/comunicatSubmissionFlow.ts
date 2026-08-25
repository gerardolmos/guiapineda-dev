import { submitNetlifyForm } from "./netlifySubmission";

export function initCommunicatSubmissionFlow() {
    const root = document.querySelector<HTMLFormElement>(
        "[data-comunicat-submission-flow]",
    );

    if (!root) return;

    const authorStep = document.getElementById("comunicat-step-author");
    const contentStep = document.getElementById("comunicat-step-content");
    const reviewStep = document.getElementById("comunicat-step-review");

    const authorHeading = document.getElementById(
        "comunicat-author-heading",
    ) as HTMLElement | null;
    const contentHeading = document.getElementById(
        "comunicat-content-heading",
    ) as HTMLElement | null;
    const reviewHeading = document.getElementById(
        "comunicat-review-title",
    ) as HTMLElement | null;

    const senderRadios = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input[name="tipus_remitent"]',
        ),
    );
    const authorInput = document.getElementById(
        "comunicat-author",
    ) as HTMLInputElement | null;
    const authorContinue = document.getElementById(
        "comunicat-author-continue",
    ) as HTMLButtonElement | null;

    const titleInput = document.getElementById(
        "comunicat-title",
    ) as HTMLInputElement | null;
    const summaryInput = document.getElementById(
        "comunicat-summary",
    ) as HTMLTextAreaElement | null;
    const contentInput = document.getElementById(
        "comunicat-content",
    ) as HTMLTextAreaElement | null;

    const titleCount = document.getElementById("comunicat-title-count");
    const summaryCount = document.getElementById("comunicat-summary-count");
    const contentCount = document.getElementById("comunicat-content-count");

    const titleMeta = document.getElementById("comunicat-title-meta");
    const summaryMeta = document.getElementById("comunicat-summary-meta");
    const contentMeta = document.getElementById("comunicat-content-meta");

    const contentBack = document.getElementById(
        "comunicat-content-back",
    ) as HTMLButtonElement | null;
    const contentContinue = document.getElementById(
        "comunicat-content-continue",
    ) as HTMLButtonElement | null;

    const imageInput = document.getElementById(
        "comunicat-image-input",
    ) as HTMLInputElement | null;
    const imageEmpty = document.getElementById("comunicat-image-empty");
    const imageSelected = document.getElementById(
        "comunicat-image-selected",
    );
    const imagePreview = document.getElementById(
        "comunicat-image-preview",
    ) as HTMLImageElement | null;
    const imageRemove = document.getElementById(
        "comunicat-image-remove",
    ) as HTMLButtonElement | null;

    const imageError = document.getElementById(
        "comunicat-image-error",
    );

    const liveAuthor = document.getElementById("comunicat-live-author");
    const liveTitle = document.getElementById("comunicat-live-title");
    const liveSummary = document.getElementById("comunicat-live-summary");
    const liveReading = document.getElementById("comunicat-live-reading");
    const liveImageWrap = document.getElementById(
        "comunicat-live-image-wrap",
    );
    const liveImage = document.getElementById(
        "comunicat-live-image",
    ) as HTMLImageElement | null;

    const reviewType = document.getElementById("comunicat-review-type");
    const reviewAuthor = document.getElementById("comunicat-review-author");
    const reviewTitle = document.getElementById("comunicat-review-title");
    const reviewSummary = document.getElementById("comunicat-review-summary");
    const reviewContent = document.getElementById("comunicat-review-content");
    const reviewReading = document.getElementById(
        "comunicat-review-reading",
    );
    const reviewImageWrap = document.getElementById(
        "comunicat-review-image-wrap",
    );
    const reviewImage = document.getElementById(
        "comunicat-review-image",
    ) as HTMLImageElement | null;

    const contactEmail = document.getElementById(
        "comunicat-contact-email",
    ) as HTMLInputElement | null;
    const privacy = document.getElementById(
        "comunicat-privacy",
    ) as HTMLInputElement | null;
    const reviewBack = document.getElementById(
        "comunicat-review-back",
    ) as HTMLButtonElement | null;
    const reviewSend = document.getElementById(
        "comunicat-review-send",
    ) as HTMLButtonElement | null;

    const submitLabel = document.getElementById(
        "comunicat-submit-label",
    );

    const submitError = document.getElementById(
        "comunicat-submit-error",
    );

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

    const ALLOWED_IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;

    const idleSubmitLabel =
        submitLabel?.textContent?.trim() ?? "";

    const sendingLabel =
        root.dataset.sendingLabel ?? idleSubmitLabel;

    const fileSizeError =
        root.dataset.fileSizeError ??
        "The image is too large.";

    const fileTypeError =
        root.dataset.fileTypeError ??
        "Invalid image type.";

    let imageUrl = "";
    let isSubmitting = false;

    function selectedSender() {
        return senderRadios.find((radio) => radio.checked) ?? null;
    }

    function senderLabel() {
        return selectedSender()?.dataset.label ?? "";
    }

    function readingMinutes() {
        const words =
            contentInput?.value
                .trim()
                .split(/\s+/)
                .filter(Boolean).length ?? 0;

        return Math.max(1, Math.ceil(words / 200));
    }

    function updateAuthorState() {
        const ready = Boolean(
            selectedSender() &&
                authorInput?.value.trim().length,
        );

        authorContinue?.toggleAttribute("disabled", !ready);
        updateLivePreview();
    }

    function updateContentState() {
        if (titleCount && titleInput) {
            titleCount.textContent = String(titleInput.value.length);
        }

        if (summaryCount && summaryInput) {
            summaryCount.textContent = String(summaryInput.value.length);
        }

        if (contentCount && contentInput) {
            contentCount.textContent = String(contentInput.value.length);
        }

        const titleReady =
            (titleInput?.value.trim().length ?? 0) >= 8;

        const summaryReady =
            (summaryInput?.value.trim().length ?? 0) >= 30;

        const contentReady =
            (contentInput?.value.trim().length ?? 0) >= 80;

        [
            [titleMeta, titleReady],
            [summaryMeta, summaryReady],
            [contentMeta, contentReady],
        ].forEach(([element, valid]) => {
            if (!(element instanceof HTMLElement)) return;

            element.classList.toggle(
                "text-slate-400",
                !valid,
            );

            element.classList.toggle(
                "text-emerald-700",
                Boolean(valid),
            );
        });

        // La imagen es opcional y nunca bloquea
        // el avance del formulario.
        const ready =
            titleReady &&
            summaryReady &&
            contentReady;

        contentContinue?.toggleAttribute(
            "disabled",
            !ready,
        );

        updateLivePreview();
    }

    function updateLivePreview() {
        if (liveAuthor) {
            liveAuthor.textContent = authorInput?.value.trim() ?? "";
        }

        if (liveTitle && titleInput?.value.trim()) {
            liveTitle.textContent = titleInput.value.trim();
        }

        if (liveSummary && summaryInput?.value.trim()) {
            liveSummary.textContent = summaryInput.value.trim();
        }

        if (liveReading) {
            liveReading.textContent = String(readingMinutes());
        }
    }

    function revokeImageUrl() {
        if (!imageUrl) return;

        URL.revokeObjectURL(imageUrl);
        imageUrl = "";
    }

    function setImageError(message = "") {
        if (!imageInput || !imageError) return;

        imageInput.setCustomValidity(message);
        imageError.textContent = message;
        imageError.hidden = !message;
    }

    function validateImage(file?: File) {
        if (!file) {
            // Sin imagen es un estado válido: la imagen es opcional.
            // Limpiamos la validez nativa sin ocultar necesariamente
            // el último aviso informativo mostrado al usuario.
            imageInput?.setCustomValidity("");
            return true;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setImageError(fileSizeError);
            return false;
        }

        const mimeIsValid =
            !file.type || ALLOWED_IMAGE_TYPES.has(file.type);

        const extensionIsValid =
            ALLOWED_IMAGE_EXTENSION.test(file.name);

        if (!mimeIsValid || !extensionIsValid) {
            setImageError(fileTypeError);
            return false;
        }

        setImageError("");
        return true;
    }

    function resetImagePreview() {
        revokeImageUrl();

        if (imagePreview) imagePreview.removeAttribute("src");
        if (liveImage) liveImage.removeAttribute("src");

        if (imageEmpty) imageEmpty.hidden = false;
        if (imageSelected) imageSelected.hidden = true;
        if (liveImageWrap) liveImageWrap.hidden = true;
    }

    function setImage(file?: File) {
        if (!file) {
            resetImagePreview();
            setImageError("");
            return;
        }

        if (!validateImage(file)) {
            resetImagePreview();

            // La imagen es opcional. Rechazamos el archivo,
            // pero mantenemos visible el mensaje que explica
            // por qué no se ha aceptado.
            if (imageInput) {
                imageInput.value = "";
                imageInput.setCustomValidity("");
            }

            return;
        }

        resetImagePreview();

        imageUrl = URL.createObjectURL(file);

        if (imagePreview) imagePreview.src = imageUrl;
        if (liveImage) liveImage.src = imageUrl;

        if (imageEmpty) imageEmpty.hidden = true;
        if (imageSelected) imageSelected.hidden = false;
        if (liveImageWrap) liveImageWrap.hidden = false;
    }

    function clearImage() {
        resetImagePreview();

        if (imageInput) {
            imageInput.value = "";
        }

        setImageError("");
    }

    function renderReview() {
        if (reviewType) reviewType.textContent = senderLabel();
        if (reviewAuthor) {
            reviewAuthor.textContent = authorInput?.value.trim() ?? "";
        }
        if (reviewTitle) {
            reviewTitle.textContent = titleInput?.value.trim() ?? "";
        }
        if (reviewSummary) {
            reviewSummary.textContent = summaryInput?.value.trim() ?? "";
        }
        if (reviewContent) {
            reviewContent.textContent = contentInput?.value.trim() ?? "";
        }
        if (reviewReading) {
            reviewReading.textContent = String(readingMinutes());
        }

        if (imageUrl && reviewImage && reviewImageWrap) {
            reviewImage.src = imageUrl;
            reviewImageWrap.hidden = false;
        } else if (reviewImageWrap) {
            reviewImageWrap.hidden = true;
        }

        updateReviewState();
    }

    function updateReviewState() {
        const ready = Boolean(
            contactEmail?.value.trim() &&
                contactEmail.checkValidity() &&
                privacy?.checked,
        );

        reviewSend?.toggleAttribute(
            "disabled",
            !ready || isSubmitting,
        );
    }

    function setSubmitting(submitting: boolean) {
        isSubmitting = submitting;

        if (reviewSend) {
            reviewSend.toggleAttribute(
                "aria-busy",
                submitting,
            );
        }

        if (submitLabel) {
            submitLabel.textContent = submitting
                ? sendingLabel
                : idleSubmitLabel;
        }

        updateReviewState();
    }

    function showStep(
        target: "author" | "content" | "review",
    ) {
        if (authorStep) authorStep.hidden = target !== "author";
        if (contentStep) contentStep.hidden = target !== "content";
        if (reviewStep) reviewStep.hidden = target !== "review";

        const heading =
            target === "author"
                ? authorHeading
                : target === "content"
                  ? contentHeading
                  : reviewHeading;

        requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            setTimeout(() => heading?.focus(), 250);
        });
    }

    senderRadios.forEach((radio) => {
        radio.addEventListener("change", updateAuthorState);
    });

    authorInput?.addEventListener("input", updateAuthorState);

    titleInput?.addEventListener("input", updateContentState);
    summaryInput?.addEventListener("input", updateContentState);
    contentInput?.addEventListener("input", updateContentState);

    imageInput?.addEventListener("change", () => {
        setImage(imageInput.files?.[0]);
        updateContentState();
    });

    imageRemove?.addEventListener("click", () => {
        clearImage();
        updateContentState();
    });

    authorContinue?.addEventListener("click", () => {
        if (authorContinue.hasAttribute("disabled")) return;
        updateLivePreview();
        showStep("content");
    });

    contentBack?.addEventListener("click", () => {
        showStep("author");
    });

    contentContinue?.addEventListener("click", () => {
        if (contentContinue.hasAttribute("disabled")) return;
        renderReview();
        showStep("review");
    });

    reviewBack?.addEventListener("click", () => {
        showStep("content");
    });

    document
        .querySelectorAll<HTMLButtonElement>("[data-comunicat-edit]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.comunicatEdit;

                if (target === "author") {
                    showStep("author");
                }

                if (target === "content") {
                    showStep("content");
                }
            });
        });

    contactEmail?.addEventListener("input", updateReviewState);
    privacy?.addEventListener("change", updateReviewState);

    root.addEventListener("submit", async (event) => {
        // A partir de aquí el envío siempre lo controla
        // nuestra capa AJAX.
        event.preventDefault();

        if (submitError) {
            submitError.hidden = true;
        }

        // Un Enter accidental no debe enviar el formulario
        // antes de llegar a la revisión.
        if (reviewStep?.hidden) {
            return;
        }

        const senderReady = Boolean(
            selectedSender() &&
                authorInput?.value.trim(),
        );

        const titleReady =
            (titleInput?.value.trim().length ?? 0) >= 8;

        const summaryReady =
            (summaryInput?.value.trim().length ?? 0) >= 30;

        const contentReady =
            (contentInput?.value.trim().length ?? 0) >= 80;

        const contactReady = Boolean(
            contactEmail?.value.trim() &&
                contactEmail.checkValidity() &&
                privacy?.checked,
        );

        const imageIsValid = validateImage(
            imageInput?.files?.[0],
        );

        if (
            !senderReady ||
            !titleReady ||
            !summaryReady ||
            !contentReady ||
            !contactReady ||
            !imageIsValid
        ) {
            setSubmitting(false);

            if (
                !titleReady ||
                !summaryReady ||
                !contentReady ||
                !imageIsValid
            ) {
                showStep("content");
                updateContentState();

                if (!imageIsValid) {
                    imageError?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }

            return;
        }

        if (isSubmitting) {
            return;
        }

        const successUrl =
            root.dataset.successUrl;

        if (!successUrl) {
            console.error(
                "Falta data-success-url en el formulario.",
            );

            if (submitError) {
                submitError.hidden = false;
            }

            return;
        }

        setSubmitting(true);

        try {
            await submitNetlifyForm(root, {
                successUrl,
                minimumDuration: 3200,
            });
        } catch (error) {
            console.error(
                "Error enviando el comunicado:",
                error,
            );

            setSubmitting(false);

            if (submitError) {
                submitError.hidden = false;
                submitError.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    });

    updateAuthorState();
    updateContentState();
    updateReviewState();

    window.addEventListener("pageshow", () => {
        setSubmitting(false);
    });

    window.addEventListener("beforeunload", revokeImageUrl);
}
