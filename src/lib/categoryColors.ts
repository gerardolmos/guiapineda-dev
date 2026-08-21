export type CategoryColor = {
    background: string;
    foreground: string;
};

export const categoryCardColors: Record<string, CategoryColor> = {
    alimentacio: {
        background: "#F78A11",
        foreground: "#0f172a",
    },
    allotjament: {
        background: "#73AF4A",
        foreground: "#0f172a",
    },
    bellesa: {
        background: "#0DB9D6",
        foreground: "#0f172a",
    },
    comercos: {
        background: "#A062D1",
        foreground: "#ffffff",
    },
    "comunitat-i-associacions": {
        background: "#E35F8E",
        foreground: "#0f172a",
    },
    construccio: {
        background: "#F4AC0E",
        foreground: "#0f172a",
    },
    educacio: {
        background: "#1B7DD7",
        foreground: "#ffffff",
    },
    "finances-legal": {
        background: "#18BAA5",
        foreground: "#0f172a",
    },
    moda: {
        background: "#ED5D70",
        foreground: "#0f172a",
    },
    oci: {
        background: "#544EC5",
        foreground: "#ffffff",
    },
    "partits-politics": {
        background: "#5957D3",
        foreground: "#ffffff",
    },
    "punts-de-interes": {
        background: "#FC611E",
        foreground: "#0f172a",
    },
    restauracio: {
        background: "#DF4234",
        foreground: "#ffffff",
    },
    "salut-i-benestar": {
        background: "#67AE62",
        foreground: "#0f172a",
    },
    "serveis-professionals": {
        background: "#1B7DD7",
        foreground: "#ffffff",
    },
    transport: {
        background: "#0E6FBE",
        foreground: "#ffffff",
    },
    vehicles: {
        background: "#0BACC1",
        foreground: "#0f172a",
    },
};

const fallbackCategoryColor: CategoryColor = {
    background: "#e2e8f0",
    foreground: "#0f172a",
};

export function getCategoryColor(slug: string): CategoryColor {
    return categoryCardColors[slug] ?? fallbackCategoryColor;
}
