type DraftValue =
    | string
    | boolean
    | string[];

type DraftState =
    Record<string, DraftValue>;

type DraftField =
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;

const FIELD_SELECTOR = [
    'input[name]:not([type="file"]):not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"]):not([type="reset"])',
    "textarea[name]",
    "select[name]",
].join(", ");

function storageKey(scope: string) {
    return `guiapineda:submission-draft:v1:${scope}`;
}

function getFields(
    form: HTMLFormElement,
): DraftField[] {
    return Array.from(
        form.querySelectorAll<DraftField>(
            FIELD_SELECTOR,
        ),
    ).filter((field) => {
        const name =
            field.name.trim().toLowerCase();
        const id =
            field.id.trim().toLowerCase();

        if (!name) return false;

        if (
            name.includes("verification") ||
            id.includes("verification")
        ) {
            return false;
        }

        if (
            name.includes("privacidad") ||
            name.includes("privacy") ||
            name.includes("privacitat") ||
            id.includes("privacy")
        ) {
            return false;
        }

        return true;
    });
}

function readDraft(
    form: HTMLFormElement,
): DraftState {
    const draft: DraftState = {};

    for (const field of getFields(form)) {
        if (field instanceof HTMLInputElement) {
            if (field.type === "radio") {
                if (field.checked) {
                    draft[field.name] =
                        field.value;
                }
                continue;
            }

            if (field.type === "checkbox") {
                draft[field.name] =
                    field.checked;
                continue;
            }
        }

        if (
            field instanceof HTMLSelectElement &&
            field.multiple
        ) {
            draft[field.name] =
                Array.from(
                    field.selectedOptions,
                ).map(
                    (option) => option.value,
                );
            continue;
        }

        draft[field.name] =
            field.value;
    }

    return draft;
}

function restoreDraft(
    form: HTMLFormElement,
    draft: DraftState,
) {
    for (const field of getFields(form)) {
        const saved =
            draft[field.name];

        if (saved === undefined) {
            continue;
        }

        if (field instanceof HTMLInputElement) {
            if (field.type === "radio") {
                field.checked =
                    typeof saved === "string" &&
                    saved === field.value;
                continue;
            }

            if (field.type === "checkbox") {
                field.checked =
                    saved === true;
                continue;
            }
        }

        if (
            field instanceof HTMLSelectElement &&
            field.multiple
        ) {
            const values =
                Array.isArray(saved)
                    ? saved
                    : [];

            for (const option of field.options) {
                option.selected =
                    values.includes(
                        option.value,
                    );
            }
            continue;
        }

        if (typeof saved === "string") {
            field.value = saved;
        }
    }
}

export function initSubmissionDraft(
    form: HTMLFormElement,
    scope: string,
) {
    const key = storageKey(scope);

    const clearDraft = () => {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // El formulario debe seguir funcionando
            // aunque el almacenamiento no esté disponible.
        }
    };

    const saveDraft = () => {
        try {
            sessionStorage.setItem(
                key,
                JSON.stringify(
                    readDraft(form),
                ),
            );
        } catch {
            // No convertir sessionStorage
            // en una dependencia funcional.
        }
    };

    try {
        const stored =
            sessionStorage.getItem(key);

        if (stored) {
            const parsed =
                JSON.parse(stored);

            if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
            ) {
                restoreDraft(
                    form,
                    parsed as DraftState,
                );
            } else {
                clearDraft();
            }
        }
    } catch {
        clearDraft();
    }

    form.addEventListener(
        "input",
        saveDraft,
    );

    form.addEventListener(
        "change",
        saveDraft,
    );

    form.addEventListener(
        "reset",
        clearDraft,
    );

    return clearDraft;
}
