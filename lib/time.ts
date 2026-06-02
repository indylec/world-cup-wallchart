const MS_PER_DAY = 86_400_000;

export interface FormattedKickoff {
  weekday: string;
  date: string;
  time: string;
  zoneAbbr: string;
}

export function formatKickoff(utcIso: string, tz: string): FormattedKickoff {
  const d = new Date(utcIso);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(d);

  return {
    weekday: fmt({ weekday: "short" }),
    date: fmt({ month: "short", day: "numeric" }),
    time: fmt({ hour: "numeric", minute: "2-digit" }),
    zoneAbbr: zoneAbbreviation(d, tz),
  };
}

export function dateKey(utcIso: string, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(utcIso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatDayHeading(dateKeyStr: string, tz: string): string {
  const d = new Date(`${dateKeyStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function tournamentDays(matches: { utcKickoff: string }[], tz: string): string[] {
  if (matches.length === 0) return [];
  const keys = matches.map((m) => dateKey(m.utcKickoff, tz)).sort();
  const first = keys[0];
  const last = keys[keys.length - 1];
  const start = Date.parse(`${first}T00:00:00Z`);
  const end = Date.parse(`${last}T00:00:00Z`);
  const out: string[] = [];
  for (let t = start; t <= end; t += MS_PER_DAY) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

function zoneAbbreviation(d: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(d);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
