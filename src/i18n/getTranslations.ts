import { translations, type Locale } from "./index";

export function getTranslations(lang: Locale) {
    return translations[lang] ?? translations.ca;
}