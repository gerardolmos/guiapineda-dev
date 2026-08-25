import { submitNetlifyForm } from "./netlifySubmission";

export function initMilloraSubmissionFlow() {
    const root = document.querySelector<HTMLFormElement>(
        "[data-millora-submission-flow]",
    );

    if (!root) return;

    const stepContext = document.getElementById("millora-step-context");
    const stepContent = document.getElementById("millora-step-content");
    const stepReview = document.getElementById("millora-step-review");

    const contextHeading = document.getElementById(
        "millora-context-heading",
    );
    const contentHeading = document.getElementById(
        "millora-content-heading",
    );
    const reviewHeading = document.getElementById(
        "millora-review-heading",
    );

    const categoryRadios = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input[name="millora-category"]',
        ),
    );

    const zoneSelect = document.getElementById(
        "millora-zone",
    ) as HTMLSelectElement | null;

    const authorRadios = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input[name="millora-author-type"]',
        ),
    );

    const aliasWrap = document.getElementById("millora-alias-wrap");

    const aliasInput = document.getElementById(
        "millora-alias",
    ) as HTMLInputElement | null;

    const contextContinue = document.getElementById(
        "millora-context-continue",
    ) as HTMLButtonElement | null;

    const titleInput = document.getElementById(
        "millora-title",
    ) as HTMLInputElement | null;

    const summaryInput = document.getElementById(
        "millora-summary",
    ) as HTMLTextAreaElement | null;

    const contentInput = document.getElementById(
        "millora-content",
    ) as HTMLTextAreaElement | null;

    const titleCount = document.getElementById("millora-title-count");
    const summaryCount = document.getElementById("millora-summary-count");
    const contentCount = document.getElementById("millora-content-count");

    const titleMeta = document.getElementById("millora-title-meta");
    const summaryMeta = document.getElementById("millora-summary-meta");
    const contentMeta = document.getElementById("millora-content-meta");

    const contentBack = document.getElementById(
        "millora-content-back",
    ) as HTMLButtonElement | null;

    const contentContinue = document.getElementById(
        "millora-content-continue",
    ) as HTMLButtonElement | null;

    const imageInput = document.getElementById(
        "millora-image-input",
    ) as HTMLInputElement | null;

    const imageEmpty = document.getElementById("millora-image-empty");
    const imageSelected = document.getElementById(
        "millora-image-selected",
    );

    const imagePreview = document.getElementById(
        "millora-image-preview",
    ) as HTMLImageElement | null;

    const imageRemove = document.getElementById(
        "millora-image-remove",
    ) as HTMLButtonElement | null;

    const liveImageWrap = document.getElementById(
        "millora-live-image-wrap",
    );

    const liveImage = document.getElementById(
        "millora-live-image",
    ) as HTMLImageElement | null;

    const liveCategory = document.getElementById(
        "millora-live-category",
    );

    const liveZone = document.getElementById("millora-live-zone");
    const liveAuthor = document.getElementById("millora-live-author");
    const liveTitle = document.getElementById("millora-live-title");
    const liveSummary = document.getElementById("millora-live-summary");
    const liveReading = document.getElementById("millora-live-reading");

    const reviewCategory = document.getElementById(
        "millora-review-category",
    );

    const reviewZone = document.getElementById("millora-review-zone");
    const reviewAuthor = document.getElementById("millora-review-author");
    const reviewTitle = document.getElementById("millora-review-title");
    const reviewSummary = document.getElementById("millora-review-summary");
    const reviewContent = document.getElementById("millora-review-content");
    const reviewReading = document.getElementById("millora-review-reading");

    const reviewImageWrap = document.getElementById(
        "millora-review-image-wrap",
    );

    const reviewImage = document.getElementById(
        "millora-review-image",
    ) as HTMLImageElement | null;

    const reviewBack = document.getElementById(
        "millora-review-back",
    ) as HTMLButtonElement | null;

    const reviewSend = document.getElementById(
        "millora-review-send",
    ) as HTMLButtonElement | null;

    const submitLabel = document.getElementById(
        "millora-submit-label",
    );

    const submitError = document.getElementById(
        "millora-submit-error",
    );

    const imageError = document.getElementById(
        "millora-image-error",
    );

    const sendingLabel =
        root.dataset.sendingLabel ?? "Sending...";

    const defaultSubmitLabel =
        submitLabel?.textContent?.trim() ?? "";

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

    const ALLOWED_IMAGE_EXTENSION =
        /\.(?:jpe?g|png|webp)$/i;

    let imageUrl = "";
    let isSubmitting = false;

    function selectedCategory() {
        return categoryRadios.find((radio) => radio.checked) ?? null;
    }

    function selectedAuthorType() {
        return authorRadios.find((radio) => radio.checked) ?? null;
    }

    function categoryLabel() {
        return selectedCategory()?.dataset.label ?? "";
    }

    function zoneLabel() {
        if (!zoneSelect?.value) return "";

        return (
            zoneSelect.selectedOptions[0]?.textContent?.trim() ?? ""
        );
    }

    function authorLabel() {
        const selected = selectedAuthorType();

        if (!selected) return "";

        if (selected.value === "alias") {
            return aliasInput?.value.trim() ?? "";
        }

        return selected.dataset.label ?? "";
    }

    function readingMinutes() {
        const words =
            contentInput?.value
                .trim()
                .split(/\s+/)
                .filter(Boolean).length ?? 0;

        return Math.max(1, Math.ceil(words / 200));
    }

    function updateContextState() {
        const authorType = selectedAuthorType();

        if (aliasWrap) {
            aliasWrap.hidden = authorType?.value !== "alias";
        }

        const authorReady =
            authorType?.value === "alias"
                ? Boolean(aliasInput?.value.trim())
                : Boolean(authorType);

        const ready = Boolean(
            selectedCategory() &&
                zoneSelect?.value &&
                authorReady,
        );

        contextContinue?.toggleAttribute("disabled", !ready);
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

            element.classList.toggle("text-slate-400", !valid);
            element.classList.toggle("text-emerald-700", Boolean(valid));
        });

        const ready =
            titleReady && summaryReady && contentReady;

        contentContinue?.toggleAttribute("disabled", !ready);
        updateLivePreview();
    }

    function updateLivePreview() {
        if (liveCategory) {
            liveCategory.textContent = categoryLabel();
        }

        if (liveZone) {
            liveZone.textContent = zoneLabel();
        }

        if (liveAuthor) {
            liveAuthor.textContent = authorLabel();
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

    function showImageError(message = "") {
        if (!imageError) return;

        imageError.textContent = message;
        imageError.hidden = !message;
    }

    function resetImagePreview() {
        revokeImageUrl();

        if (imagePreview) {
            imagePreview.removeAttribute("src");
        }

        if (liveImage) {
            liveImage.removeAttribute("src");
        }

        if (imageEmpty) {
            imageEmpty.hidden = false;
        }

        if (imageSelected) {
            imageSelected.hidden = true;
        }

        if (liveImageWrap) {
            liveImageWrap.hidden = true;
        }
    }

    function validateImage(file?: File) {
        if (!file) {
            imageInput?.setCustomValidity("");
            return true;
        }

        const typeIsValid =
            ALLOWED_IMAGE_TYPES.has(file.type) ||
            (
                !file.type &&
                ALLOWED_IMAGE_EXTENSION.test(file.name)
            );

        if (!typeIsValid) {
            showImageError(
                root.dataset.fileTypeError ??
                    "Invalid image format.",
            );

            imageInput?.setCustomValidity(
                "Invalid image format.",
            );

            return false;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            showImageError(
                root.dataset.fileSizeError ??
                    "Image is too large.",
            );

            imageInput?.setCustomValidity(
                "Image is too large.",
            );

            return false;
        }

        imageInput?.setCustomValidity("");
        showImageError();

        return true;
    }

    function setImage(file?: File) {
        if (!file) {
            imageInput?.setCustomValidity("");
            showImageError();
            return;
        }

        if (!validateImage(file)) {
            resetImagePreview();

            if (imageInput) {
                imageInput.value = "";
                imageInput.setCustomValidity("");
            }

            return;
        }

        revokeImageUrl();

        imageUrl = URL.createObjectURL(file);

        if (imagePreview) {
            imagePreview.src = imageUrl;
        }

        if (liveImage) {
            liveImage.src = imageUrl;
        }

        if (imageEmpty) {
            imageEmpty.hidden = true;
        }

        if (imageSelected) {
            imageSelected.hidden = false;
        }

        if (liveImageWrap) {
            liveImageWrap.hidden = false;
        }
    }

    function clearImage() {
        if (imageInput) {
            imageInput.value = "";
            imageInput.setCustomValidity("");
        }

        showImageError();
        resetImagePreview();
    }

    function renderReview() {
        if (reviewCategory) {
            reviewCategory.textContent = categoryLabel();
        }

        if (reviewZone) {
            reviewZone.textContent = zoneLabel();
        }

        if (reviewAuthor) {
            reviewAuthor.textContent = authorLabel();
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
    }

    function setSubmitting(submitting: boolean) {
        isSubmitting = submitting;

        if (reviewSend) {
            reviewSend.disabled = submitting;
            reviewSend.setAttribute(
                "aria-busy",
                String(submitting),
            );
        }

        if (submitLabel) {
            submitLabel.textContent = submitting
                ? sendingLabel
                : defaultSubmitLabel;
        }
    }

    function showStep(
        target: "context" | "content" | "review",
    ) {
        if (stepContext) stepContext.hidden = target !== "context";
        if (stepContent) stepContent.hidden = target !== "content";
        if (stepReview) stepReview.hidden = target !== "review";

        const heading =
            target === "context"
                ? contextHeading
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

    categoryRadios.forEach((radio) => {
        radio.addEventListener("change", updateContextState);
    });

    authorRadios.forEach((radio) => {
        radio.addEventListener("change", updateContextState);
    });

    zoneSelect?.addEventListener("change", updateContextState);
    aliasInput?.addEventListener("input", updateContextState);

    titleInput?.addEventListener("input", updateContentState);
    summaryInput?.addEventListener("input", updateContentState);
    contentInput?.addEventListener("input", updateContentState);

    imageInput?.addEventListener("change", () => {
        setImage(imageInput.files?.[0]);
    });

    imageRemove?.addEventListener("click", clearImage);

    contextContinue?.addEventListener("click", () => {
        if (contextContinue.hasAttribute("disabled")) return;

        updateLivePreview();
        showStep("content");
    });

    contentBack?.addEventListener("click", () => {
        showStep("context");
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
        .querySelectorAll<HTMLButtonElement>("[data-millora-edit]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.milloraEdit;

                if (target === "context") {
                    showStep("context");
                }

                if (target === "content") {
                    showStep("content");
                }
            });
        });

    root.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (submitError) {
            submitError.hidden = true;
        }

        // Un Enter accidental en pasos anteriores
        // no debe disparar el envío final.
        if (stepReview?.hidden) {
            return;
        }

        const authorType = selectedAuthorType();

        const authorReady =
            authorType?.value === "alias"
                ? Boolean(aliasInput?.value.trim())
                : Boolean(authorType);

        const contextReady = Boolean(
            selectedCategory() &&
                zoneSelect?.value &&
                authorReady,
        );

        const titleReady =
            (titleInput?.value.trim().length ?? 0) >= 8;

        const summaryReady =
            (summaryInput?.value.trim().length ?? 0) >= 30;

        const contentReady =
            (contentInput?.value.trim().length ?? 0) >= 80;

        const imageIsValid = validateImage(
            imageInput?.files?.[0],
        );

        if (
            !contextReady ||
            !titleReady ||
            !summaryReady ||
            !contentReady ||
            !imageIsValid
        ) {
            setSubmitting(false);

            if (!contextReady) {
                showStep("context");
                updateContextState();
                return;
            }

            showStep("content");
            updateContentState();

            if (!imageIsValid) {
                imageError?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
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
                "Falta data-success-url en Millorem.",
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
                "Error enviando Millorem:",
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

    window.addEventListener("pageshow", () => {
        setSubmitting(false);

        if (submitError) {
            submitError.hidden = true;
        }
    });

    updateContextState();
    updateContentState();

    window.addEventListener("beforeunload", revokeImageUrl);
}
