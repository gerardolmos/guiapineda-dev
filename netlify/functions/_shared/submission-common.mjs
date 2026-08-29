// Helpers comunes de validación de solicitudes participativas.
// La lógica específica de cada sección permanece en su Function.

const CONTROL_CHARACTERS =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function fail(reason) {
    return {
        ok: false,
        reason,
    };
}

export function readString(
    data,
    field,
    {
        required = false,
        min = 0,
        max,
    } = {},
) {
    const raw = data[field];

    if (raw === undefined || raw === null) {
        return required
            ? fail(`${field}:missing`)
            : { ok: true, value: null };
    }

    if (typeof raw !== "string") {
        return fail(`${field}:type`);
    }

    const value = raw.trim();

    if (!value) {
        return required
            ? fail(`${field}:empty`)
            : { ok: true, value: null };
    }

    if (CONTROL_CHARACTERS.test(value)) {
        return fail(`${field}:control-characters`);
    }

    if (value.length < min) {
        return fail(`${field}:too-short`);
    }

    if (max && value.length > max) {
        return fail(`${field}:too-long`);
    }

    return {
        ok: true,
        value,
    };
}
