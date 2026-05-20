export function getReadingTime(blocks: any[]): string {
    if (!blocks) return "1 min";

    const text = blocks
        .map((block) =>
            block.children
                ?.map((child: any) => child.text)
                .join(" ")
        )
        .join(" ");

    const words = text.trim().split(/\s+/).length;

    const minutes = Math.max(1, Math.ceil(words / 200));

    return `${minutes} min`;
}