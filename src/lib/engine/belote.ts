// MODULE C — Belote (base déductive), 2, 3 ou 4 joueurs.
// L'attaque annonce un contrat (implicite : atteindre 82/162). La défense
// récupère automatiquement le complément. "Dedans" et "Capot" court-circuitent
// le calcul normal.

export const BELOTE_BASE_POINTS = 162;
export const BELOTE_SUCCESS_THRESHOLD = 82;
export const BELOTE_CAPOT_POINTS = 252;
export const BELOTE_BONUS = 20;

export type BeloteTeam = "A" | "B";
export type BeloteMode = "normal" | "dedans" | "capot";

export interface BeloteAnnonce {
  team: BeloteTeam;
  value: number;
}

export interface BeloteRoundInput {
  attackingTeam: BeloteTeam;
  /** Score de l'attaque (points bruts, 0-162). Ignoré si mode !== "normal". */
  attackScore: number;
  mode: BeloteMode;
  annonces?: BeloteAnnonce[];
  /** Équipe qui bénéficie du bonus Belote/Rebelote (+20), le cas échéant. */
  beloteTeam?: BeloteTeam | null;
}

export interface BeloteRoundResult {
  attackingTeam: BeloteTeam;
  defendingTeam: BeloteTeam;
  mode: BeloteMode;
  success: boolean;
  /** Points de plis avant annonces/belote. */
  cardPoints: { attack: number; defense: number };
  /** Total final par équipe (plis + annonces + belote). */
  teamPoints: { A: number; B: number };
}

/** true si le score saisi entraînerait une chute (utile pour proposer le bouton "Dedans" côté UI). */
export function isDedans(attackScore: number): boolean {
  return attackScore < BELOTE_SUCCESS_THRESHOLD;
}

function otherTeam(team: BeloteTeam): BeloteTeam {
  return team === "A" ? "B" : "A";
}

export function computeBeloteRound(input: BeloteRoundInput): BeloteRoundResult {
  const defendingTeam = otherTeam(input.attackingTeam);

  let attackCardPoints: number;
  let defenseCardPoints: number;
  let success: boolean;

  if (input.mode === "capot") {
    attackCardPoints = BELOTE_CAPOT_POINTS;
    defenseCardPoints = 0;
    success = true;
  } else if (input.mode === "dedans") {
    attackCardPoints = 0;
    defenseCardPoints = BELOTE_BASE_POINTS;
    success = false;
  } else {
    const attack = Math.max(0, Math.min(BELOTE_BASE_POINTS, input.attackScore));
    attackCardPoints = attack;
    defenseCardPoints = BELOTE_BASE_POINTS - attack;
    success = attack >= BELOTE_SUCCESS_THRESHOLD;
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
