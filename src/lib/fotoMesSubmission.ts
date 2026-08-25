import { submitNetlifyForm } from "./netlifySubmission";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const ALLOWED_EXTENSION = /\.(jpe?g|png|webp)$/i;

export function initFotoMesSubmission() {
    const form = document.getElementById(
        "foto-del-mes-form",
    ) as HTMLFormElement | null;

    if (!form) return;

    const fileInput = document.getElementById(
        "foto",
    ) as HTMLInputElement | null;

    const fileError = document.getElementById(
        "foto-mes-file-error",
    );

    const submitButton = document.getElementById(
        "foto-mes-submit",
    ) as HTMLButtonElement | null;

    const submitLabel = document.getElementById(
        "foto-mes-submit-label",
    );

    const submitError = document.getElementById(
        "foto-mes-submit-error",
    );

    const idleLabel = submitLabel?.textContent?.trim() ?? "";
    const sendingLabel =
        form.dataset.sendingLabel ?? idleLabel;

    const fileSizeError =
        form.dataset.fileSizeError ??
        "The file is too large.";

    const fileTypeError =
        form.dataset.fileTypeError ??
        "Invalid file type.";

    let isSubmitting = false;

    function setFileError(message = "") {
        if (!fileInput || !fileError) return;

        fileInput.setCustomValidity(message);
        fileError.textContent = message;
        fileError.hidden = !message;
    }

    function validateFile() {
        if (!fileInput) return true;

        const file = fileInput.files?.[0];

        if (!file) {
            setFileError("");
            return true;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFileError(fileSizeError);
            return false;
        }

        const mimeIsValid =
            !file.type || ALLOWED_MIME_TYPES.has(file.type);

        const extensionIsValid =
            ALLOWED_EXTENSION.test(file.name);

        if (!mimeIsValid || !extensionIsValid) {
            setFileError(fileTypeError);
            return false;
        }

        setFileError("");
        return true;
    }

    function setSubmitting(submitting: boolean) {
        isSubmitting = submitting;

        if (submitButton) {
            submitButton.disabled = submitting;
            submitButton.toggleAttribute(
                "aria-busy",
                submitting,
            );
        }

        if (submitLabel) {
            submitLabel.textContent = submitting
                ? sendingLabel
                : idleLabel;
        }
    }

    fileInput?.addEventListener("change", () => {
        validateFile();

        if (!fileInput.checkValidity()) {
            fileInput.reportValidity();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (submitError) {
            submitError.hidden = true;
        }

        const fileIsValid = validateFile();

        if (!fileIsValid || !form.checkValidity()) {
            form.reportValidity();
            setSubmitting(false);
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
                submitError.hidden = false;
            }

            return;
        }

        setSubmitting(true);

        try {
            await submitNetlifyForm(form, {
                successUrl,
                minimumDuration: 3200,
            });
        } catch (error) {
            console.error(
                "Error enviando Foto del mes:",
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

    // Safari/Chrome pueden restaurar la página desde bfcache
    // después de volver atrás. Restauramos el botón.
    window.addEventListener("pageshow", () => {
        setSubmitting(false);

        if (submitError) {
            submitError.hidden = true;
        }
    });
}
