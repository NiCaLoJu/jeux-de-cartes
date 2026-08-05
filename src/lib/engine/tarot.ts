// MODULE D — Tarot (contrats et bouts).

export type TarotContract = "petite" | "garde" | "garde-sans" | "garde-contre";
export type TarotPoignee = "simple" | "double" | "triple" | null;
export type TarotBouts = 0 | 1 | 2 | 3;

export const TAROT_THRESHOLDS: Record<TarotBouts, number> = {
  3: 36,
  2: 41,
  1: 51,
  0: 56,
};

export const TAROT_MULTIPLIERS: Record<TarotContract, number> = {
  petite: 1,
  garde: 2,
  "garde-sans": 4,
  "garde-contre": 6,
};

export const TAROT_POIGNEE_BONUS: Record<Exclude<TarotPoignee, null>, number> = {
  simple: 20,
  double: 30,
  triple: 40,
};

export const TAROT_PETIT_AU_BOUT_BONUS = 10;

export interface TarotRoundInput {
  /** Points bruts (cartes) réalisés par le camp du preneur. */
  pointsPreneur: number;
  bouts: TarotBouts;
  contract: TarotContract;
  petitAuBout: boolean;
  poignee: TarotPoignee;
}

export interface TarotRoundResult {
  threshold: number;
  difference: number;
  success: boolean;
  base: number;
  contractValue: number;
  /** Valeur finale signée (positive = succès du preneur). */
  finalValue: number;
}

export function computeTarotRound(input: TarotRoundInput): TarotRoundResult {
  const threshold = TAROT_THRESHOLDS[input.bouts];
  const difference = input.pointsPreneur - threshold;
  const success = difference >= 0;
  const base = 25 + Math.abs(difference);
  const baseWithPetit = base + (input.petitAuBout ? TAROT_PETIT_AU_BOUT_BONUS : 0);
  const contractValue = baseWithPetit * TAROT_MULTIPLIERS[input.contract];
  const poigneeBonus = input.poignee ? TAROT_POIGNEE_BONUS[input.poignee] : 0;
  const magnitude = contractValue + poigneeBonus;

  return {
    threshold,
    difference,
    success,
    base,
    contractValue,
    finalValue: success ? magnitude : -magnitude,
  };
}

/**
 * Répartit le résultat d'une donne entre le preneur et ses défenseurs.
 * Chaque défenseur gagne/perd `finalValue` (signe inversé par rapport au preneur).
 * Le preneur gagne/perd `finalValue * nombre de défenseurs`.
 * Généralise la règle "4 joueurs" (x3) à un nombre quelconque de défenseurs.
 */
export function applyTarotRound(
  previousTotals: Record<string, number>,
  preneurId: string,
  defenderIds: string[],
  result: TarotRoundResult
): Record<string, number> {
  const next: Record<string, number> = { ...previousTotals };
  const defenderDelta = -result.finalValue;
  const preneurDelta = result.finalValue * defenderIds.length;

  next[preneurId] = (previousTotals[preneurId] ?? 0) + preneurDelta;
  for (const id of defenderIds) {
    next[id] = (previousTotals[id] ?? 0) + defenderDelta;
  }
  return next;
}
