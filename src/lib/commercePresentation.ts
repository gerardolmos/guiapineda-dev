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
        lunes: "dl.",
        martes: "dt.",
        miercoles: "dc.",
        jueves: "dj.",
        viernes: "dv.",
        sabado: "ds.",
        domingo: "dg.",
    },
    es: {
        lunes: "lun.",
        martes: "mar.",
        miercoles: "mié.",
        jueves: "jue.",
        viernes: "vie.",
        sabado: "sáb.",
        domingo: "dom.",
    },
    en: {
        lunes: "Mon",
        martes: "Tue",
        miercoles: "Wed",
        jueves: "Thu",
        viernes: "Fri",
        sabado: "Sat",
        domingo: "Sun",
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

function formatTime(value?: string | null): string | null {
    if (!value) {
        return null;
    }

    const match = value.match(/^(\d{2}):(\d{2})/);

    return match ? `${match[1]}:${match[2]}` : value;
}

function formatHours(day: CommerceScheduleDay): string | null {
    if (day.cerrado) {
        return null;
    }

    const opening1 = formatTime(day.apertura_1);
    const closing1 = formatTime(day.cierre_1);
    const opening2 = formatTime(day.apertura_2);
    const closing2 = formatTime(day.cierre_2);

    const ranges: string[] = [];

    if (opening1 && closing1) {
        ranges.push(`${opening1}–${closing1}`);
    }

    if (opening2 && closing2) {
        ranges.push(`${opening2}–${closing2}`);
    }

    return ranges.length > 0 ? ranges.join(" / ") : null;
}

function formatDayRange(
    start: number,
    end: number,
    lang: Locale,
): string {
    const startDay = DAY_ORDER[start];
    const endDay = DAY_ORDER[end];

    if (start === end) {
        return DAY_LABELS[lang][startDay];
    }

    return `${DAY_LABELS[lang][startDay]}–${DAY_LABELS[lang][endDay]}`;
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
        const hours = day ? formatHours(day) : null;

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
