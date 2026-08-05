// MODULE C — Belote (base déductive), 2, 3 ou 4 joueurs.
// L'attaque annonce un contrat (implicite : atteindre 82/162). La défense
// récupère automatiquement le complément. "Dedans" et "Capot" court-circuitent
// le calcul normal.

export const BELOTE_BASE_POINTS = 162;
export const BELOTE_SUCCESS_THRESHOLD = 82;
export const BELOTE_CAPOT_POINTS = 252;
export const BELOTE_BONUS = 20;
/** Bonus "dix de der" + marge intégré au capot, appliqué quel que soit le contrat (162 -> 252). */
export const BELOTE_CAPOT_BONUS = BELOTE_CAPOT_POINTS - BELOTE_BASE_POINTS;

export type BeloteTeam = "A" | "B";
export type BeloteMode = "normal" | "dedans" | "capot";
/** "normal" = un atout choisi. "tout-atout" : toutes les couleurs valent atout (total 258).
 * "sans-atout" : aucune couleur ne vaut atout (total 130). */
export type BeloteContractType = "normal" | "tout-atout" | "sans-atout";
/** Couleur d'atout choisie, uniquement pertinent quand contractType === "normal". */
export type BeloteSuit = "trefle" | "carreau" | "coeur" | "pique";

export const BELOTE_SUITS: { id: BeloteSuit; label: string; symbol: string; color: "red" | "black" }[] = [
  { id: "trefle", label: "Trèfle", symbol: "♣", color: "black" },
  { id: "carreau", label: "Carreau", symbol: "♦", color: "red" },
  { id: "coeur", label: "Cœur", symbol: "♥", color: "red" },
  { id: "pique", label: "Pique", symbol: "♠", color: "black" },
];

export const BELOTE_TOTAL_POINTS: Record<BeloteContractType, number> = {
  normal: BELOTE_BASE_POINTS,
  "tout-atout": 258,
  "sans-atout": 130,
};

/** Annonces de suite standard (indépendantes de la belote/rebelote). */
export const BELOTE_SEQUENCE_ANNONCES = {
  tierce: 20,
  quarte: 50,
  quinte: 100,
} as const;

export interface BeloteAnnonce {
  team: BeloteTeam;
  value: number;
}

export interface BeloteRoundInput {
  attackingTeam: BeloteTeam;
  /** Score de l'attaque (points bruts). Ignoré si mode !== "normal". */
  attackScore: number;
  mode: BeloteMode;
  /** Défaut : "normal" (un atout). */
  contractType?: BeloteContractType;
  /** Couleur choisie quand contractType === "normal" (metadata, n'affecte pas le calcul). */
  trumpSuit?: BeloteSuit | null;
  annonces?: BeloteAnnonce[];
  /** Équipe qui bénéficie du bonus Belote/Rebelote (+20), le cas échéant. */
  beloteTeam?: BeloteTeam | null;
}

export interface BeloteRoundResult {
  attackingTeam: BeloteTeam;
  defendingTeam: BeloteTeam;
  mode: BeloteMode;
  contractType: BeloteContractType;
  trumpSuit: BeloteSuit | null;
  success: boolean;
  /** Points de plis avant annonces/belote. */
  cardPoints: { attack: number; defense: number };
  /** Total final par équipe (plis + annonces + belote). */
  teamPoints: { A: number; B: number };
}

function totalPointsFor(contractType: BeloteContractType): number {
  return BELOTE_TOTAL_POINTS[contractType];
}

function thresholdFor(contractType: BeloteContractType): number {
  return Math.floor(totalPointsFor(contractType) / 2) + 1;
}

/** true si le score saisi entraînerait une chute (utile pour proposer le bouton "Dedans" côté UI). */
export function isDedans(attackScore: number, contractType: BeloteContractType = "normal"): boolean {
  return attackScore < thresholdFor(contractType);
}

function otherTeam(team: BeloteTeam): BeloteTeam {
  return team === "A" ? "B" : "A";
}

export function computeBeloteRound(input: BeloteRoundInput): BeloteRoundResult {
  const contractType = input.contractType ?? "normal";
  const total = totalPointsFor(contractType);
  const defendingTeam = otherTeam(input.attackingTeam);

  let attackCardPoints: number;
  let defenseCardPoints: number;
  let success: boolean;

  if (input.mode === "capot") {
    attackCardPoints = total + BELOTE_CAPOT_BONUS;
    defenseCardPoints = 0;
    success = true;
  } else if (input.mode === "dedans") {
    attackCardPoints = 0;
    defenseCardPoints = total;
    success = false;
  } else {
    const attack = Math.max(0, Math.min(total, input.attackScore));
    attackCardPoints = attack;
    defenseCardPoints = total - attack;
    success = attack >= thresholdFor(contractType);
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
    success,
    cardPoints: { attack: attackCardPoints, defense: defenseCardPoints },
    teamPoints: { A: teamPoints.A, B: teamPoints.B },
  };
}

/**
 * Applique le résultat d'une donne aux totaux des joueurs.
 * - 4 joueurs : chaque joueur de l'équipe A/B reçoit le total de son équipe.
 * - 3 joueurs : le preneur reçoit ses points, les DEUX défenseurs reçoivent
 *   chacun l'intégralité des points de la défense (non divisés).
 * - 2 joueurs : l'attaquant et le défenseur reçoivent directement leur score.
 */
export function applyBeloteRound(
  previousTotals: Record<string, number>,
  attackTeamPlayerIds: string[],
  defenseTeamPlayerIds: string[],
  result: BeloteRoundResult
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
