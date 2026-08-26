import { filterVisibleComunicats } from "./comunicats";

export type TaulerLang = "ca" | "es" | "en";

export type TaulerItemType =
    | "comunicat"
    | "millora";

export type TaulerItem = {
    key: string;
    type: TaulerItemType;
    title: string;
    excerpt: string;
    date: string;
    url: string;
    image: unknown | null;
    author: string | null;
    category: string | null;
    zone: string | null;
};

type SourceItem = {
    id?: string | number;
    documentId?: string;
    slug?: unknown;
    titol?: unknown;
    resum?: unknown;
    data_publicacio?: unknown;
    imatge?: unknown;
    autor?: unknown;
    categoria?: unknown;
    zona?: unknown;
    data_caducitat?: unknown;
};

function readRequiredString(
    value: unknown,
): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0
        ? trimmed
        : null;
}

function readOptionalString(
    value: unknown,
): string | null {
    return readRequiredString(value);
}

function buildKey(
    type: TaulerItemType,
    item: SourceItem,
    slug: string,
): string {
    const sourceKey =
        item.documentId ??
        item.id ??
        slug;

    return `${type}:${String(sourceKey)}`;
}

function buildUrl(
    type: TaulerItemType,
    slug: string,
    lang: TaulerLang,
): string {
    const section =
        type === "comunicat"
            ? "comunicats"
            : "millorem-pineda";

    return lang === "ca"
        ? `/${section}/${slug}`
        : `/${lang}/${section}/${slug}`;
}

function normalizeItem(
    item: SourceItem,
    type: TaulerItemType,
    lang: TaulerLang,
): TaulerItem | null {
    const slug = readRequiredString(item.slug);
    const title = readRequiredString(item.titol);
    const excerpt = readRequiredString(item.resum);
    const date = readRequiredString(
        item.data_publicacio,
    );

    if (!slug || !title || !excerpt || !date) {
        return null;
    }

    return {
        key: buildKey(type, item, slug),
        type,
        title,
        excerpt,
        date,
        url: buildUrl(type, slug, lang),
        image: item.imatge ?? null,
        author: readOptionalString(item.autor),
        category:
            type === "millora"
                ? readOptionalString(item.categoria)
                : null,
        zone:
            type === "millora"
                ? readOptionalString(item.zona)
                : null,
    };
}

export function buildTaulerItems({
    comunicats,
    millores,
    lang = "ca",
}: {
    comunicats: SourceItem[];
    millores: SourceItem[];
    lang?: TaulerLang;
}): TaulerItem[] {
    const normalizedComunicats =
        filterVisibleComunicats(comunicats)
            .map((item) =>
                normalizeItem(
                    item,
                    "comunicat",
                    lang,
                ),
            );

    const normalizedMillores =
        millores.map((item) =>
            normalizeItem(
                item,
                "millora",
                lang,
            ),
        );

    return [
        ...normalizedComunicats,
        ...normalizedMillores,
    ]
        .filter(
            (item): item is TaulerItem =>
                item !== null,
        )
        .sort(
            (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime(),
        );
}
