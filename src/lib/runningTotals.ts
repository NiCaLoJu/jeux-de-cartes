// Per-round running totals — a snapshot of each player's cumulative score
// after every round. Used to draw the score-evolution chart. Works for any
// module since it replays the same per-round apply functions the session
// store uses to compute its final totals.

import { Player, applyBeloteRound, applyCumulativeRound, applyTarotRound } from "@/lib/engine";
import { RoundRecord } from "@/store/gameSessionStore";

export interface RoundSnapshot {
  roundNumber: number;
  totals: Record<string, number>;
}

export function computeRunningTotals(players: Player[], rounds: RoundRecord[]): RoundSnapshot[] {
  let totals: Record<string, number> = {};
  for (const p of players) totals[p.id] = 0;

  const snapshots: RoundSnapshot[] = [];
  for (const round of rounds) {
    if (round.module === "cumulative" || round.module === "cumulative-inverted") {
      totals = applyCumulativeRound(totals, { points: round.points, top: round.top });
    } else if (round.module === "belote") {
      totals = applyBeloteRound(totals, round.attackTeamPlayerIds, round.defenseTeamPlayerIds, round.result);
    } else if (round.module === "tarot") {
      totals = applyTarotRound(totals, round.preneurId, round.defenderIds, round.result, round.partnerId);
    }
    snapshots.push({ roundNumber: round.roundNumber, totals: { ...totals } });
  }
  return snapshots;
}
