export function initCommunicatSubmissionFlow() {
    const root = document.querySelector<HTMLElement>(
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
            'input[name="comunicat-sender-type"]',
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

    const contactName = document.getElementById(
        "comunicat-contact-name",
    ) as HTMLInputElement | null;
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
    const prototypeNote = document.getElementById(
        "comunicat-prototype-note",
    );

    let imageUrl = "";

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

        const ready = Boolean(
            titleInput?.value.trim() &&
                summaryInput?.value.trim() &&
                contentInput?.value.trim(),
        );

        contentContinue?.toggleAttribute("disabled", !ready);
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

    function setImage(file?: File) {
        if (!file) return;

        revokeImageUrl();
        imageUrl = URL.createObjectURL(file);

        if (imagePreview) imagePreview.src = imageUrl;
        if (liveImage) liveImage.src = imageUrl;

        if (imageEmpty) imageEmpty.hidden = true;
        if (imageSelected) imageSelected.hidden = false;
        if (liveImageWrap) liveImageWrap.hidden = false;
    }

    function clearImage() {
        revokeImageUrl();

        if (imageInput) imageInput.value = "";
        if (imagePreview) imagePreview.removeAttribute("src");
        if (liveImage) liveImage.removeAttribute("src");

        if (imageEmpty) imageEmpty.hidden = false;
        if (imageSelected) imageSelected.hidden = true;
        if (liveImageWrap) liveImageWrap.hidden = true;
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
            contactName?.value.trim() &&
                contactEmail?.value.trim() &&
                contactEmail.checkValidity() &&
                privacy?.checked,
        );

        reviewSend?.toggleAttribute("disabled", !ready);

        if (prototypeNote) {
            prototypeNote.hidden = true;
        }
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
    });

    imageRemove?.addEventListener("click", clearImage);

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

    contactName?.addEventListener("input", updateReviewState);
    contactEmail?.addEventListener("input", updateReviewState);
    privacy?.addEventListener("change", updateReviewState);

    reviewSend?.addEventListener("click", () => {
        if (reviewSend.hasAttribute("disabled")) return;

        if (prototypeNote) {
            prototypeNote.hidden = false;
            prototypeNote.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    });

    updateAuthorState();
    updateContentState();
    updateReviewState();

    window.addEventListener("beforeunload", revokeImageUrl);
}
