const STRAPI_URL = "http://localhost:1337";

export const endpoints = {
    home: "/api/home?populate=*",
    categorias: "/api/categoria-comercios?populate=*",
    subcategorias: "/api/subcategorias?populate=*",
    comercios: "/api/comercios?populate=*",
    opinions: "/api/opinions?populate=*",
};

export async function fetchAPI(endpoint: string) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const firstUrl = `${STRAPI_URL}${endpoint}${separator}pagination[page]=1&pagination[pageSize]=100`;

    const firstResponse = await fetch(firstUrl);

    if (!firstResponse.ok) {
        throw new Error(`Error fetching ${endpoint}`);
    }

    const firstData = await firstResponse.json();

    const pageCount = firstData.meta?.pagination?.pageCount ?? 1;

    if (pageCount <= 1) {
        return firstData;
    }

    const restPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, async (_, index) => {
            const page = index + 2;
            const url = `${STRAPI_URL}${endpoint}${separator}pagination[page]=${page}&pagination[pageSize]=100`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error fetching page ${page} of ${endpoint}`);
            }

            return response.json();
        }),
    );

    return {
        ...firstData,
        data: [
            ...firstData.data,
            ...restPages.flatMap((pageData) => pageData.data),
        ],
    };
}