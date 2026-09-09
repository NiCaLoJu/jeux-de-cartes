// MODULE E — Belote Coinchée / Contrée : enchères chiffrées (80 à 180, ou
// Capot) au lieu d'un contrat implicite fixe. L'attaque doit atteindre son
// annonce ; en cas de réussite elle marque la valeur annoncée (pas ses
// points bruts), en cas de chute la défense marque 162 + l'annonce. Les
// annonces de suite et la belote/rebelote reprennent les conventions du
// module Belote (module C) et ne sont pas multipliées par le contrat.

import { BeloteAnnonce, BeloteSuit, BeloteTeam, BELOTE_BONUS } from "./belote";

export const COINCHE_BASE_POINTS = 162;
export const COINCHE_CAPOT_POINTS = 252; // 162 + bonus capot (90), même convention que le module Belote.

export type CoincheContractType = "normal" | "sans-atout" | "tout-atout";
export const COINCHE_CONTRACT_MULTIPLIER: Record<CoincheContractType, number> = {
  normal: 1,
  "sans-atout": 2,
  "tout-atout": 4,
};

/** "simple" = pas de coinche (utilisé aussi par la variante "Contrée", qui n'a pas de coinche). */
export type CoincheLevel = "simple" | "coinche" | "surcoinche";
export const COINCHE_LEVEL_MULTIPLIER: Record<CoincheLevel, number> = {
  simple: 1,
  coinche: 2,
  surcoinche: 4,
};

export const COINCHE_BID_VALUES = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180] as const;

export type CoincheMode = "normal" | "dedans" | "capot";

export interface CoincheRoundInput {
  attackingTeam: BeloteTeam;
  /** Valeur annoncée (80 à 180). Ignorée si mode === "capot". */
  bidValue: number;
  mode: CoincheMode;
  /** Points de plis réels de l'attaque (0-162). Ignoré si mode !== "normal". */
  attackScore: number;
  /** Défaut : "normal" (un atout choisi). */
  contractType?: CoincheContractType;
  trumpSuit?: BeloteSuit | null;
  /** Défaut : "simple". Reste toujours "simple" pour la variante "Contrée". */
  coincheLevel?: CoincheLevel;
  annonces?: BeloteAnnonce[];
  beloteTeam?: BeloteTeam | null;
}

export interface CoincheRoundResult {
  attackingTeam: BeloteTeam;
  defendingTeam: BeloteTeam;
  mode: CoincheMode;
  contractType: CoincheContractType;
  trumpSuit: BeloteSuit | null;
  coincheLevel: CoincheLevel;
  bidValue: number;
  success: boolean;
  /** Points de plis avant annonces/belote. */
  cardPoints: { attack: number; defense: number };
  /** Total final par équipe (plis + annonces + belote). */
  teamPoints: { A: number; B: number };
}

function otherTeam(team: BeloteTeam): BeloteTeam {
  return team === "A" ? "B" : "A";
}

/** true si le score saisi entraînerait une chute (utile pour proposer le bouton "Dedans" côté UI). */
export function isCoincheDedans(attackScore: number, bidValue: number): boolean {
  return attackScore < bidValue;
}

export function computeCoincheRound(input: CoincheRoundInput): CoincheRoundResult {
  const contractType = input.contractType ?? "normal";
  const coincheLevel = input.coincheLevel ?? "simple";
  const multiplier = COINCHE_CONTRACT_MULTIPLIER[contractType] * COINCHE_LEVEL_MULTIPLIER[coincheLevel];
  const defendingTeam = otherTeam(input.attackingTeam);
  const bidValue = Math.max(0, input.bidValue);

  let attackCardPoints: number;
  let defenseCardPoints: number;
  let success: boolean;

  if (input.mode === "capot") {
    attackCardPoints = COINCHE_CAPOT_POINTS * multiplier;
    defenseCardPoints = 0;
    success = true;
  } else if (input.mode === "dedans" || input.attackScore < bidValue) {
    attackCardPoints = 0;
    defenseCardPoints = (COINCHE_BASE_POINTS + bidValue) * multiplier;
    success = false;
  } else {
    const attack = Math.max(0, Math.min(COINCHE_BASE_POINTS, input.attackScore));
    attackCardPoints = bidValue * multiplier;
    defenseCardPoints = (COINCHE_BASE_POINTS - attack) * multiplier;
    success = true;
  }

  const teamPoints: Record<BeloteTeam, number> = {
    [input.attackingTeam]: attackCardPoints,
    [defendingTeam]: defenseCardPoints,
  } as Record<BeloteTeam, number>;

  for (const annonce of input.annonces ?? []) {
    teamPoints[annonce.team] += annonce.value;
  }
  if (input.beloteTeam) {
    teamPoints[input.beloteTeam] += BELOTE_BONUS;
  }

  return {
    attackingTeam: input.attackingTeam,
    defendingTeam,
    mode: input.mode,
    contractType,
    trumpSuit: contractType === "normal" ? input.trumpSuit ?? null : null,
    coincheLevel,
    bidValue,
    success,
    cardPoints: { attack: attackCardPoints, defense: defenseCardPoints },
    teamPoints: { A: teamPoints.A, B: teamPoints.B },
  };
}

/** Identique à applyBeloteRound (2/3/4 joueurs) — dupliqué pour garder le module autonome. */
export function applyCoincheRound(
  previousTotals: Record<string, number>,
  attackTeamPlayerIds: string[],
  defenseTeamPlayerIds: string[],
  result: CoincheRoundResult
): Record<string, number> {
  const next: Record<string, number> = { ...previousTotals };
  const attackPoints = result.teamPoints[result.attackingTeam];
  const defensePoints = result.teamPoints[result.defendingTeam];

  for (const id of attackTeamPlayerIds) {
    next[id] = (previousTotals[id] ?? 0) + attackPoints;
  }
  for (const id of defenseTeamPlayerIds) {
    next[id] = (previousTotals[id] ?? 0) + defensePoints;
  }
  return next;
}
