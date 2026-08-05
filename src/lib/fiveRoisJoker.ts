// 5 Rois: each round designates a "joker" (wild) card that escalates
// round after round — round 1 -> 3, round 2 -> 4, round 3 -> 5, ...
// up through the Ace, then wraps if the game somehow runs longer.

export const FIVE_ROIS_GAME_ID = "cinq-rois";

const RANKS = ["3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R", "A"];

export function jokerForRound(roundNumber: number): string {
  return RANKS[(roundNumber - 1) % RANKS.length];
}
