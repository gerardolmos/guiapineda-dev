type ComunicatWithExpiry = {
    data_caducitat?: unknown;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export function getTodayInMadrid(now = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);

    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

export function isComunicatVisible(
    comunicat: ComunicatWithExpiry,
    today = getTodayInMadrid(),
): boolean {
    const rawExpiry = comunicat?.data_caducitat;

    if (typeof rawExpiry !== "string" || rawExpiry.trim() === "") {
        return true;
    }

    const expiry = rawExpiry.trim();

    if (!isValidDate(expiry)) {
        return true;
    }

    return expiry >= today;
}

export function filterVisibleComunicats<T extends ComunicatWithExpiry>(
    comunicats: T[],
    today = getTodayInMadrid(),
): T[] {
    return comunicats.filter((comunicat) =>
        isComunicatVisible(comunicat, today),
    );
}
