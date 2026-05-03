import ca from "./ca.json";
import es from "./es.json";
import en from "./en.json";

export const translations = {
    ca,
    es,
    en,
};

export type Locale = keyof typeof translations;