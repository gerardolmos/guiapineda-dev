import {
    hasEmailVerificationController,
    recoverVerifiedSubmission,
    type SubmissionFailure,
} from "./emailVerificationController.ts";

class VerifiedSubmissionError extends Error implements SubmissionFailure {
    readonly kind: SubmissionFailure["kind"];
    readonly status?: number;
    readonly reason?: string;
    readonly requestStarted: boolean;
    readonly persistence: SubmissionFailure["persistence"];
    constructor(failure: SubmissionFailure) {
        super("Verified submission could not be confirmed.");
        this.name = "VerifiedSubmissionError";
        this.kind = failure.kind;
        this.status = failure.status;
        this.reason = failure.reason;
        this.requestStarted = failure.requestStarted;
        this.persistence = failure.persistence;
    }
}

const SAFE_HTTP_REASONS: Readonly<Record<number, readonly string[]>> = {
    405: ["request:method-not-allowed"],
    415: ["request:unsupported-media-type", "image:unsupported-type"],
    413: ["request:too-large", "image:too-large"],
    400: ["request:invalid-form-data", "request:duplicate-field", "request:unexpected-file", "image:invalid", "image:empty"],
};
const REQUIRED_SUFFIXES = ["missing", "type", "empty", "control-characters", "too-short", "too-long"];
const OPTIONAL_SUFFIXES = ["type", "control-characters", "too-long"];
function payloadReasons(required: string[], optional: string[], extra: string[]): Set<string> {
    return new Set([
        ...required.flatMap(field => REQUIRED_SUFFIXES.map(suffix => `${field}:${suffix}`)),
        ...optional.flatMap(field => OPTIONAL_SUFFIXES.map(suffix => `${field}:${suffix}`)),
        ...extra,
    ]);
}
const SAFE_PAYLOAD_REASONS: Readonly<Record<string, ReadonlySet<string>>> = {
    "agenda": payloadReasons(
        ["idioma_solicitud", "titol", "resum", "descripcio", "organitzador", "lloc", "nombre_contacto"],
        ["data_final", "hora_inici", "hora_final", "adreca", "enllac_oficial"],
        ["submission:invalid", "submission:honeypot", "idioma_solicitud:invalid", "data_inici:invalid", "data_final:invalid", "dates:invalid-order", "dates:event-finished", "hora_inici:invalid", "hora_final:invalid", "hora_final:without-start", "times:invalid-order", "url:protocol", "url:invalid", "email_contacto:invalid", "aceptacion_privacidad:required"],
    ),
    "comunicat": payloadReasons(
        ["idioma_solicitud", "tipus_remitent", "autor", "titol", "resum", "contingut", "email_contacto"],
        [],
        ["submission:invalid", "submission:honeypot", "submission:protected-field", "idioma_solicitud:invalid", "tipus_remitent:invalid", "email_contacto:invalid", "aceptacion_privacidad:required", "nombre_contacto:invalid", "nombre_contacto:too-long"],
    ),
    "veu": payloadReasons(
        ["idioma_solicitud", "titol", "resum", "contingut", "tipo_autoria", "autor_public", "nombre_contacto"],
        [],
        ["submission:invalid", "submission:honeypot", "submission:protected-field", "idioma_solicitud:invalid", "tipo_autoria:invalid", "email_contacto:invalid", "aceptacion_privacidad:required"],
    ),
    "millora": payloadReasons(
        ["idioma_solicitud", "categoria", "zona", "autor_public", "titol", "resum", "contingut", "email_contacto"],
        [],
        ["idioma_solicitud:invalid", "categoria:invalid", "zona:invalid", "email_contacto:invalid", "aceptacion_privacidad:required"],
    ),
    "foto-mes": payloadReasons(
        ["autor"],
        ["titol", "lloc"],
        ["submission:invalid", "submission:honeypot", "submission:protected-field", "idioma_solicitud:invalid", "email_contacto:invalid", "aceptacion_privacidad:required", "aceptacion_autoria_publicacion:required", "image:required"],
    ),
};

export function classifySubmissionFailure(scope: string, status: number, data: unknown): SubmissionFailure {
    let kind: SubmissionFailure["kind"] = "ambiguous";
    let reason: string | undefined;
    if (data && typeof data === "object" && !Array.isArray(data) &&
        "ok" in data && data.ok === false && "reason" in data) {
        if (typeof data.reason === "string" && SAFE_PAYLOAD_REASONS[scope] &&
            (SAFE_HTTP_REASONS[status]?.includes(data.reason) ||
                (status === 400 && SAFE_PAYLOAD_REASONS[scope].has(data.reason)))) {
            kind = "pre-consumption-safe";
            reason = data.reason;
        } else if (status === 400 && (data.reason === "verification:required" || data.reason === "verification:invalid")) {
            kind = "verification-invalid";
            reason = data.reason;
        } else if (status === 503 && data.reason === "submission:unavailable") {
            kind = "post-consumption-failure";
            reason = data.reason;
        }
    }
    return { kind, status, reason, requestStarted: true, persistence: kind === "pre-consumption-safe" ? "not-started" : "unknown" };
}

interface SubmissionOptions {
    successUrl: string;
    minimumDuration?: number;
    navigation?: "automatic" | "caller";
}

const LOCAL_HOSTS = new Set([
    "localhost",
    "127.0.0.1",
]);

function wait(milliseconds: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
}

function showSendingOverlay() {
    const overlay = document.getElementById(
        "submission-sending-overlay",
    );

    if (!overlay) return;

    overlay.hidden = false;
    overlay.setAttribute("aria-busy", "true");
}

function hideSendingOverlay() {
    const overlay = document.getElementById(
        "submission-sending-overlay",
    );

    if (!overlay) return;

    overlay.hidden = true;
    overlay.removeAttribute("aria-busy");
}

export async function submitNetlifyForm(
    form: HTMLFormElement,
    {
        successUrl,
        minimumDuration = 3200,
    }: SubmissionOptions,
) {
    const startedAt = performance.now();

    showSendingOverlay();

    try {
        const isLocal =
            LOCAL_HOSTS.has(window.location.hostname);

        if (!isLocal) {
            const response = await fetch("/", {
                method: "POST",
                body: new FormData(form),
            });

            if (!response.ok) {
                throw new Error(
                    `Netlify form submission failed: ${response.status}`,
                );
            }
        }

        const elapsed =
            performance.now() - startedAt;

        const remaining =
            Math.max(0, minimumDuration - elapsed);

        await wait(remaining);

        window.location.assign(successUrl);
    } catch (error) {
        hideSendingOverlay();
        throw error;
    }
}

function getVerifiedSubmissionEndpoint(
    form: HTMLFormElement,
): string {
    if (
        form.matches(
            "[data-agenda-submission-flow]",
        )
    ) {
        return "/api/submissions/agenda";
    }

    if (
        form.matches(
            "[data-veu-submission-flow]",
        )
    ) {
        return "/api/submissions/veu";
    }

    if (
        form.matches(
            "[data-comunicat-submission-flow]",
        )
    ) {
        return "/api/submissions/comunicat";
    }

    if (
        form.matches(
            "[data-foto-mes-submission-flow]",
        )
    ) {
        return "/api/submissions/foto-mes";
    }

    if (
        form.matches(
            "[data-millora-submission-flow]",
        )
    ) {
        return "/api/submissions/millora";
    }

    throw new Error(
        "Verified submission form is not supported.",
    );
}

/*
 * Transporte exclusivo para formularios que
 * ya pasan por la nueva puerta de verificación.
 *
 * A diferencia del transporte histórico:
 * - funciona también en localhost;
 * - nunca publica mediante Netlify Forms;
 * - envía directamente a la Function segura;
 * - espera una respuesta JSON explícita { ok:true }.
 */
export async function submitVerifiedSubmissionForm(
    form: HTMLFormElement,
    options: SubmissionOptions,
) {
    const {
        successUrl,
        minimumDuration = 3200,
    } = options;
    const navigation =
        options.navigation ?? "automatic";
    const startedAt =
        performance.now();

    let requestStarted = false;
    showSendingOverlay();
    try {
        if (!hasEmailVerificationController(form)) {
            throw new Error("Verification controller unavailable.");
        }
        const endpoint = getVerifiedSubmissionEndpoint(form);
        const body = new FormData(form);
        requestStarted = true;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body,
        });
        let data: unknown;
        try { data = await response.json(); } catch { data = null; }
        if (!(response.status === 201 && data && typeof data === "object" &&
            !Array.isArray(data) && "ok" in data && data.ok === true)) {
            throw new VerifiedSubmissionError(classifySubmissionFailure(endpoint.split("/").at(-1) ?? "", response.status, data));
        }
    } catch (error) {
        const failure = error instanceof VerifiedSubmissionError ? error : new VerifiedSubmissionError({
            kind: requestStarted ? "ambiguous" : "pre-consumption-safe",
            requestStarted,
            persistence: requestStarted ? "unknown" : "not-started",
        });
        hideSendingOverlay();
        recoverVerifiedSubmission(form, failure);
        throw failure;
    }
    // Acceptance is final: navigation errors are not submission failures.
    const remaining = Math.max(0, minimumDuration - (performance.now() - startedAt));
    await wait(remaining);
    if (navigation === "automatic") window.location.assign(successUrl);
}
