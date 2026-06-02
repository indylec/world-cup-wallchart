export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export const GROUP_IDS: GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export type Stage =
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "third"
  | "final";

export interface Team {
  code: string;
  name: string;
  flagCode: string;
  group: GroupId;
}

export interface Score {
  home: number;
  away: number;
  homePens?: number;
  awayPens?: number;
}

export interface Match {
  id: string;
  stage: Stage;
  groupId?: GroupId;
  matchday?: number;
  utcKickoff: string;
  venue?: string;
  home: string | null;
  away: string | null;
  homeSlot?: string;
  awaySlot?: string;
  score?: Score;
}

export interface ManualResult {
  matchId: string;
  score: Score;
  enteredAt: string;
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Fixtures {
  teams: Team[];
  matches: Match[];
  lastUpdated: string;
}
