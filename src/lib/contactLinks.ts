function cleanContactValue(value?: string | null): string {
    return typeof value === "string" ? value.trim() : "";
}

export function getTelephoneHref(
    value?: string | null,
): string | null {
    const original = cleanContactValue(value);

    if (!original) return null;

    const telephone = original.replace(/^tel:/i, "").trim();

    if (!/^\+?[\d\s().-]+$/.test(telephone)) {
        return null;
    }

    const digits = telephone.replace(/\D/g, "");

    if (digits.length < 3 || digits.length > 15) {
        return null;
    }

    const prefix = telephone.startsWith("+") ? "+" : "";

    return `tel:${prefix}${digits}`;
}

export function getEmailHref(
    value?: string | null,
): string | null {
    const original = cleanContactValue(value);

    if (!original) return null;

    const email = original.replace(/^mailto:/i, "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return null;
    }

    return `mailto:${email}`;
}

export function getWebsiteHref(
    value?: string | null,
): string | null {
    const original = cleanContactValue(value);

    if (!original || /\s/.test(original)) {
        return null;
    }

    const hasProtocol =
        /^[a-z][a-z\d+.-]*:/i.test(original);

    if (
        hasProtocol &&
        !/^https?:\/\//i.test(original)
    ) {
        return null;
    }

    const candidate = hasProtocol
        ? original
        : `https://${original}`;

    try {
        const url = new URL(candidate);

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {
            return null;
        }

        if (
            !url.hostname.includes(".") ||
            !/[a-z]/i.test(url.hostname)
        ) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}
