export type CommerceScheduleDay = {
    dia: string;
    cerrado: boolean;
    apertura_1?: string;
    cierre_1?: string;
    apertura_2?: string;
    cierre_2?: string;
};

export interface CommerceSubmissionValues {
    idioma_solicitud: "ca" | "es" | "en";
    nombre: string;
    categoria_document_id: string;
    subcategoria_document_id?: string;
    descripcion_corta: string;
    descripcion_completa: string;
    direccion: string;
    telefono?: string;
    whatsapp?: string;
    email?: string;
    web?: string;
    atencion_presencial: boolean;
    atencion_domicilio: boolean;
    atencion_online: boolean;
    recogida_local: boolean;
    reparto: boolean;
    horario_semanal: CommerceScheduleDay[];
    servicios: Array<{ nombre: string; descripcion?: string }>;
    redes_sociales: Array<{ plataforma: string; url: string }>;
    informacion_adicional?: string;
    nombre_contacto: string;
    email_contacto: string;
    telefono_contacto?: string;
    aceptacion_privacidad: true;
    email_verification_token: string;
    imagen_principal: File;
    logo?: File;
    galeria: File[];
}

export const COMMERCE_IMAGE_MAX_BYTES = 4_000_000;
export const COMMERCE_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const COMMERCE_DAYS = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
] as const;

const COMMERCE_NETWORKS = new Set([
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "linkedin",
    "x",
]);

const COMMERCE_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export type CommerceFieldIssue = {
    field: "web" | "redes_sociales" | "horario_semanal";
    index?: number;
    input?: keyof CommerceScheduleDay;
};

export class CommerceFieldValidationError extends Error {
    readonly issue: CommerceFieldIssue;

    constructor(issue: CommerceFieldIssue) {
        super(`field:${issue.field}`);
        this.name = "CommerceFieldValidationError";
        this.issue = issue;
    }
}

export function isValidCommerceHttpUrl(value: string) {
    if (!value.trim()) return true;
    try {
        return ["http:", "https:"].includes(new URL(value.trim()).protocol);
    } catch {
        return false;
    }
}

export function findCommerceNetworkIssue(
    networks: CommerceSubmissionValues["redes_sociales"],
): CommerceFieldIssue | null {
    if (!Array.isArray(networks) || networks.length > 6) {
        return { field: "redes_sociales" };
    }

    const seen = new Set<string>();
    for (let index = 0; index < networks.length; index += 1) {
        const network = networks[index];
        if (
            !network ||
            typeof network.plataforma !== "string" ||
            !COMMERCE_NETWORKS.has(network.plataforma) ||
            seen.has(network.plataforma) ||
            typeof network.url !== "string" ||
            !network.url.trim() ||
            network.url.trim().length > 250 ||
            !isValidCommerceHttpUrl(network.url)
        ) {
            return { field: "redes_sociales", index };
        }
        seen.add(network.plataforma);
    }
    return null;
}

export function findCommerceScheduleIssue(
    schedule: CommerceSubmissionValues["horario_semanal"],
): CommerceFieldIssue | null {
    if (!Array.isArray(schedule) || schedule.length !== COMMERCE_DAYS.length) {
        return { field: "horario_semanal" };
    }

    let openDays = 0;
    for (let index = 0; index < COMMERCE_DAYS.length; index += 1) {
        const day = schedule[index] as CommerceScheduleDay | null;
        if (
            !day ||
            typeof day !== "object" ||
            Array.isArray(day) ||
            day.dia !== COMMERCE_DAYS[index] ||
            typeof day.cerrado !== "boolean"
        ) {
            return { field: "horario_semanal", index };
        }

        const suppliedTimes = [
            "apertura_1",
            "cierre_1",
            "apertura_2",
            "cierre_2",
        ] as const;
        if (day.cerrado) {
            if (suppliedTimes.some((field) => Object.hasOwn(day, field))) {
                return { field: "horario_semanal", index, input: "cerrado" };
            }
            continue;
        }

        openDays += 1;
        if (
            typeof day.apertura_1 !== "string" ||
            !COMMERCE_TIME.test(day.apertura_1)
        ) {
            return { field: "horario_semanal", index, input: "apertura_1" };
        }
        if (
            typeof day.cierre_1 !== "string" ||
            !COMMERCE_TIME.test(day.cierre_1) ||
            day.apertura_1 >= day.cierre_1
        ) {
            return { field: "horario_semanal", index, input: "cierre_1" };
        }

        const hasSecondStart = Object.hasOwn(day, "apertura_2");
        const hasSecondEnd = Object.hasOwn(day, "cierre_2");
        if (hasSecondStart !== hasSecondEnd) {
            return {
                field: "horario_semanal",
                index,
                input: hasSecondStart ? "cierre_2" : "apertura_2",
            };
        }
        if (hasSecondStart) {
            if (
                typeof day.apertura_2 !== "string" ||
                !COMMERCE_TIME.test(day.apertura_2) ||
                day.cierre_1 > day.apertura_2
            ) {
                return { field: "horario_semanal", index, input: "apertura_2" };
            }
            if (
                typeof day.cierre_2 !== "string" ||
                !COMMERCE_TIME.test(day.cierre_2) ||
                day.apertura_2 >= day.cierre_2
            ) {
                return { field: "horario_semanal", index, input: "cierre_2" };
            }
        }
    }

    return openDays > 0
        ? null
        : { field: "horario_semanal", index: 0, input: "cerrado" };
}

export function findCommerceFieldIssue(
    values: Pick<
        CommerceSubmissionValues,
        "web" | "redes_sociales" | "horario_semanal"
    >,
): CommerceFieldIssue | null {
    if (values.web && !isValidCommerceHttpUrl(values.web)) {
        return { field: "web" };
    }
    return findCommerceScheduleIssue(values.horario_semanal) ??
        findCommerceNetworkIssue(values.redes_sociales);
}

export function validateCommerceFields(
    values: Pick<
        CommerceSubmissionValues,
        "web" | "redes_sociales" | "horario_semanal"
    >,
) {
    const issue = findCommerceFieldIssue(values);
    if (issue) throw new CommerceFieldValidationError(issue);
}

export type CommerceSubmissionFailureKind =
    | "local-validation"
    | "pre-consumption"
    | "verification"
    | "post-consumption"
    | "ambiguous";

export class CommerceSubmissionError extends Error {
    readonly kind: CommerceSubmissionFailureKind;
    readonly requiresReverification: boolean;
    readonly submissionStarted: boolean;
    readonly status?: number;
    readonly fieldIssue?: CommerceFieldIssue;

    constructor(
        reason: string,
        {
            kind,
            requiresReverification,
            submissionStarted,
            status,
            fieldIssue,
        }: {
            kind: CommerceSubmissionFailureKind;
            requiresReverification: boolean;
            submissionStarted: boolean;
            status?: number;
            fieldIssue?: CommerceFieldIssue;
        },
    ) {
        super(reason);
        this.name = "CommerceSubmissionError";
        this.kind = kind;
        this.requiresReverification = requiresReverification;
        this.submissionStarted = submissionStarted;
        this.status = status;
        this.fieldIssue = fieldIssue;
    }
}

export function validateCommerceImages({
    imagen_principal,
    logo,
    galeria,
}: Pick<CommerceSubmissionValues, "imagen_principal" | "logo" | "galeria">) {
    if (!(imagen_principal instanceof File)) {
        throw new Error("image:required");
    }
    if (logo !== undefined && !(logo instanceof File)) {
        throw new Error("image:invalid-cardinality");
    }
    if (!Array.isArray(galeria) || galeria.length > 4) {
        throw new Error("image:invalid-cardinality");
    }

    const files = [imagen_principal, ...(logo ? [logo] : []), ...galeria];
    let totalBytes = 0;
    for (const file of files) {
        if (!COMMERCE_IMAGE_MIME_TYPES.has(file.type)) {
            throw new Error("image:invalid-type");
        }
        if (file.size <= 0 || file.size > COMMERCE_IMAGE_MAX_BYTES) {
            throw new Error("image:invalid-size");
        }
        totalBytes += file.size;
    }
    if (totalBytes > COMMERCE_IMAGE_MAX_BYTES) {
        throw new Error("image:aggregate-too-large");
    }
}

export function buildCommerceFormData(values: CommerceSubmissionValues) {
    validateCommerceFields(values);
    validateCommerceImages(values);
    const body = new FormData();
    const jsonFields = new Set(["horario_semanal", "servicios", "redes_sociales"]);
    const fileFields = new Set(["imagen_principal", "logo", "galeria"]);

    for (const [key, value] of Object.entries(values)) {
        if (fileFields.has(key) || value === undefined || value === "") continue;
        body.set(key, jsonFields.has(key) ? JSON.stringify(value) : String(value));
    }
    body.set("bot-field", "");
    body.set("imagen_principal", values.imagen_principal);
    if (values.logo) body.set("logo", values.logo);
    for (const image of values.galeria) body.append("galeria", image);
    return body;
}

export async function submitCommerce(values: CommerceSubmissionValues, { timeoutMs = 20_000, fetchImpl = fetch }: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}) {
    let body: FormData;
    try {
        body = buildCommerceFormData(values);
    } catch (error) {
        throw new CommerceSubmissionError(
            error instanceof Error ? error.message : "submission:invalid",
            {
                kind: "local-validation",
                requiresReverification: false,
                submissionStarted: false,
                fieldIssue: error instanceof CommerceFieldValidationError
                    ? error.issue
                    : undefined,
            },
        );
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        let response: Response;
        try {
            response = await fetchImpl("/api/submissions/comercio", { method: "POST", body, headers: { Accept: "application/json" }, signal: controller.signal });
        } catch {
            throw new CommerceSubmissionError("submission:ambiguous", {
                kind: "ambiguous",
                requiresReverification: true,
                submissionStarted: true,
            });
        }

        let result: { ok?: boolean; reason?: string } | null;
        try {
            result = await response.json();
        } catch {
            throw new CommerceSubmissionError("submission:invalid-response", {
                kind: "ambiguous",
                requiresReverification: true,
                submissionStarted: true,
                status: response.status,
            });
        }

        if (response.status === 201 && result?.ok === true) {
            return result as { ok: true };
        }

        const reason = typeof result?.reason === "string"
            ? result.reason
            : "submission:failed";
        const verificationFailure = reason === "verification:required" ||
            reason === "verification:invalid";
        const verificationUnavailable = reason === "verification:unavailable";
        const knownPreConsumption =
            [400, 413, 415, 422, 429].includes(response.status) &&
            !verificationUnavailable;
        const knownPostConsumption = response.status === 503 &&
            reason === "submission:unavailable";

        throw new CommerceSubmissionError(reason, {
            kind: verificationFailure
                ? "verification"
                : verificationUnavailable
                  ? "ambiguous"
                : knownPostConsumption
                  ? "post-consumption"
                  : knownPreConsumption
                    ? "pre-consumption"
                    : "ambiguous",
            requiresReverification: verificationFailure ||
                verificationUnavailable ||
                knownPostConsumption ||
                !knownPreConsumption,
            submissionStarted: true,
            status: response.status,
        });
    } finally {
        window.clearTimeout(timeout);
    }
}
