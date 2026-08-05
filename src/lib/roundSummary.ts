// Formats a RoundRecord into a short, human-readable summary for the live
// round history feed. Pure/presentational only — no scoring logic here.

import { Player } from "@/lib/engine";
import { BELOTE_SUITS } from "@/lib/engine/belote";
import { roundWinnerIds } from "@/lib/roundWinner";
import { RoundRecord } from "@/store/gameSessionStore";

const TAROT_CONTRACT_LABELS: Record<string, string> = {
  petite: "Petite",
  garde: "Garde",
  "garde-sans": "Garde Sans",
  "garde-contre": "Garde Contre",
};

function nameOf(players: Player[], id: string | undefined | null): string {
  return players.find((p) => p.id === id)?.name ?? "—";
}

function namesOf(players: Player[], ids: string[]): string {
  return ids.map((id) => nameOf(players, id)).join(" & ");
}

export interface RoundSummary {
  title: string;
  subtitle: string;
  badge: string;
  positive: boolean;
}

export function summarizeRound(
  round: RoundRecord,
  players: Player[],
  invertedScoring = false
): RoundSummary {
  const dealer = round.dealerId ? nameOf(players, round.dealerId) : null;
  const dealerSuffix = dealer ? ` · 🃏 ${dealer}` : "";

  if (round.module === "belote") {
    const { result } = round;
    const attackNames = namesOf(players, round.attackTeamPlayerIds);
    const defenseNames = namesOf(players, round.defenseTeamPlayerIds);
    const suit = result.trumpSuit ? BELOTE_SUITS.find((s) => s.id === result.trumpSuit) : null;
    const trumpLabel =
      result.contractType === "tout-atout"
        ? "Tout Atout (x4)"
        : result.contractType === "sans-atout"
          ? "Sans Atout (x2)"
          : (suit ? `${suit.symbol} ${suit.label}` : "Atout");
    const modeLabel = result.mode === "capot" ? " · Capot" : result.mode === "dedans" ? " · Dedans" : "";
    return {
      title: `${attackNames} vs ${defenseNames}`,
      subtitle: `${trumpLabel}${modeLabel}${dealerSuffix}`,
      badge: `${result.teamPoints[result.attackingTeam]} - ${result.teamPoints[result.defendingTeam]}`,
      positive: result.success,
    };
  }

  if (round.module === "tarot") {
    const { result } = round;
    const preneur = nameOf(players, round.preneurId);
    const partner = round.partnerId ? ` + ${nameOf(players, round.partnerId)}` : "";
    const contractLabel = TAROT_CONTRACT_LABELS[round.input.contract] ?? round.input.contract;
    return {
      title: `${preneur}${partner} preneur`,
      subtitle: `${contractLabel} · ${round.input.bouts} bout${round.input.bouts > 1 ? "s" : ""}${dealerSuffix}`,
      badge: `${result.finalValue > 0 ? "+" : ""}${result.finalValue}`,
      positive: result.success,
    };
  }

  // cumulative / cumulative-inverted
  const entries = Object.entries(round.points);
  const winners = roundWinnerIds(round, invertedScoring);
  return {
    title: entries.map(([id, value]) => `${nameOf(players, id)} ${value > 0 ? "+" : ""}${value}`).join(" · "),
    subtitle: `Manche${dealerSuffix}`,
    badge: winners.length > 0 ? `🏅 ${namesOf(players, winners)}` : "",
    positive: true,
  };
}
