import type {
    Commerce,
    CommerceScheduleDay,
} from "../types/commerce";

type Locale = "ca" | "es" | "en";
type DayKey = CommerceScheduleDay["dia"];

const DAY_ORDER: DayKey[] = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
];

const DAY_LABELS: Record<Locale, Record<DayKey, string>> = {
    ca: {
        lunes: "dilluns",
        martes: "dimarts",
        miercoles: "dimecres",
        jueves: "dijous",
        viernes: "divendres",
        sabado: "dissabte",
        domingo: "diumenge",
    },
    es: {
        lunes: "lunes",
        martes: "martes",
        miercoles: "miércoles",
        jueves: "jueves",
        viernes: "viernes",
        sabado: "sábado",
        domingo: "domingo",
    },
    en: {
        lunes: "Monday",
        martes: "Tuesday",
        miercoles: "Wednesday",
        jueves: "Thursday",
        viernes: "Friday",
        sabado: "Saturday",
        domingo: "Sunday",
    },
};

const ATTENTION_LABELS: Record<
    Locale,
    {
        presential: string;
        home: string;
        online: string;
        pickup: string;
        delivery: string;
    }
> = {
    ca: {
        presential: "Presencial",
        home: "A domicili",
        online: "En línia",
        pickup: "Recollida al local",
        delivery: "Repartiment",
    },
    es: {
        presential: "Presencial",
        home: "A domicilio",
        online: "Online",
        pickup: "Recogida en el local",
        delivery: "Reparto",
    },
    en: {
        presential: "In person",
        home: "At home",
        online: "Online",
        pickup: "In-store pickup",
        delivery: "Delivery",
    },
};

function formatTime(
    value?: string | null,
): string | null {
    if (!value) {
        return null;
    }

    const match = value.match(/^(\d{2}):(\d{2})/);

    if (!match) {
        return value;
    }

    const [, hours, minutes] = match;

    return minutes === "00"
        ? hours
        : `${hours}:${minutes}`;
}

function formatTimeRange(
    opening?: string | null,
    closing?: string | null,
    lang: Locale = "ca",
): string | null {
    const start = formatTime(opening);
    const end = formatTime(closing);

    if (!start || !end) {
        return null;
    }

    if (lang === "en") {
        return `${start}–${end}h`;
    }

    return `de ${start} a ${end}h`;
}

function formatHours(
    day: CommerceScheduleDay,
    lang: Locale,
): string | null {
    if (day.cerrado) {
        return null;
    }

    const ranges = [
        formatTimeRange(
            day.apertura_1,
            day.cierre_1,
            lang,
        ),
        formatTimeRange(
            day.apertura_2,
            day.cierre_2,
            lang,
        ),
    ].filter((range): range is string => Boolean(range));

    if (ranges.length === 0) {
        return null;
    }

    const separator =
        lang === "ca"
            ? " i "
            : lang === "es"
              ? " y "
              : " and ";

    return ranges.join(separator);
}

function formatDayRange(
    start: number,
    end: number,
    lang: Locale,
): string {
    const startDay = DAY_ORDER[start];
    const endDay = DAY_ORDER[end];

    if (start === end) {
        const label = DAY_LABELS[lang][startDay];

        return lang === "en"
            ? label
            : label.charAt(0).toUpperCase() + label.slice(1);
    }

    if (lang === "ca") {
        return `De ${DAY_LABELS.ca[startDay]} a ${DAY_LABELS.ca[endDay]}`;
    }

    if (lang === "es") {
        return `De ${DAY_LABELS.es[startDay]} a ${DAY_LABELS.es[endDay]}`;
    }

    return `${DAY_LABELS.en[startDay]} to ${DAY_LABELS.en[endDay]}`;
}

export function formatCommerceScheduleSummary(
    days: CommerceScheduleDay[] | null | undefined,
    lang: Locale,
    maxGroups = 2,
): string[] {
    if (!Array.isArray(days) || days.length === 0) {
        return [];
    }

    const uniqueDays = new Map<DayKey, CommerceScheduleDay>();

    for (const day of days) {
        if (!uniqueDays.has(day.dia)) {
            uniqueDays.set(day.dia, day);
        }
    }

    const groups: {
        start: number;
        end: number;
        hours: string;
    }[] = [];

    DAY_ORDER.forEach((dayKey, index) => {
        const day = uniqueDays.get(dayKey);
        const hours = day ? formatHours(day, lang) : null;

        if (!hours) {
            return;
        }

        const previous = groups.at(-1);

        if (
            previous &&
            previous.hours === hours &&
            previous.end + 1 === index
        ) {
            previous.end = index;
            return;
        }

        groups.push({
            start: index,
            end: index,
            hours,
        });
    });

    const visibleGroups = groups
        .slice(0, maxGroups)
        .map(
            (group) =>
                `${formatDayRange(group.start, group.end, lang)} ${group.hours}`,
        );

    if (groups.length > maxGroups && visibleGroups.length > 0) {
        visibleGroups[visibleGroups.length - 1] += " …";
    }

    return visibleGroups;
}

export function getCommerceAttentionModes(
    commerce: Commerce,
    lang: Locale,
): string[] {
    const labels = ATTENTION_LABELS[lang];
    const modes: string[] = [];

    if (commerce.atencion_presencial) {
        modes.push(labels.presential);
    }

    if (commerce.atencion_domicilio) {
        modes.push(labels.home);
    }

    if (commerce.atencion_online) {
        modes.push(labels.online);
    }

    if (commerce.recogida_local) {
        modes.push(labels.pickup);
    }

    if (commerce.reparto) {
        modes.push(labels.delivery);
    }

    return modes;
}


export type CommerceScheduleDetailLine = {
    label: string;
    hours: string;
    observation: string;
    closed: boolean;
};

export function formatCommerceScheduleDetails(
    days: CommerceScheduleDay[] | null | undefined,
    lang: Locale,
): CommerceScheduleDetailLine[] {
    if (!Array.isArray(days) || days.length === 0) {
        return [];
    }

    const closedLabels: Record<Locale, string> = {
        ca: "tancat",
        es: "cerrado",
        en: "closed",
    };

    const noHoursLabels: Record<Locale, string> = {
        ca: "horari no disponible",
        es: "horario no disponible",
        en: "opening hours unavailable",
    };

    const uniqueDays = new Map<DayKey, CommerceScheduleDay>();

    for (const day of days) {
        if (!uniqueDays.has(day.dia)) {
            uniqueDays.set(day.dia, day);
        }
    }

    const groups: {
        start: number;
        end: number;
        hours: string;
        observation: string;
        closed: boolean;
    }[] = [];

    DAY_ORDER.forEach((dayKey, index) => {
        const day = uniqueDays.get(dayKey);

        if (!day) {
            return;
        }

        const closed = day.cerrado === true;

        const observation =
            lang === "en"
                ? day.observacion_en?.trim() ||
                  day.observacion?.trim() ||
                  ""
                : day.observacion?.trim() || "";

        const hours = closed
            ? closedLabels[lang]
            : formatHours(day, lang) ||
              noHoursLabels[lang];

        const previous = groups.at(-1);

        if (
            previous &&
            previous.end + 1 === index &&
            previous.hours === hours &&
            previous.observation === observation &&
            previous.closed === closed
        ) {
            previous.end = index;
            return;
        }

        groups.push({
            start: index,
            end: index,
            hours,
            observation,
            closed,
        });
    });

    return groups.map((group) => ({
        label: formatDayRange(
            group.start,
            group.end,
            lang,
        ),
        hours: group.hours,
        observation: group.observation,
        closed: group.closed,
    }));
}
