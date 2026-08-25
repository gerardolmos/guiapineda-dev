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
