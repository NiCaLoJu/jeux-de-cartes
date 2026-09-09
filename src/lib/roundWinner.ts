// Who "won" a single round — distinct from the game's overall running
// totals. Used to tally per-player round wins live during a game.

import { RoundRecord } from "@/store/gameSessionStore";

export function roundWinnerIds(round: RoundRecord, invertedScoring: boolean): string[] {
  if (round.module === "cumulative" || round.module === "cumulative-inverted") {
    const entries = Object.entries(round.points);
    if (entries.length === 0) return [];
    const best = invertedScoring
      ? Math.min(...entries.map(([, v]) => v))
      : Math.max(...entries.map(([, v]) => v));
    return entries.filter(([, v]) => v === best).map(([id]) => id);
  }

  if (round.module === "belote" || round.module === "coinche") {
    const { result } = round;
    const attackPoints = result.teamPoints[result.attackingTeam];
    const defensePoints = result.teamPoints[result.defendingTeam];
    if (attackPoints > defensePoints) return round.attackTeamPlayerIds;
    if (defensePoints > attackPoints) return round.defenseTeamPlayerIds;
    return [];
  }

  if (round.module === "tarot") {
    if (round.result.success) {
      return round.partnerId ? [round.preneurId, round.partnerId] : [round.preneurId];
    }
    return round.defenderIds.filter((id) => id !== round.partnerId);
  }

  return [];
}
