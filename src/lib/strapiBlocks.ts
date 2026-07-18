import { getStrapiMediaUrl } from "./strapi";

export type StrapiMedia = {
    url?: string;
    alternativeText?: string | null;
    caption?: string | null;
    name?: string | null;
    width?: number | null;
    height?: number | null;
};

export type StrapiNode = {
    type?: string;
    text?: string;
    children?: StrapiNode[];
    url?: string;
    level?: number;
    format?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    image?: StrapiMedia;
    alternativeText?: string | null;
    caption?: string | null;
    name?: string | null;
    width?: number | null;
    height?: number | null;
};

export type StrapiBlock = StrapiNode;

const BLOCK_TYPES = new Set([
    "paragraph",
    "heading",
    "list",
    "list-item",
    "quote",
    "code",
    "image",
]);

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function sanitizeStrapiUrl(
    value?: string | null,
): string | null {
    if (typeof value !== "string") return null;

    const url = value.trim();

    if (!url || url.startsWith("//")) return null;

    if (
        url.startsWith("/") ||
        url.startsWith("./") ||
        url.startsWith("../") ||
        url.startsWith("#")
    ) {
        return url;
    }

    try {
        const parsed = new URL(url);
        return SAFE_PROTOCOLS.has(parsed.protocol) ? url : null;
    } catch {
        return null;
    }
}

function renderTextNode(node: StrapiNode): string {
    let html = escapeHtml(node.text || "").replaceAll("\n", "<br>");

    if (node.code) html = `<code>${html}</code>`;
    if (node.bold) html = `<strong>${html}</strong>`;
    if (node.italic) html = `<em>${html}</em>`;
    if (node.underline) html = `<u>${html}</u>`;
    if (node.strikethrough) html = `<s>${html}</s>`;

    return html;
}

function renderInlineChildren(node: StrapiNode): string {
    return (node.children || []).map(renderInlineNode).join("");
}

function renderInlineNode(node: StrapiNode): string {
    if (node.type === "link") {
        const content = renderInlineChildren(node);
        const href = sanitizeStrapiUrl(node.url);

        return href
            ? `<a href="${escapeHtml(href)}">${content}</a>`
            : content;
    }

    if (node.type === "text" || typeof node.text === "string") {
        return renderTextNode(node);
    }

    return renderInlineChildren(node);
}

function renderMixedChildren(node: StrapiNode): string {
    return (node.children || [])
        .map((child) =>
            BLOCK_TYPES.has(child.type || "")
                ? renderBlockNode(child)
                : renderInlineNode(child),
        )
        .join("");
}

function renderListItem(node: StrapiNode): string {
    return `<li>${renderMixedChildren(node)}</li>`;
}

function renderImage(node: StrapiNode): string {
    const media: StrapiMedia = node.image || {
        url: node.url,
        alternativeText: node.alternativeText,
        caption: node.caption,
        name: node.name,
        width: node.width,
        height: node.height,
    };

    if (!media.url) return "";

    const resolvedUrl = getStrapiMediaUrl(media.url);
    const src = sanitizeStrapiUrl(resolvedUrl);

    if (!src) return "";

    const alt =
        media.alternativeText ||
        media.caption ||
        media.name ||
        "";

    const width =
        typeof media.width === "number" && media.width > 0
            ? ` width="${media.width}"`
            : "";

    const height =
        typeof media.height === "number" && media.height > 0
            ? ` height="${media.height}"`
            : "";

    return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(
        alt,
    )}"${width}${height} loading="lazy" decoding="async"></figure>`;
}

function renderBlockNode(node: StrapiNode): string {
    switch (node.type) {
        case "paragraph":
            return `<p>${renderInlineChildren(node)}</p>`;

        case "heading": {
            const requestedLevel =
                typeof node.level === "number" ? node.level : 2;

            const level = Math.min(6, Math.max(2, requestedLevel));

            return `<h${level}>${renderInlineChildren(node)}</h${level}>`;
        }

        case "list": {
            const tag = node.format === "ordered" ? "ol" : "ul";

            const items = (node.children || [])
                .map((child) =>
                    child.type === "list-item"
                        ? renderListItem(child)
                        : `<li>${renderBlockNode(child)}</li>`,
                )
                .join("");

            return `<${tag}>${items}</${tag}>`;
        }

        case "list-item":
            return renderListItem(node);

        case "quote":
            return `<blockquote>${renderMixedChildren(node)}</blockquote>`;

        case "code": {
            const code = (node.children || [])
                .map((child) => child.text || "")
                .join("");

            return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }

        case "image":
            return renderImage(node);

        default: {
            const content = renderMixedChildren(node);

            return content ? `<p>${content}</p>` : "";
        }
    }
}

export function renderStrapiBlocksToHtml(
    blocks?: StrapiBlock[] | null,
): string {
    if (!Array.isArray(blocks)) return "";

    return blocks.map(renderBlockNode).filter(Boolean).join("");
}

function collectText(node: StrapiNode): string[] {
    const values: string[] = [];

    if (typeof node.text === "string" && node.text.trim()) {
        values.push(node.text);
    }

    const media = node.image;

    if (media?.alternativeText) {
        values.push(media.alternativeText);
    }

    for (const child of node.children || []) {
        values.push(...collectText(child));
    }

    return values;
}

export function getStrapiBlocksText(
    blocks?: StrapiBlock[] | null,
): string {
    if (!Array.isArray(blocks)) return "";

    return blocks
        .flatMap(collectText)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}
