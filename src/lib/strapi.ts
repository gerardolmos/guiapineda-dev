export const STRAPI_URL = (
    import.meta.env.STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");

export function getStrapiMediaUrl(url: string) {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return `${STRAPI_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
