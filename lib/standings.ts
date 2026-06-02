import type { GroupStanding, Match, Score, Team } from "./types";

function emptyRow(team: string): GroupStanding {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function applyResult(row: GroupStanding, gf: number, ga: number): GroupStanding {
  const won = gf > ga ? 1 : 0;
  const drawn = gf === ga ? 1 : 0;
  const lost = gf < ga ? 1 : 0;
  return {
    ...row,
    played: row.played + 1,
    won: row.won + won,
    drawn: row.drawn + drawn,
    lost: row.lost + lost,
    goalsFor: row.goalsFor + gf,
    goalsAgainst: row.goalsAgainst + ga,
    goalDifference: row.goalDifference + (gf - ga),
    points: row.points + (won ? 3 : drawn ? 1 : 0),
  };
}

export function computeGroupStandings(
  groupTeams: Team[],
  matches: Match[],
  scoreFor: (match: Match) => Score | undefined,
): GroupStanding[] {
  const rows = new Map<string, GroupStanding>();
  for (const t of groupTeams) rows.set(t.code, emptyRow(t.code));

  for (const m of matches) {
    if (m.stage !== "group") continue;
    if (!m.home || !m.away) continue;
    const s = scoreFor(m);
    if (!s) continue;
    const homeRow = rows.get(m.home);
    const awayRow = rows.get(m.away);
    if (!homeRow || !awayRow) continue;
    rows.set(m.home, applyResult(homeRow, s.home, s.away));
    rows.set(m.away, applyResult(awayRow, s.away, s.home));
  }

  return [...rows.values()].sort(sortStandings);
}

function sortStandings(a: GroupStanding, b: GroupStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.localeCompare(b.team);
}
