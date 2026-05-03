export type Lang = "ca" | "es" | "en";

export function getLanguageLinks(pathname: string) {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";

    // Home
    if (cleanPath === "/") {
        return {
            currentLang: "ca" as Lang,
            links: {
                ca: "/",
                es: "/es",
                en: "/en",
            },
        };
    }

    if (cleanPath === "/es") {
        return {
            currentLang: "es" as Lang,
            links: {
                ca: "/",
                es: "/es",
                en: "/en",
            },
        };
    }

    if (cleanPath === "/en") {
        return {
            currentLang: "en" as Lang,
            links: {
                ca: "/",
                es: "/es",
                en: "/en",
            },
        };
    }

    // Categoría
    if (cleanPath.startsWith("/categoria/")) {
        const rest = cleanPath.replace("/categoria/", "");
        return {
            currentLang: "ca" as Lang,
            links: {
                ca: `/categoria/${rest}`,
                es: `/es/categoria/${rest}`,
            },
        };
    }

    if (cleanPath.startsWith("/es/categoria/")) {
        const rest = cleanPath.replace("/es/categoria/", "");
        return {
            currentLang: "es" as Lang,
            links: {
                ca: `/categoria/${rest}`,
                es: `/es/categoria/${rest}`,
            },
        };
    }

    // Subcategoría
    if (cleanPath.startsWith("/subcategoria/")) {
        const rest = cleanPath.replace("/subcategoria/", "");
        return {
            currentLang: "ca" as Lang,
            links: {
                ca: `/subcategoria/${rest}`,
                es: `/es/subcategoria/${rest}`,
            },
        };
    }

    if (cleanPath.startsWith("/es/subcategoria/")) {
        const rest = cleanPath.replace("/es/subcategoria/", "");
        return {
            currentLang: "es" as Lang,
            links: {
                ca: `/subcategoria/${rest}`,
                es: `/es/subcategoria/${rest}`,
            },
        };
    }

    // Comercio
    if (cleanPath.startsWith("/comercio/")) {
        const rest = cleanPath.replace("/comercio/", "");
        return {
            currentLang: "ca" as Lang,
            links: {
                ca: `/comercio/${rest}`,
                es: `/es/comercio/${rest}`,
            },
        };
    }

    if (cleanPath.startsWith("/es/comercio/")) {
        const rest = cleanPath.replace("/es/comercio/", "");
        return {
            currentLang: "es" as Lang,
            links: {
                ca: `/comercio/${rest}`,
                es: `/es/comercio/${rest}`,
            },
        };
    }

    // Fallback
    return {
        currentLang: "ca" as Lang,
        links: {
            ca: "/",
            es: "/es",
            en: "/en",
        },
    };
}