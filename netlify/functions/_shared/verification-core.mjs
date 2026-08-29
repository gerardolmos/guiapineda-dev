import {
    createHmac,
    randomBytes,
    randomInt,
    timingSafeEqual,
} from "node:crypto";

export const VERIFICATION_CODE_TTL_SECONDS =
    10 * 60;

export const VERIFICATION_RESEND_COOLDOWN_SECONDS =
    60;

export const VERIFICATION_MAX_REQUESTS_PER_HOUR =
    5;

export const VERIFICATION_MAX_ATTEMPTS =
    5;

export const VERIFICATION_TOKEN_TTL_SECONDS =
    15 * 60;

export function normalizeVerificationEmail(
    value,
) {
    if (typeof value !== "string") {
        return null;
    }

    const normalized =
        value.trim().toLowerCase();

    return normalized || null;
}

const VERIFICATION_EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidVerificationEmail(
    value,
) {
    const normalized =
        normalizeVerificationEmail(
            value,
        );

    return (
        normalized !== null &&
        normalized.length <= 254 &&
        VERIFICATION_EMAIL_PATTERN.test(
            normalized,
        )
    );
}

export function generateVerificationCode() {
    return String(
        randomInt(0, 1_000_000),
    ).padStart(6, "0");
}

export function generateVerificationToken() {
    return randomBytes(32).toString(
        "base64url",
    );
}

export function hashVerificationValue(
    secret,
    ...parts
) {
    if (
        typeof secret !== "string" ||
        !secret
    ) {
        throw new Error(
            "Verification secret is missing.",
        );
    }

    return createHmac(
        "sha256",
        secret,
    )
        .update(
            parts
                .map((part) => String(part))
                .join("\u001F"),
        )
        .digest("hex");
}

export function verificationHashesMatch(
    left,
    right,
) {
    if (
        typeof left !== "string" ||
        typeof right !== "string" ||
        left.length !== right.length
    ) {
        return false;
    }

    const a = Buffer.from(left, "utf8");
    const b = Buffer.from(right, "utf8");

    return timingSafeEqual(a, b);
}
