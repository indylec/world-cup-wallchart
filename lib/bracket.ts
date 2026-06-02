import bracketDef from "@/data/bracket-2026.json";
import { knockoutWinner } from "./results";
import type {
  GroupId,
  GroupStanding,
  ManualResult,
  Match,
  Score,
  Stage,
} from "./types";
import { GROUP_IDS } from "./types";

export interface BracketPair {
  id: string;
  homeSlot: string;
  awaySlot: string;
}

interface BracketDefShape {
  r32: { id: string; home: string; away: string }[];
  r16: { id: string; home: string; away: string }[];
  qf: { id: string; home: string; away: string }[];
  sf: { id: string; home: string; away: string }[];
  third: { id: string; home: string; away: string };
  final: { id: string; home: string; away: string };
}

const def = bracketDef as unknown as BracketDefShape;

export const BRACKET = {
  r32: def.r32.map(toPair),
  r16: def.r16.map(toPair),
  qf: def.qf.map(toPair),
  sf: def.sf.map(toPair),
  third: toPair(def.third),
  final: toPair(def.final),
};

function toPair(x: { id: string; home: string; away: string }): BracketPair {
  return { id: x.id, homeSlot: x.home, awaySlot: x.away };
}

export function rankThirdPlaceTeams(
  groupStandings: Map<GroupId, GroupStanding[]>,
): GroupStanding[] {
  const thirds: GroupStanding[] = [];
  for (const id of GROUP_IDS) {
    const row = groupStandings.get(id)?.[2];
    if (row) thirds.push(row);
  }
  return [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

export interface BracketState {
  resolvedTeam: Map<string, string | null>;
  matchByPairId: Map<string, Match | undefined>;
  pairByMatchId: Map<string, BracketPair>;
}

export function resolveBracket(
  groupStandings: Map<GroupId, GroupStanding[]>,
  matches: Match[],
  manual: Record<string, ManualResult>,
): BracketState {
  const thirdRanking = rankThirdPlaceTeams(groupStandings);
  const resolved = new Map<string, string | null>();

  const knockoutMatchesByStage: Record<Stage, Match[]> = {
    group: [],
    r32: [],
    r16: [],
    qf: [],
    sf: [],
    third: [],
    final: [],
  };
  for (const m of matches) {
    if (m.stage !== "group") knockoutMatchesByStage[m.stage].push(m);
  }
  for (const arr of Object.values(knockoutMatchesByStage)) {
    arr.sort((a, b) => a.utcKickoff.localeCompare(b.utcKickoff));
  }

  const matchByPairId = new Map<string, Match | undefined>();
  const pairsInOrder: { stage: Stage; pair: BracketPair }[] = [
    ...BRACKET.r32.map((pair) => ({ stage: "r32" as Stage, pair })),
    ...BRACKET.r16.map((pair) => ({ stage: "r16" as Stage, pair })),
    ...BRACKET.qf.map((pair) => ({ stage: "qf" as Stage, pair })),
    ...BRACKET.sf.map((pair) => ({ stage: "sf" as Stage, pair })),
    { stage: "third" as Stage, pair: BRACKET.third },
    { stage: "final" as Stage, pair: BRACKET.final },
  ];

  const pairByMatchId = new Map<string, BracketPair>();
  for (const { stage, pair } of pairsInOrder) {
    const m = knockoutMatchesByStage[stage].shift();
    matchByPairId.set(pair.id, m);
    if (m) pairByMatchId.set(m.id, pair);
  }

  const resolveSlot = (slot: string): string | null => {
    if (resolved.has(slot)) return resolved.get(slot) ?? null;
    const value = computeSlot(slot, groupStandings, thirdRanking, (pid) => {
      const m = matchByPairId.get(pid);
      const score = m ? manual[m.id]?.score ?? m.score : undefined;
      const winner = knockoutWinner(score);
      if (!winner) return { homeTeam: null, awayTeam: null, winner: null };
      const pair = findPair(pid);
      if (!pair) return { homeTeam: null, awayTeam: null, winner: null };
      const homeTeam = resolveSlot(pair.homeSlot);
      const awayTeam = resolveSlot(pair.awaySlot);
      return {
        homeTeam,
        awayTeam,
        winner:
          winner === "home"
            ? homeTeam
            : winner === "away"
              ? awayTeam
              : null,
      };
    });
    resolved.set(slot, value);
    return value;
  };

  for (const { pair } of pairsInOrder) {
    resolveSlot(pair.homeSlot);
    resolveSlot(pair.awaySlot);
  }

  return { resolvedTeam: resolved, matchByPairId, pairByMatchId };
}

function findPair(id: string): BracketPair | undefined {
  return (
    BRACKET.r32.find((p) => p.id === id) ??
    BRACKET.r16.find((p) => p.id === id) ??
    BRACKET.qf.find((p) => p.id === id) ??
    BRACKET.sf.find((p) => p.id === id) ??
    (BRACKET.third.id === id ? BRACKET.third : undefined) ??
    (BRACKET.final.id === id ? BRACKET.final : undefined)
  );
}

function computeSlot(
  slot: string,
  groupStandings: Map<GroupId, GroupStanding[]>,
  thirdRanking: GroupStanding[],
  knockoutInfo: (pairId: string) => {
    homeTeam: string | null;
    awayTeam: string | null;
    winner: string | null;
  },
): string | null {
  const groupPos = slot.match(/^([123])([A-L])$/);
  if (groupPos) {
    const pos = Number(groupPos[1]) - 1;
    const g = groupPos[2] as GroupId;
    const standings = groupStandings.get(g);
    if (!standings || standings.length === 0) return null;
    const allPlayed = standings.every((s) => s.played === 3);
    if (!allPlayed) return null;
    return standings[pos]?.team ?? null;
  }

  const third = slot.match(/^3-([1-8])$/);
  if (third) {
    const rank = Number(third[1]) - 1;
    if (thirdRanking.length < 8) return null;
    const allDone = thirdRanking.every((s) => s.played === 3);
    if (!allDone) return null;
    return thirdRanking[rank]?.team ?? null;
  }

  const winnerOf = slot.match(/^W-(.+)$/);
  if (winnerOf) return knockoutInfo(winnerOf[1]).winner;

  const loserOf = slot.match(/^L-(.+)$/);
  if (loserOf) {
    const info = knockoutInfo(loserOf[1]);
    if (!info.winner || !info.homeTeam || !info.awayTeam) return null;
    return info.winner === info.homeTeam ? info.awayTeam : info.homeTeam;
  }

  return null;
}

export function pairLabel(slot: string): string {
  if (/^[12][A-L]$/.test(slot)) {
    const pos = slot[0] === "1" ? "Winner" : "Runner-up";
    return `${pos} ${slot[1]}`;
  }
  if (/^3-[1-8]$/.test(slot)) {
    return `Best 3rd #${slot.slice(2)}`;
  }
  if (slot.startsWith("W-")) return `Winner ${slot.slice(2).toUpperCase()}`;
  if (slot.startsWith("L-")) return `Loser ${slot.slice(2).toUpperCase()}`;
  return slot;
}
