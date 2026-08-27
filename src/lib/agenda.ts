const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type AgendaItem = {
    data_inici?: unknown;
    data_final?: unknown;
    hora_inici?: unknown;
};

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

export function getTodayInMadrid(
    now = new Date(),
): string {
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

export function isAgendaItemUpcoming(
    item: AgendaItem,
    today = getTodayInMadrid(),
): boolean {
    const start =
        typeof item.data_inici === "string"
            ? item.data_inici.trim()
            : "";

    if (!isValidDate(start)) {
        return false;
    }

    const rawEnd =
        typeof item.data_final === "string"
            ? item.data_final.trim()
            : "";

    const end =
        rawEnd && isValidDate(rawEnd)
            ? rawEnd
            : start;

    return end >= today;
}

export function getUpcomingAgendaItems<
    T extends AgendaItem,
>(
    items: T[],
    today = getTodayInMadrid(),
): T[] {
    return items
        .filter((item) =>
            isAgendaItemUpcoming(item, today),
        )
        .sort((a, b) => {
            const aDate =
                typeof a.data_inici === "string"
                    ? a.data_inici
                    : "";

            const bDate =
                typeof b.data_inici === "string"
                    ? b.data_inici
                    : "";

            const dateComparison =
                aDate.localeCompare(bDate);

            if (dateComparison !== 0) {
                return dateComparison;
            }

            const aTime =
                typeof a.hora_inici === "string"
                    ? a.hora_inici
                    : "";

            const bTime =
                typeof b.hora_inici === "string"
                    ? b.hora_inici
                    : "";

            return aTime.localeCompare(bTime);
        });
}
