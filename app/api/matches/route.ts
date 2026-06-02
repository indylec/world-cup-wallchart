import { NextResponse } from "next/server";
import type { Fixtures, Match, Stage, Team, GroupId } from "@/lib/types";
import placeholder from "@/data/fixtures.placeholder.json";
import venuesData from "@/data/venues.json";

const venues = venuesData as Record<string, string>;

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const COMPETITION_CODE = "WC";

export const revalidate = 60;

export async function GET(): Promise<NextResponse<Fixtures>> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(placeholder as Fixtures, {
      headers: { "x-data-source": "placeholder" },
    });
  }

  try {
    const [teamsRes, matchesRes] = await Promise.all([
      fetch(`${FOOTBALL_DATA_BASE}/competitions/${COMPETITION_CODE}/teams`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600, tags: ["wc-teams"] },
      }),
      fetch(`${FOOTBALL_DATA_BASE}/competitions/${COMPETITION_CODE}/matches`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 60, tags: ["wc-matches"] },
      }),
    ]);

    if (!teamsRes.ok || !matchesRes.ok) {
      throw new Error(
        `football-data error: teams=${teamsRes.status} matches=${matchesRes.status}`,
      );
    }

    const teamsJson = await teamsRes.json();
    const matchesJson = await matchesRes.json();

    const matches = normalizeMatches(matchesJson).map((m) => ({
      ...m,
      venue: m.venue ?? venues[m.id],
    }));
    const groupByTeam = deriveGroups(matches);
    const teams = normalizeTeams(teamsJson, groupByTeam);

    const fixtures: Fixtures = {
      teams,
      matches,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fixtures, {
      headers: { "x-data-source": "football-data" },
    });
  } catch (err) {
    console.error("[matches] upstream failure, returning placeholder:", err);
    return NextResponse.json(placeholder as Fixtures, {
      headers: { "x-data-source": "placeholder-fallback" },
    });
  }
}

interface FdTeam {
  id: number;
  tla?: string;
  shortName?: string;
  name: string;
}
interface FdMatch {
  id: number;
  stage: string;
  group?: string | null;
  matchday?: number | null;
  utcDate: string;
  venue?: string;
  homeTeam: { tla?: string; name: string } | null;
  awayTeam: { tla?: string; name: string } | null;
  score?: {
    fullTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
}

function normalizeTeams(
  json: { teams?: FdTeam[] },
  groupByTeam: Map<string, GroupId>,
): Team[] {
  const teams = json.teams ?? [];
  const result: Team[] = [];
  for (const t of teams) {
    const code = t.tla ?? String(t.id);
    const group = groupByTeam.get(code);
    if (!group) {
      console.warn(
        `[matches] no derivable group for team ${code} (${t.name}); excluding from fixtures`,
      );
      continue;
    }
    result.push({
      code,
      name: t.shortName ?? t.name,
      flagCode: TLA_TO_ISO2[code] ?? code.slice(0, 2).toLowerCase(),
      group,
    });
  }
  return result;
}

function deriveGroups(matches: Match[]): Map<string, GroupId> {
  const m = new Map<string, GroupId>();
  for (const match of matches) {
    if (match.stage !== "group" || !match.groupId) continue;
    if (match.home) m.set(match.home, match.groupId);
    if (match.away) m.set(match.away, match.groupId);
  }
  return m;
}

function normalizeMatches(json: { matches?: FdMatch[] }): Match[] {
  const matches = json.matches ?? [];
  return matches.map((m) => ({
    id: String(m.id),
    stage: normalizeStage(m.stage),
    groupId: normalizeGroupId(m.group),
    matchday: m.matchday ?? undefined,
    utcKickoff: m.utcDate,
    venue: m.venue,
    home: m.homeTeam?.tla ?? null,
    away: m.awayTeam?.tla ?? null,
    score:
      m.score?.fullTime?.home != null && m.score.fullTime.away != null
        ? {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
            homePens: m.score.penalties?.home ?? undefined,
            awayPens: m.score.penalties?.away ?? undefined,
          }
        : undefined,
  }));
}

function normalizeStage(stage: string): Stage {
  switch (stage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
      return "r32";
    case "LAST_16":
      return "r16";
    case "QUARTER_FINALS":
      return "qf";
    case "SEMI_FINALS":
      return "sf";
    case "THIRD_PLACE":
      return "third";
    case "FINAL":
      return "final";
    default:
      return "group";
  }
}

function normalizeGroupId(g?: string | null): GroupId | undefined {
  if (!g) return undefined;
  const m = g.match(/GROUP_([A-L])/);
  return m ? (m[1] as GroupId) : undefined;
}

const TLA_TO_ISO2: Record<string, string> = {
  ALG: "dz", ARG: "ar", AUS: "au", AUT: "at",
  BEL: "be", BIH: "ba", BRA: "br",
  CAN: "ca", CIV: "ci", COD: "cd", COL: "co", CPV: "cv", CRO: "hr", CUW: "cw", CZE: "cz",
  ECU: "ec", EGY: "eg", ENG: "gb-eng", ESP: "es",
  FRA: "fr",
  GER: "de", GHA: "gh",
  HAI: "ht",
  IRN: "ir", IRQ: "iq",
  JOR: "jo", JPN: "jp",
  KOR: "kr", KSA: "sa",
  MAR: "ma", MEX: "mx",
  NED: "nl", NOR: "no", NZL: "nz",
  PAN: "pa", PAR: "py", POR: "pt",
  QAT: "qa",
  RSA: "za",
  SCO: "gb-sct", SEN: "sn", SUI: "ch", SWE: "se",
  TUN: "tn", TUR: "tr",
  URY: "uy", USA: "us", UZB: "uz",
};
