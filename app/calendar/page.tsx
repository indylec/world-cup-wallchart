"use client";

import { useEffect, useState } from "react";
import { useFixtures } from "@/lib/fixtures";
import { usePredictions } from "@/lib/store";
import { CalendarMatchRow } from "@/components/MatchRow";
import { dateKey, formatDayHeading, tournamentDays } from "@/lib/time";
import { resolveTimezone, useTimezone } from "@/lib/timezone";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { computeGroupStandings } from "@/lib/standings";
import { getScore } from "@/lib/results";
import { resolveBracket, type BracketState } from "@/lib/bracket";
import { GROUP_IDS, type GroupId, type GroupStanding, type Match } from "@/lib/types";

export default function CalendarPage() {
  const { data, isLoading, error } = useFixtures();
  const manual = usePredictions((s) => s.manualResults);
  const tz = resolveTimezone(useTimezone((s) => s.timezone));
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(dateKey(new Date().toISOString(), tz));
  }, [tz]);

  return (
    <main className="mx-auto max-w-[1100px] px-6 md:px-12 py-12">
      <Header />

      {error && (
        <p className="serif-flourish text-[color:var(--color-red)]">
          Could not load fixtures.
        </p>
      )}

      {isLoading && !data && (
        <p className="serif-flourish text-[color:var(--color-ink-soft)]">
          Loading the schedule…
        </p>
      )}

      {data && data.matches.length === 0 && (
        <p className="serif-flourish text-[color:var(--color-ink-soft)]">
          No fixtures loaded yet — add your <code>FOOTBALL_DATA_API_KEY</code> to{" "}
          <code>.env.local</code> and restart.
        </p>
      )}

      {data && data.matches.length > 0 && (
        <CalendarBody
          matches={data.matches}
          state={buildState(data.teams, data.matches, manual)}
          tz={tz}
          today={today}
        />
      )}
    </main>
  );
}

function buildState(
  teams: { code: string; group: GroupId; flagCode: string; name: string }[],
  matches: Match[],
  manual: Parameters<typeof resolveBracket>[2],
): BracketState {
  const groupStandings = new Map<GroupId, GroupStanding[]>();
  for (const id of GROUP_IDS) {
    const gTeams = teams.filter((t) => t.group === id);
    const gMatches = matches.filter((m) => m.stage === "group" && m.groupId === id);
    groupStandings.set(
      id,
      computeGroupStandings(gTeams, gMatches, (m) => getScore(m, manual)),
    );
  }
  return resolveBracket(groupStandings, matches, manual);
}

function CalendarBody({
  matches,
  state,
  tz,
  today,
}: {
  matches: Match[];
  state: BracketState;
  tz: string;
  today: string | null;
}) {
  const days = tournamentDays(matches, tz);

  const byDay = new Map<string, Match[]>();
  for (const m of matches) {
    const k = dateKey(m.utcKickoff, tz);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(m);
  }
  for (const arr of byDay.values()) {
    arr.sort((a, b) => a.utcKickoff.localeCompare(b.utcKickoff));
  }

  return (
    <div className="space-y-10">
      {days.map((day) => {
        const dayMatches = byDay.get(day) ?? [];
        const isToday = day === today;
        return (
          <section
            key={day}
            className={
              isToday
                ? "border-l-4 border-[color:var(--color-red)] pl-5"
                : "pl-5 border-l-4 border-transparent"
            }
          >
            <div className="flex items-baseline justify-between mb-3 border-b-2 border-[color:var(--color-ink)] pb-1">
              <h3 className="poster-title text-3xl text-[color:var(--color-navy)]">
                {formatDayHeading(day, tz)}
              </h3>
              {isToday && (
                <span className="heading-block text-[10px] tracking-[0.2em] text-[color:var(--color-red)]">
                  · today ·
                </span>
              )}
            </div>

            {dayMatches.length === 0 ? (
              <p className="serif-flourish text-sm text-[color:var(--color-dust)] py-2">
                rest day
              </p>
            ) : (
              <ul>
                {dayMatches.map((m) => {
                  const pair = state.pairByMatchId.get(m.id);
                  const homeFromBracket = pair
                    ? state.resolvedTeam.get(pair.homeSlot) ?? null
                    : null;
                  const awayFromBracket = pair
                    ? state.resolvedTeam.get(pair.awaySlot) ?? null
                    : null;
                  const effective: Match = pair
                    ? {
                        ...m,
                        home: homeFromBracket ?? m.home,
                        away: awayFromBracket ?? m.away,
                      }
                    : m;
                  return (
                    <CalendarMatchRow
                      key={m.id}
                      match={effective}
                      homeSlot={pair?.homeSlot}
                      awaySlot={pair?.awaySlot}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Header() {
  return (
    <header className="mb-10">
      <p className="heading-block text-xs text-[color:var(--color-red)] mb-2 tracking-[0.18em]">
        DAY BY DAY · ALL 104 MATCHES
      </p>
      <h1 className="poster-title text-[clamp(3rem,9vw,6rem)] leading-none text-[color:var(--color-navy)]">
        The Calendar
      </h1>
      <div className="mt-4 h-1 w-32 bg-[color:var(--color-mustard)]" />
      <DataSourceBadge />
    </header>
  );
}
