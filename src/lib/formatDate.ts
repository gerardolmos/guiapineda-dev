export function formatDate(
    date: string,
    lang: "ca" | "es" | "en" = "ca",
) {
    return new Intl.DateTimeFormat(lang, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}