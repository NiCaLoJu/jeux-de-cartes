// MODULE A — Score cumulatif classique (Dixit, Scrabble, Divers)
// New total = previous total + points entered this round. Highest total wins.

import { Player, RankedPlayer, rankPlayers } from "./types";

export interface CumulativeRoundInput {
  /** Points scored this round, per player id. */
  points: Record<string, number>;
  /** Scrabble "TOP" duplicate mode: ideal score of the round, used for % réussite stats. */
  top?: number;
}

export interface CumulativeRoundRecord extends CumulativeRoundInput {
  roundNumber: number;
  totalsAfter: Record<string, number>;
}

export function applyCumulativeRound(
  previousTotals: Record<string, number>,
  round: CumulativeRoundInput
): Record<string, number> {
  const next: Record<string, number> = { ...previousTotals };
  for (const [playerId, points] of Object.entries(round.points)) {
    next[playerId] = (previousTotals[playerId] ?? 0) + points;
  }
  return next;
}

export function rankCumulative(
  totals: Record<string, number>,
  players: Player[]
): RankedPlayer[] {
  return rankPlayers(totals, players, "desc");
}

/** Scrabble TOP (duplicate): % réussite = (Score / Top) * 100, per player, per round. */
export function topSuccessRate(score: number, top: number): number {
  if (top <= 0) return 0;
  return Math.round((score / top) * 1000) / 10; // one decimal
}

/** Average % réussite across a player's rounds that had a TOP value recorded. */
export function averageTopSuccessRate(
  rounds: CumulativeRoundRecord[],
  playerId: string
): number | null {
  const withTop = rounds.filter((r) => typeof r.top === "number" && r.top > 0);
  if (withTop.length === 0) return null;
  const rates = withTop.map((r) => topSuccessRate(r.points[playerId] ?? 0, r.top as number));
  return Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10;
}
