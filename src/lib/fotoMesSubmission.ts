import {
    initEmailVerificationController,
} from "./emailVerificationController";

import {
    submitVerifiedSubmissionForm,
} from "./netlifySubmission";

const MAX_FILE_SIZE =
    4 * 1024 * 1024;

const ALLOWED_MIME_TYPES =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

const ALLOWED_EXTENSION =
    /\.(jpe?g|png|webp)$/i;

export function initFotoMesSubmission() {
    const form =
        document.querySelector<HTMLFormElement>(
            "[data-foto-mes-submission-flow]",
        );

    if (!form) return;

    const verification =
        initEmailVerificationController(
            form,
        );

    if (!verification) {
        console.error(
            "No se ha podido inicializar la verificación de Foto del mes.",
        );

        return;
    }

    const fileInput =
        document.getElementById(
            "imatge",
        ) as HTMLInputElement | null;

    const fileError =
        document.getElementById(
            "foto-mes-file-error",
        );

    const submitButton =
        document.getElementById(
            "foto-mes-submit",
        ) as HTMLButtonElement | null;

    const submitLabel =
        document.getElementById(
            "foto-mes-submit-label",
        );

    const submitError =
        document.getElementById(
            "foto-mes-submit-error",
        );

    const verificationBlock =
        form.querySelector<HTMLElement>(
            "[data-email-verification]",
        );

    const idleLabel =
        submitLabel
            ?.textContent
            ?.trim() ?? "";

    const sendingLabel =
        form.dataset.sendingLabel ??
        idleLabel;

    const fileSizeError =
        form.dataset.fileSizeError ??
        "The file is too large.";

    const fileTypeError =
        form.dataset.fileTypeError ??
        "Invalid file type.";

    let isSubmitting = false;

    function setFileError(
        message = "",
    ) {
        if (
            !fileInput ||
            !fileError
        ) {
            return;
        }

        fileInput.setCustomValidity(
            message,
        );

        fileError.textContent =
            message;

        fileError.hidden =
            !message;
    }

    function validateFile() {
        if (!fileInput) {
            return false;
        }

        const file =
            fileInput.files?.[0];

        if (!file) {
            setFileError("");
            return false;
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            setFileError(
                fileSizeError,
            );

            return false;
        }

        const mime =
            file.type
                .trim()
                .toLowerCase();

        const mimeIsValid =
            Boolean(mime) &&
            ALLOWED_MIME_TYPES.has(
                mime,
            );

        const extensionIsValid =
            ALLOWED_EXTENSION.test(
                file.name,
            );

        if (
            !mimeIsValid ||
            !extensionIsValid
        ) {
            setFileError(
                fileTypeError,
            );

            return false;
        }

        setFileError("");

        return true;
    }

    function updateSubmitState() {
        if (!submitButton) {
            return;
        }

        submitButton.disabled =
            isSubmitting ||
            !verification.isVerified() ||
            !form.checkValidity();

        submitButton.toggleAttribute(
            "aria-busy",
            isSubmitting,
        );
    }

    function setSubmitting(
        submitting: boolean,
    ) {
        isSubmitting =
            submitting;

        updateSubmitState();

        if (submitLabel) {
            submitLabel.textContent =
                submitting
                    ? sendingLabel
                    : idleLabel;
        }
    }

    fileInput?.addEventListener(
        "change",
        () => {
            validateFile();

            if (
                !fileInput.checkValidity()
            ) {
                fileInput.reportValidity();
            }
        },
    );

    form.addEventListener(
        "input",
        updateSubmitState,
    );

    form.addEventListener(
        "change",
        updateSubmitState,
    );

    form.addEventListener(
        "guiapineda:email-verification-change",
        () => {
            updateSubmitState();

            if (submitError) {
                submitError.hidden =
                    true;
            }
        },
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (submitError) {
                submitError.hidden =
                    true;
            }

            if (
                !validateFile() ||
                !form.checkValidity()
            ) {
                form.reportValidity();
                setSubmitting(false);
                return;
            }

            if (
                !verification.isVerified()
            ) {
                verificationBlock
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "center",
                    });

                updateSubmitState();

                return;
            }

            if (isSubmitting) {
                return;
            }

            const successUrl =
                form.dataset.successUrl;

            if (!successUrl) {
                console.error(
                    "Falta data-success-url en Foto del mes.",
                );

                if (submitError) {
                    submitError.hidden =
                        false;
                }

                return;
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
            } catch (error) {
                console.error(
                    "Error enviando Foto del mes:",
                    error,
                );

                setSubmitting(false);

                if (submitError) {
                    submitError.hidden =
                        false;

                    submitError.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "center",
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

    updateSubmitState();
}
