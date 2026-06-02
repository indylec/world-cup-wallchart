import type { ManualResult, Match, Score } from "./types";

export function getScore(
  match: Match,
  manual: Record<string, ManualResult>,
): Score | undefined {
  return manual[match.id]?.score ?? match.score;
}

export function isFinalScore(score: Score | undefined): score is Score {
  return !!score && Number.isFinite(score.home) && Number.isFinite(score.away);
}

export function knockoutWinner(score: Score | undefined): "home" | "away" | null {
  if (!isFinalScore(score)) return null;
  if (score.home > score.away) return "home";
  if (score.away > score.home) return "away";
  const hp = score.homePens ?? 0;
  const ap = score.awayPens ?? 0;
  if (hp === ap) return null;
  return hp > ap ? "home" : "away";
}
