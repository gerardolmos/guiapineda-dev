type DraftState = Record<string, string>;

interface AgendaDraftEnvelope {
    version: 1;
    scope: "agenda";
    fields: DraftState;
}

type DraftField = HTMLInputElement | HTMLTextAreaElement;

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getFields(
    form: HTMLFormElement,
    allowedNames: readonly string[],
): DraftField[] {
    return allowedNames.flatMap((name) => {
        const field = form.elements.namedItem(name);

        // namedItem también busca por id; exigir el nombre aprobado.
        if (!field || !("name" in field) || field.name !== name) return [];

        // La allowlist concede permiso; el tipo solo añade una defensa.
        // Nunca leer archivos, hidden, contraseñas ni checkboxes.
        if (
            field instanceof HTMLTextAreaElement ||
            (field instanceof HTMLInputElement &&
                ["text", "email", "url", "date", "time"].includes(field.type))
        ) {
            return [field];
        }

        return [];
    });
}

function readDraft(fields: DraftField[]): DraftState {
    const draft: DraftState = {};
    for (const field of fields) {
        draft[field.name] = field.value;
    }
    return draft;
}

function restoreDraft(fields: DraftField[], draft: Record<string, unknown>) {
    for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(draft, field.name)) continue;
        const saved = draft[field.name];
        if (typeof saved === "string") {
            field.value = saved;
        }
    }
}

export function initSubmissionDraft(
    form: HTMLFormElement,
    scope: "agenda",
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
            const envelope: AgendaDraftEnvelope = {
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
    form.addEventListener("reset", clearDraft);

    return clearDraft;
}
