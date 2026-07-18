import {
    getStrapiBlocksText,
    type StrapiBlock,
} from "./strapiBlocks";

export function getReadingTime(
    blocks?: StrapiBlock[] | null,
): string {
    const text = getStrapiBlocksText(blocks);
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));

    return `${minutes} min`;
}
