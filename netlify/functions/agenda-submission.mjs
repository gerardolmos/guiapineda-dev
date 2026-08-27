const LANGUAGES = new Set(["ca", "es", "en"]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL_CHARACTERS =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function fail(reason) {
    return {
        ok: false,
        reason,
    };
}

function readString(
    data,
    field,
    {
        required = false,
        min = 0,
        max,
    } = {},
) {
    const raw = data[field];

    if (raw === undefined || raw === null) {
        return required
            ? fail(`${field}:missing`)
            : { ok: true, value: null };
    }

    if (typeof raw !== "string") {
        return fail(`${field}:type`);
    }

    const value = raw.trim();

    if (!value) {
        return required
            ? fail(`${field}:empty`)
            : { ok: true, value: null };
    }

    if (CONTROL_CHARACTERS.test(value)) {
        return fail(`${field}:control-characters`);
    }

    if (value.length < min) {
        return fail(`${field}:too-short`);
    }

    if (max && value.length > max) {
        return fail(`${field}:too-long`);
    }

    return {
        ok: true,
        value,
    };
}

function isValidDate(value) {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] =
        value.split("-").map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day),
    );

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function getTodayInMadrid(now = new Date()) {
    const parts = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Europe/Madrid",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).formatToParts(now);

    const values = Object.fromEntries(
        parts
            .filter(
                (part) =>
                    part.type !== "literal",
            )
            .map(
                (part) => [
                    part.type,
                    part.value,
                ],
            ),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

function normalizeTime(value) {
    if (!value) {
        return {
            ok: true,
            value: null,
        };
    }

    const match = TIME_PATTERN.exec(value);

    if (!match) {
        return fail("time:invalid");
    }

    return {
        ok: true,
        value:
            `${match[1]}:${match[2]}:` +
            `${match[3] ?? "00"}.000`,
    };
}

function validateHttpUrl(value) {
    if (!value) {
        return {
            ok: true,
            value: null,
        };
    }

    try {
        const url = new URL(value);

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {
            return fail("url:protocol");
        }

        return {
            ok: true,
            value: url.toString(),
        };
    } catch {
        return fail("url:invalid");
    }
}

export function buildAgendaPayload(
    data,
    now = new Date(),
) {
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return fail("submission:invalid");
    }

    if (
        typeof data["bot-field"] === "string" &&
        data["bot-field"].trim()
    ) {
        return fail("submission:honeypot");
    }

    const language = readString(
        data,
        "idioma_solicitud",
        {
            required: true,
            min: 2,
            max: 2,
        },
    );

    if (!language.ok) {
        return language;
    }

    if (!LANGUAGES.has(language.value)) {
        return fail("idioma_solicitud:invalid");
    }

    const title = readString(
        data,
        "titol",
        {
            required: true,
            min: 8,
            max: 140,
        },
    );

    if (!title.ok) {
        return title;
    }

    const summary = readString(
        data,
        "resum",
        {
            required: true,
            min: 30,
            max: 400,
        },
    );

    if (!summary.ok) {
        return summary;
    }

    const description = readString(
        data,
        "descripcio",
        {
            required: true,
            min: 80,
            max: 3500,
        },
    );

    if (!description.ok) {
        return description;
    }

    const organiser = readString(
        data,
        "organitzador",
        {
            required: true,
            min: 2,
            max: 160,
        },
    );

    if (!organiser.ok) {
        return organiser;
    }

    const startDate = readString(
        data,
        "data_inici",
        {
            required: true,
            min: 10,
            max: 10,
        },
    );

    if (
        !startDate.ok ||
        !isValidDate(startDate.value)
    ) {
        return fail("data_inici:invalid");
    }

    const endDate = readString(
        data,
        "data_final",
        {
            max: 10,
        },
    );

    if (!endDate.ok) {
        return endDate;
    }

    if (
        endDate.value &&
        !isValidDate(endDate.value)
    ) {
        return fail("data_final:invalid");
    }

    if (
        endDate.value &&
        endDate.value < startDate.value
    ) {
        return fail("dates:invalid-order");
    }

    const effectiveEnd =
        endDate.value ?? startDate.value;

    if (
        effectiveEnd <
        getTodayInMadrid(now)
    ) {
        return fail("dates:event-finished");
    }

    const startTimeRaw = readString(
        data,
        "hora_inici",
        {
            max: 12,
        },
    );

    if (!startTimeRaw.ok) {
        return startTimeRaw;
    }

    const endTimeRaw = readString(
        data,
        "hora_final",
        {
            max: 12,
        },
    );

    if (!endTimeRaw.ok) {
        return endTimeRaw;
    }

    const startTime =
        normalizeTime(startTimeRaw.value);

    if (!startTime.ok) {
        return fail("hora_inici:invalid");
    }

    const endTime =
        normalizeTime(endTimeRaw.value);

    if (!endTime.ok) {
        return fail("hora_final:invalid");
    }

    if (
        endTime.value &&
        !startTime.value
    ) {
        return fail(
            "hora_final:without-start",
        );
    }

    if (
        startTime.value &&
        endTime.value &&
        effectiveEnd === startDate.value &&
        endTime.value <= startTime.value
    ) {
        return fail("times:invalid-order");
    }

    const place = readString(
        data,
        "lloc",
        {
            required: true,
            min: 2,
            max: 180,
        },
    );

    if (!place.ok) {
        return place;
    }

    const address = readString(
        data,
        "adreca",
        {
            max: 250,
        },
    );

    if (!address.ok) {
        return address;
    }

    const officialUrlRaw = readString(
        data,
        "enllac_oficial",
        {
            max: 500,
        },
    );

    if (!officialUrlRaw.ok) {
        return officialUrlRaw;
    }

    const officialUrl =
        validateHttpUrl(
            officialUrlRaw.value,
        );

    if (!officialUrl.ok) {
        return officialUrl;
    }

    const contactName = readString(
        data,
        "nombre_contacto",
        {
            required: true,
            min: 2,
            max: 120,
        },
    );

    if (!contactName.ok) {
        return contactName;
    }

    const contactEmail = readString(
        data,
        "email_contacto",
        {
            required: true,
            min: 5,
            max: 254,
        },
    );

    if (
        !contactEmail.ok ||
        !EMAIL_PATTERN.test(
            contactEmail.value,
        )
    ) {
        return fail("email_contacto:invalid");
    }

    if (
        data.aceptacion_privacidad !==
        "true"
    ) {
        return fail(
            "aceptacion_privacidad:required",
        );
    }

    return {
        ok: true,
        payload: {
            idioma_solicitud:
                language.value,
            titol: title.value,
            resum: summary.value,
            descripcio:
                description.value,
            organitzador:
                organiser.value,
            data_inici:
                startDate.value,
            hora_inici:
                startTime.value,
            data_final:
                endDate.value,
            hora_final:
                endTime.value,
            lloc: place.value,
            adreca:
                address.value,
            enllac_oficial:
                officialUrl.value,
            nombre_contacto:
                contactName.value,
            email_contacto:
                contactEmail.value,
            aceptacion_privacidad:
                true,
        },
    };
}

async function createAgendaRequest(
    payload,
) {
    const rawUrl =
        process.env.GUIAPINEDA_STRAPI_URL;

    const token =
        process.env.GUIAPINEDA_STRAPI_AGENDA_TOKEN;

    if (!rawUrl || !token) {
        throw new Error(
            "Agenda Strapi configuration is missing.",
        );
    }

    const baseUrl =
        rawUrl.trim().replace(/\/+$/, "");

    const response = await fetch(
        `${baseUrl}/api/solicitudes-agenda`,
        {
            method: "POST",
            headers: {
                Authorization:
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                data: payload,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            `Agenda Strapi request failed: ${response.status}`,
        );
    }
}

export default {
    async formSubmitted(event) {
        const data = event?.data;

        if (
            !data ||
            data["form-name"] !== "agenda"
        ) {
            return;
        }

        const result =
            buildAgendaPayload(data);

        if (!result.ok) {
            console.warn(
                `Agenda submission rejected: ${result.reason}`,
            );
            return;
        }

        await createAgendaRequest(
            result.payload,
        );

        console.info(
            "Agenda submission stored in Strapi.",
        );
    },
};
