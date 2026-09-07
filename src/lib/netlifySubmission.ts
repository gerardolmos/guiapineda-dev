interface SubmissionOptions {
    successUrl: string;
    minimumDuration?: number;
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

    throw new Error(
        "Verified submission form is not supported.",
    );
}

function readSubmissionFailureReason(
    data: unknown,
): string {
    if (
        !data ||
        typeof data !== "object" ||
        !("reason" in data)
    ) {
        return "submission:failed";
    }

    const reason =
        (data as { reason?: unknown })
            .reason;

    return typeof reason === "string" &&
        reason.length > 0
        ? reason
        : "submission:failed";
}

function isSuccessfulSubmissionResponse(
    data: unknown,
): boolean {
    return Boolean(
        data &&
        typeof data === "object" &&
        "ok" in data &&
        (data as { ok?: unknown }).ok ===
            true,
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
    {
        successUrl,
        minimumDuration = 3200,
    }: SubmissionOptions,
) {
    const startedAt =
        performance.now();

    showSendingOverlay();

    try {
        const endpoint =
            getVerifiedSubmissionEndpoint(
                form,
            );

        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        Accept:
                            "application/json",
                    },

                    body:
                        new FormData(form),
                },
            );

        let responseData: unknown =
            null;

        try {
            responseData =
                await response.json();
        } catch {
            responseData = null;
        }

        if (
            !response.ok ||
            !isSuccessfulSubmissionResponse(
                responseData,
            )
        ) {
            const reason =
                readSubmissionFailureReason(
                    responseData,
                );

            throw new Error(
                `Verified submission failed: ${response.status} (${reason})`,
            );
        }

        const elapsed =
            performance.now() -
            startedAt;

        const remaining =
            Math.max(
                0,
                minimumDuration -
                    elapsed,
            );

        await wait(remaining);

        window.location.assign(
            successUrl,
        );
    } catch (error) {
        hideSendingOverlay();
        throw error;
    }
}
