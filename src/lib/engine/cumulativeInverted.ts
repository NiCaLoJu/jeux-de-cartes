// MODULE B — Score cumulatif inversé (5 Rois)
// Same accumulation as Module A, but the LOWEST total wins (penalty points).

import { Player, RankedPlayer, rankPlayers } from "./types";
import { CumulativeRoundInput, applyCumulativeRound } from "./cumulative";

export const applyInvertedRound = applyCumulativeRound;

export function rankInverted(
  totals: Record<string, number>,
  players: Player[]
): RankedPlayer[] {
  return rankPlayers(totals, players, "asc");
}

export type InvertedRoundInput = CumulativeRoundInput;
