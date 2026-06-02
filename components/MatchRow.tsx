"use client";

import { useFixtures } from "@/lib/fixtures";
import { flagEmoji } from "@/lib/flags";
import { formatKickoff } from "@/lib/time";
import { resolveTimezone, useTimezone } from "@/lib/timezone";
import { usePredictions } from "@/lib/store";
import { getScore } from "@/lib/results";
import type { Match, Stage } from "@/lib/types";
import { ScoreInput } from "./ScoreInput";
import { pairLabel } from "@/lib/bracket";

const slotToLabel = pairLabel;

const STAGE_LABEL: Record<Stage, string> = {
  group: "GROUP",
  r32: "R32",
  r16: "R16",
  qf: "QUARTER",
  sf: "SEMI",
  third: "3RD",
  final: "FINAL",
};

export function GroupMatchRow({ match }: { match: Match }) {
  const tz = resolveTimezone(useTimezone((s) => s.timezone));
  const manual = usePredictions((s) => s.manualResults);
  const k = formatKickoff(match.utcKickoff, tz);
  const score = getScore(match, manual);
  const homeScore = score?.home;
  const awayScore = score?.away;

  return (
    <li className="flex items-center gap-3 py-1.5 border-b border-dotted border-[color:var(--color-dust)]">
      <div className="flex flex-col leading-tight w-[60px] shrink-0">
        <span className="font-mono text-[9px] text-[color:var(--color-ink-soft)] uppercase">
          {k.weekday} {k.date}
        </span>
        <span className="heading-block text-[10px] text-[color:var(--color-red)]">
          {k.time}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <CompactTeamLine code={match.home} score={homeScore} />
        <CompactTeamLine code={match.away} score={awayScore} />
      </div>

      <div className="shrink-0">
        <ScoreInput match={match} />
      </div>
    </li>
  );
}

export function CalendarMatchRow({
  match,
  homeSlot,
  awaySlot,
}: {
  match: Match;
  homeSlot?: string;
  awaySlot?: string;
}) {
  const tz = resolveTimezone(useTimezone((s) => s.timezone));
  const k = formatKickoff(match.utcKickoff, tz);

  const stageLabel =
    match.stage === "group" && match.groupId
      ? `GROUP ${match.groupId}`
      : STAGE_LABEL[match.stage];

  return (
    <li className="flex items-center gap-4 py-3 border-b border-dashed border-[color:var(--color-dust)]">
      <div className="flex flex-col items-center justify-center w-[72px] shrink-0 leading-tight">
        <span className="poster-title text-2xl text-[color:var(--color-navy)]">
          {k.time}
        </span>
        <span className="text-[9px] text-[color:var(--color-dust)] tracking-wider">
          {k.zoneAbbr}
        </span>
      </div>

      <span className="heading-block text-[9px] tracking-[0.15em] w-[72px] shrink-0 text-[color:var(--color-red)] border-l-2 border-[color:var(--color-red)] pl-2">
        {stageLabel}
      </span>

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <TeamFull code={match.home} slot={homeSlot} align="end" />
        <ScoreInput match={match} knockout={match.stage !== "group"} size="md" />
        <TeamFull code={match.away} slot={awaySlot} align="start" />
      </div>

      {match.venue && (
        <span className="hidden md:block serif-flourish text-[11px] text-[color:var(--color-ink-soft)] text-right shrink-0 max-w-[180px] truncate">
          {match.venue}
        </span>
      )}
    </li>
  );
}

function CompactTeamLine({
  code,
  score,
}: {
  code: string | null;
  score: number | undefined;
}) {
  const { data } = useFixtures();
  if (!code) {
    return (
      <span className="flex items-center justify-between gap-2 text-[10px] text-[color:var(--color-dust)]">
        <span>TBD</span>
      </span>
    );
  }
  const team = data?.teams.find((t) => t.code === code);
  return (
    <span className="flex items-center gap-1.5 text-[11px] min-w-0">
      <span className="text-sm leading-none shrink-0" aria-hidden>
        {flagEmoji(team?.flagCode ?? "xx")}
      </span>
      <span className="heading-block text-[10px] shrink-0">{code}</span>
      {Number.isFinite(score) && (
        <span className="font-mono ml-auto text-[10px] text-[color:var(--color-ink-soft)]">
          {score}
        </span>
      )}
    </span>
  );
}

function TeamFull({
  code,
  slot,
  align,
}: {
  code: string | null;
  slot?: string;
  align: "start" | "end";
}) {
  const { data } = useFixtures();
  const alignClass = align === "end" ? "justify-end text-right" : "justify-start text-left";

  if (!code) {
    return (
      <span className={`flex-1 flex items-center gap-2 ${alignClass} text-[color:var(--color-dust)]`}>
        <span className="serif-flourish text-sm italic">
          {slot ? slotToLabel(slot) : "TBD"}
        </span>
      </span>
    );
  }
  const team = data?.teams.find((t) => t.code === code);
  return (
    <span className={`flex-1 flex items-center gap-2 min-w-0 ${alignClass}`}>
      {align === "start" && (
        <span className="text-lg leading-none shrink-0" aria-hidden>
          {flagEmoji(team?.flagCode ?? "xx")}
        </span>
      )}
      <span className="flex flex-col leading-tight min-w-0">
        <span className="heading-block text-xs">{code}</span>
        <span className="text-[10px] text-[color:var(--color-ink-soft)] truncate">
          {team?.name ?? code}
        </span>
      </span>
      {align === "end" && (
        <span className="text-lg leading-none shrink-0" aria-hidden>
          {flagEmoji(team?.flagCode ?? "xx")}
        </span>
      )}
    </span>
  );
}
