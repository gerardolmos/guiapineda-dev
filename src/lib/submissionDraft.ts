type DraftState = Record<string, string>;

type DraftScope = "agenda" | "comunicat";

interface DraftEnvelope {
    version: 1;
    scope: DraftScope;
    fields: DraftState;
}

interface DraftField {
    name: string;
    read: () => string;
    restore: (value: string) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getFields(
    form: HTMLFormElement,
    allowedNames: readonly string[],
): DraftField[] {
    return allowedNames.flatMap((name) => {
        const field = form.elements.namedItem(name);

        if (!field) return [];

        // La allowlist concede permiso; el tipo solo añade una defensa.
        // Nunca leer archivos, hidden, contraseñas ni checkboxes.
        if (
            (field instanceof HTMLTextAreaElement ||
                (field instanceof HTMLInputElement &&
                    ["text", "email", "url", "date", "time"].includes(
                        field.type,
                    ))) &&
            // namedItem también busca por id; exigir el nombre aprobado.
            field.name === name
        ) {
            return [
                {
                    name,
                    read: () => field.value,
                    restore: (value) => {
                        field.value = value;
                    },
                },
            ];
        }

        if (field instanceof RadioNodeList) {
            const radios = Array.from(field);
            const isStrictRadioGroup =
                radios.length > 0 &&
                radios.every(
                    (radio): radio is HTMLInputElement =>
                        radio instanceof HTMLInputElement &&
                        radio.type === "radio" &&
                        radio.name === name &&
                        radio.form === form,
                );

            if (!isStrictRadioGroup) return [];

            return [
                {
                    name,
                    read: () =>
                        radios.find((radio) => radio.checked)?.value ?? "",
                    restore: (value) => {
                        if (value === "") {
                            radios.forEach((radio) => {
                                radio.checked = false;
                            });
                            return;
                        }

                        const matchingRadio = radios.find(
                            (radio) => radio.value === value,
                        );

                        if (!matchingRadio) return;

                        radios.forEach((radio) => {
                            radio.checked = radio === matchingRadio;
                        });
                    },
                },
            ];
        }

        return [];
    });
}

function readDraft(fields: DraftField[]): DraftState {
    const draft: DraftState = {};
    for (const field of fields) {
        draft[field.name] = field.read();
    }
    return draft;
}

function restoreDraft(fields: DraftField[], draft: Record<string, unknown>) {
    for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(draft, field.name)) continue;
        const saved = draft[field.name];
        if (typeof saved === "string") {
            field.restore(saved);
        }
    }
}

export function initSubmissionDraft(
    form: HTMLFormElement,
    scope: DraftScope,
    allowedNames: readonly string[],
) {
    const key = `guiapineda:submission-draft:v1:${scope}`;

    const clearDraft = () => {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // El formulario sigue funcionando aunque el storage falle.
        }
    };

    const saveDraft = () => {
        try {
            const envelope: DraftEnvelope = {
                version: 1,
                scope,
                fields: readDraft(getFields(form, allowedNames)),
            };
            sessionStorage.setItem(key, JSON.stringify(envelope));
        } catch {
            // No convertir sessionStorage en una dependencia funcional.
        }
    };

    try {
        const stored = sessionStorage.getItem(key);
        if (stored !== null) {
            const parsed: unknown = JSON.parse(stored);
            if (
                isRecord(parsed) &&
                parsed.version === 1 &&
                parsed.scope === scope &&
                isRecord(parsed.fields)
            ) {
                restoreDraft(getFields(form, allowedNames), parsed.fields);
            } else {
                clearDraft();
            }
        }
    } catch {
        clearDraft();
    }

    // Se registran después de restaurar; no se emiten eventos sintéticos.
    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);
    form.addEventListener("reset", (event) => {
        queueMicrotask(() => {
            if (!event.defaultPrevented) clearDraft();
        });
    });

    return clearDraft;
}
