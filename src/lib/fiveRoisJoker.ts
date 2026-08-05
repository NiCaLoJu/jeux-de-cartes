// 5 Rois: each round designates a "joker" (wild) card that escalates
// round after round — round 1 -> 3, round 2 -> 4, round 3 -> 5, ...
// up through the King (the game's last round), then wraps if it somehow
// runs longer than that.

export const FIVE_ROIS_GAME_ID = "cinq-rois";

const RANKS = ["3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R"];

export function jokerForRound(roundNumber: number): string {
  return RANKS[(roundNumber - 1) % RANKS.length];
}
