export function getLocalizedName(item: any, lang: string) {
    if (lang === "es") {
        return item.nombre_es || item.nombre;
    }

    if (lang === "en") {
        return item.nombre_en || item.nombre;
    }

    return item.nombre;
}