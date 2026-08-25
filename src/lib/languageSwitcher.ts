export type Lang = "ca" | "es" | "en";

export function getLanguageLinks(pathname: string) {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";

    if (cleanPath === "/" || cleanPath === "/es" || cleanPath === "/en") {
        const currentLang: Lang =
            cleanPath === "/es" ? "es" : cleanPath === "/en" ? "en" : "ca";

        return {
            currentLang,
            links: {
                ca: "/",
                es: "/es",
                en: "/en",
            },
        };
    }

    const aboutLinks: Record<Lang, string> = {
        ca: "/sobre-guiapineda",
        es: "/es/sobre-guiapineda",
        en: "/en/about-guiapineda",
    };

    const aboutEntry = Object.entries(aboutLinks).find(
        ([, path]) => path === cleanPath,
    );

    if (aboutEntry) {
        return {
            currentLang: aboutEntry[0] as Lang,
            links: aboutLinks,
        };
    }

    let currentLang: Lang = "ca";
    let pathWithoutLang = cleanPath;

    if (cleanPath.startsWith("/es/")) {
        currentLang = "es";
        pathWithoutLang = cleanPath.replace("/es", "");
    }

    if (cleanPath.startsWith("/en/")) {
        currentLang = "en";
        pathWithoutLang = cleanPath.replace("/en", "");
    }

    return {
        currentLang,
        links: {
            ca: pathWithoutLang,
            es: `/es${pathWithoutLang}`,
            en: `/en${pathWithoutLang}`,
        },
    };
}