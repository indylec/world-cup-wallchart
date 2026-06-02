"use client";

import { useFixtures } from "@/lib/fixtures";
import { usePredictions } from "@/lib/store";
import { getScore } from "@/lib/results";
import { computeGroupStandings } from "@/lib/standings";
import { GROUP_IDS, type GroupId, type GroupStanding, type Match, type Team } from "@/lib/types";
import { flagEmoji } from "@/lib/flags";
import { GroupMatchRow } from "./MatchRow";

export function GroupsBoard() {
  const { data, isLoading } = useFixtures();
  const manual = usePredictions((s) => s.manualResults);

  const teamsByGroup = new Map<GroupId, Team[]>(GROUP_IDS.map((id) => [id, []]));
  const matchesByGroup = new Map<GroupId, Match[]>(GROUP_IDS.map((id) => [id, []]));

  if (data) {
    for (const t of data.teams) teamsByGroup.get(t.group)?.push(t);
    for (const m of data.matches) {
      if (m.stage === "group" && m.groupId) {
        matchesByGroup.get(m.groupId)?.push(m);
      }
    }
    for (const arr of matchesByGroup.values()) {
      arr.sort((a, b) => a.utcKickoff.localeCompare(b.utcKickoff));
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {GROUP_IDS.map((id) => {
        const teams = teamsByGroup.get(id) ?? [];
        const matches = matchesByGroup.get(id) ?? [];
        const standings = computeGroupStandings(teams, matches, (m) => getScore(m, manual));
        return (
          <GroupCard
            key={id}
            id={id}
            teams={teams}
            matches={matches}
            standings={standings}
            loading={isLoading}
          />
        );
      })}
    </div>
  );
}

const QUAL_COLOR: Record<number, string> = {
  0: "var(--color-jade)",
  1: "var(--color-jade)",
  2: "var(--color-mustard)",
  3: "var(--color-dust)",
};

function GroupCard({
  id,
  teams,
  matches,
  standings,
  loading,
}: {
  id: GroupId;
  teams: Team[];
  matches: Match[];
  standings: GroupStanding[];
  loading: boolean;
}) {
  const teamByCode = new Map(teams.map((t) => [t.code, t]));
  const placeholderRows = teams.length === 0;

  return (
    <article className="bg-[color:var(--color-paper-deep)] border-2 border-[color:var(--color-ink)] p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
      <header className="flex items-baseline justify-between border-b-2 border-[color:var(--color-ink)] pb-2 mb-3">
        <span className="heading-block text-xs">Group</span>
        <span className="poster-title text-5xl text-[color:var(--color-red)]">{id}</span>
      </header>

      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="heading-block text-[9px] text-[color:var(--color-ink-soft)] tracking-wider">
            <th className="text-left font-normal pb-1">Team</th>
            <th className="text-right font-normal pb-1 w-6">P</th>
            <th className="text-right font-normal pb-1 w-7">GD</th>
            <th className="text-right font-normal pb-1 w-7">Pts</th>
          </tr>
        </thead>
        <tbody>
          {placeholderRows
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-dashed border-[color:var(--color-dust)]">
                  <td className="py-1 text-[color:var(--color-dust)]">
                    {loading ? "loading…" : "TBD"}
                  </td>
                  <td colSpan={3} />
                </tr>
              ))
            : standings.map((row, idx) => {
                const team = teamByCode.get(row.team);
                const stripe = QUAL_COLOR[idx] ?? "transparent";
                return (
                  <tr key={row.team} className="border-b border-dashed border-[color:var(--color-dust)]">
                    <td className="py-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block w-1 h-4 shrink-0"
                          style={{ background: stripe }}
                          aria-hidden
                        />
                        <span className="text-base leading-none shrink-0" aria-hidden>
                          {flagEmoji(team?.flagCode ?? "xx")}
                        </span>
                        <span className="heading-block text-[11px]">{row.team}</span>
                      </span>
                    </td>
                    <td className="text-right font-mono text-[11px]">{row.played}</td>
                    <td className="text-right font-mono text-[11px]">
                      {row.goalDifference > 0 ? "+" : ""}
                      {row.goalDifference}
                    </td>
                    <td className="text-right font-mono text-[11px] font-bold">{row.points}</td>
                  </tr>
                );
              })}
        </tbody>
      </table>

      {matches.length > 0 && (
        <div className="border-t-2 border-[color:var(--color-ink)] pt-2">
          <p className="heading-block text-[9px] tracking-[0.18em] text-[color:var(--color-ink-soft)] mb-1">
            Fixtures
          </p>
          <ul className="space-y-0">
            {matches.map((m) => (
              <GroupMatchRow key={m.id} match={m} />
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
