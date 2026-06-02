"use client";

import { useFixtures } from "@/lib/fixtures";
import { usePredictions } from "@/lib/store";
import { computeGroupStandings } from "@/lib/standings";
import { getScore } from "@/lib/results";
import {
  BRACKET,
  resolveBracket,
  pairLabel,
  type BracketPair,
  type BracketState,
} from "@/lib/bracket";
import { flagEmoji } from "@/lib/flags";
import { formatKickoff } from "@/lib/time";
import { resolveTimezone, useTimezone } from "@/lib/timezone";
import { GROUP_IDS, type GroupId, type Match, type Team } from "@/lib/types";
import { ScoreInput } from "./ScoreInput";

export function BracketSection() {
  const { data, isLoading } = useFixtures();
  const manual = usePredictions((s) => s.manualResults);
  const tz = resolveTimezone(useTimezone((s) => s.timezone));

  if (isLoading || !data || data.teams.length === 0) {
    return (
      <div className="bg-[color:var(--color-paper-deep)] border-2 border-[color:var(--color-ink)] p-8 shadow-[6px_6px_0_0_var(--color-ink)]">
        <p className="serif-flourish text-center text-[color:var(--color-ink-soft)]">
          Bracket will appear once fixtures load.
        </p>
      </div>
    );
  }

  const groupStandings = new Map<GroupId, ReturnType<typeof computeGroupStandings>>();
  for (const id of GROUP_IDS) {
    const teams = data.teams.filter((t) => t.group === id);
    const groupMatches = data.matches.filter(
      (m) => m.stage === "group" && m.groupId === id,
    );
    groupStandings.set(
      id,
      computeGroupStandings(teams, groupMatches, (m) => getScore(m, manual)),
    );
  }

  const state = resolveBracket(groupStandings, data.matches, manual);
  const teamByCode = new Map(data.teams.map((t) => [t.code, t]));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.2fr_1fr_0.9fr_0.9fr] gap-4 lg:gap-3">
        <Column title="Round of 32" pairs={BRACKET.r32} state={state} teamByCode={teamByCode} tz={tz} />
        <Column title="Round of 16" pairs={BRACKET.r16} state={state} teamByCode={teamByCode} tz={tz} />
        <Column title="Quarter-finals" pairs={BRACKET.qf} state={state} teamByCode={teamByCode} tz={tz} />
        <Column title="Semi-finals" pairs={BRACKET.sf} state={state} teamByCode={teamByCode} tz={tz} />
        <div className="flex flex-col justify-center gap-4">
          <ColumnTitle>Final</ColumnTitle>
          <BracketCard pair={BRACKET.final} state={state} teamByCode={teamByCode} tz={tz} emphasis="final" />
          <ColumnTitle>3rd place</ColumnTitle>
          <BracketCard pair={BRACKET.third} state={state} teamByCode={teamByCode} tz={tz} emphasis="third" />
        </div>
      </div>

      <p className="serif-flourish text-[10px] text-[color:var(--color-dust)] text-center max-w-2xl mx-auto">
        Bracket pairings are stored in <code>data/bracket-2026.json</code> — verify against FIFA's
        official 2026 bracket and edit if any pairing looks off. Slot labels (1A, 2B, 3-1, etc.)
        fill in automatically once group standings or earlier knockouts are decided.
      </p>
    </div>
  );
}

function Column({
  title,
  pairs,
  state,
  teamByCode,
  tz,
}: {
  title: string;
  pairs: BracketPair[];
  state: BracketState;
  teamByCode: Map<string, Team>;
  tz: string;
}) {
  return (
    <div className="flex flex-col">
      <ColumnTitle>{title}</ColumnTitle>
      <div className="flex flex-col justify-around gap-3 grow">
        {pairs.map((p) => (
          <BracketCard
            key={p.id}
            pair={p}
            state={state}
            teamByCode={teamByCode}
            tz={tz}
          />
        ))}
      </div>
    </div>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="heading-block text-[10px] tracking-[0.2em] text-[color:var(--color-red)] mb-2 pb-1 border-b border-[color:var(--color-ink)]">
      {children}
    </p>
  );
}

function BracketCard({
  pair,
  state,
  teamByCode,
  tz,
  emphasis,
}: {
  pair: BracketPair;
  state: BracketState;
  teamByCode: Map<string, Team>;
  tz: string;
  emphasis?: "final" | "third";
}) {
  const match = state.matchByPairId.get(pair.id);
  const homeTeam = state.resolvedTeam.get(pair.homeSlot) ?? null;
  const awayTeam = state.resolvedTeam.get(pair.awaySlot) ?? null;

  const matchForInput: Match | null = match
    ? { ...match, home: homeTeam ?? match.home, away: awayTeam ?? match.away }
    : null;

  const kickoff = match ? formatKickoff(match.utcKickoff, tz) : null;

  const cardBase =
    "bg-[color:var(--color-paper)] border-2 border-[color:var(--color-ink)] p-2 text-[11px]";
  const cardEm =
    emphasis === "final"
      ? "border-[color:var(--color-red)] shadow-[4px_4px_0_0_var(--color-red)]"
      : emphasis === "third"
        ? "border-[color:var(--color-mustard)] shadow-[4px_4px_0_0_var(--color-mustard)]"
        : "shadow-[3px_3px_0_0_var(--color-ink)]";

  return (
    <article className={`${cardBase} ${cardEm}`}>
      {kickoff && (
        <p className="heading-block text-[8px] tracking-[0.15em] text-[color:var(--color-ink-soft)] mb-1 flex justify-between">
          <span>{pair.id.toUpperCase()}</span>
          <span>{kickoff.date} · {kickoff.time}</span>
        </p>
      )}
      <BracketTeamLine slot={pair.homeSlot} code={homeTeam} teamByCode={teamByCode} />
      {matchForInput && (
        <div className="my-1 flex justify-center">
          <ScoreInput match={matchForInput} knockout size="sm" />
        </div>
      )}
      <BracketTeamLine slot={pair.awaySlot} code={awayTeam} teamByCode={teamByCode} />
    </article>
  );
}

function BracketTeamLine({
  slot,
  code,
  teamByCode,
}: {
  slot: string;
  code: string | null;
  teamByCode: Map<string, Team>;
}) {
  if (code) {
    const team = teamByCode.get(code);
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none shrink-0" aria-hidden>
          {flagEmoji(team?.flagCode ?? "xx")}
        </span>
        <span className="heading-block text-[11px]">{code}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[color:var(--color-dust)]">
      <span className="text-sm shrink-0" aria-hidden>
        ◌
      </span>
      <span className="serif-flourish text-[10px] italic">{pairLabel(slot)}</span>
    </div>
  );
}
