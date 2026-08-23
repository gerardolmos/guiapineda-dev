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

    const idleLabel = submitLabel?.textContent?.trim() ?? "";
    const sendingLabel =
        form.dataset.sendingLabel ?? idleLabel;

    const fileSizeError =
        form.dataset.fileSizeError ??
        "The file is too large.";

    const fileTypeError =
        form.dataset.fileTypeError ??
        "Invalid file type.";

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

    form.addEventListener("submit", (event) => {
        const fileIsValid = validateFile();

        if (!fileIsValid || !form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            setSubmitting(false);
            return;
        }

        // El POST sigue siendo nativo.
        // Netlify procesará el formulario en el entorno desplegado.
        setSubmitting(true);
    });

    // Safari/Chrome pueden restaurar la página desde bfcache
    // después de volver atrás. Restauramos el botón.
    window.addEventListener("pageshow", () => {
        setSubmitting(false);
    });
}
