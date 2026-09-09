"use client";

import { Player } from "@/lib/engine";
import { BELOTE_SUITS } from "@/lib/engine/belote";
import { FIVE_ROIS_GAME_ID, jokerForRound } from "@/lib/fiveRoisJoker";
import { RoundRecord } from "@/store/gameSessionStore";

const TAROT_CONTRACT_LABELS: Record<string, string> = {
  petite: "Petite (x1)",
  garde: "Garde (x2)",
  "garde-sans": "Garde Sans (x4)",
  "garde-contre": "Garde Contre (x6)",
};

function nameOf(players: Player[], id: string | undefined | null): string {
  return players.find((p) => p.id === id)?.name ?? "—";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="opacity-60">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function RoundDetail({
  round,
  players,
  gameId,
}: {
  round: RoundRecord;
  players: Player[];
  gameId?: string;
}) {
  const dealer = round.dealerId ? nameOf(players, round.dealerId) : null;

  if (round.module === "belote") {
    const { input, result } = round;
    const suit = result.trumpSuit ? BELOTE_SUITS.find((s) => s.id === result.trumpSuit) : null;
    const trumpLabel =
      result.contractType === "tout-atout"
        ? "Tout Atout (x4)"
        : result.contractType === "sans-atout"
          ? "Sans Atout (x2)"
          : suit
            ? `${suit.symbol} ${suit.label}`
            : "Atout";
    const modeLabel = result.mode === "capot" ? "Capot" : result.mode === "dedans" ? "Dedans" : "Normal";
    const attackNames = round.attackTeamPlayerIds.map((id) => nameOf(players, id)).join(" & ");
    const defenseNames = round.defenseTeamPlayerIds.map((id) => nameOf(players, id)).join(" & ");
    const beloteWinner =
      input.beloteTeam === "A" ? attackNames : input.beloteTeam === "B" ? defenseNames : null;
    const attackAnnonces = (input.annonces ?? []).filter((a) => a.team === "A").reduce((s, a) => s + a.value, 0);
    const defenseAnnonces = (input.annonces ?? []).filter((a) => a.team === "B").reduce((s, a) => s + a.value, 0);

    return (
      <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {dealer && <Row label="Distribué par" value={dealer} />}
        <Row label="Attaque" value={attackNames} />
        <Row label="Défense" value={defenseNames} />
        <Row label="Contrat" value={trumpLabel} />
        <Row label="Résultat" value={modeLabel} />
        {result.mode === "normal" && (
          <Row label="Points de plis (avant multiplicateur)" value={`${input.attackScore} / 162`} />
        )}
        <Row label="Points de plis (attaque / défense)" value={`${result.cardPoints.attack} / ${result.cardPoints.defense}`} />
        {attackAnnonces > 0 && <Row label="Annonces attaque" value={`+${attackAnnonces}`} />}
        {defenseAnnonces > 0 && <Row label="Annonces défense" value={`+${defenseAnnonces}`} />}
        {beloteWinner && <Row label="Belote / Rebelote" value={`${beloteWinner} (+20)`} />}
        <Row
          label="Total de la donne"
          value={`${attackNames} ${result.teamPoints[result.attackingTeam]} - ${result.teamPoints[result.defendingTeam]} ${defenseNames}`}
        />
      </div>
    );
  }

  if (round.module === "coinche") {
    const { input, result } = round;
    const suit = result.trumpSuit ? BELOTE_SUITS.find((s) => s.id === result.trumpSuit) : null;
    const trumpLabel =
      result.contractType === "tout-atout"
        ? "Tout Atout (x4)"
        : result.contractType === "sans-atout"
          ? "Sans Atout (x2)"
          : suit
            ? `${suit.symbol} ${suit.label}`
            : "Atout";
    const levelLabel =
      result.coincheLevel === "surcoinche" ? "Surcoinché (x4)" : result.coincheLevel === "coinche" ? "Coinché (x2)" : null;
    const modeLabel = result.mode === "capot" ? "Capot" : result.mode === "dedans" ? "Dedans" : "Normal";
    const attackNames = round.attackTeamPlayerIds.map((id) => nameOf(players, id)).join(" & ");
    const defenseNames = round.defenseTeamPlayerIds.map((id) => nameOf(players, id)).join(" & ");
    const beloteWinner =
      input.beloteTeam === "A" ? attackNames : input.beloteTeam === "B" ? defenseNames : null;
    const attackAnnonces = (input.annonces ?? []).filter((a) => a.team === "A").reduce((s, a) => s + a.value, 0);
    const defenseAnnonces = (input.annonces ?? []).filter((a) => a.team === "B").reduce((s, a) => s + a.value, 0);

    return (
      <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {dealer && <Row label="Distribué par" value={dealer} />}
        <Row label="Attaque" value={attackNames} />
        <Row label="Défense" value={defenseNames} />
        <Row label="Annonce" value={result.mode === "capot" ? "Capot" : result.bidValue} />
        <Row label="Contrat" value={trumpLabel} />
        {levelLabel && <Row label="Coinche" value={levelLabel} />}
        <Row label="Résultat" value={modeLabel} />
        {result.mode === "normal" && (
          <Row label="Points de plis (avant multiplicateur)" value={`${input.attackScore} / 162`} />
        )}
        <Row label="Points de plis (attaque / défense)" value={`${result.cardPoints.attack} / ${result.cardPoints.defense}`} />
        {attackAnnonces > 0 && <Row label="Annonces attaque" value={`+${attackAnnonces}`} />}
        {defenseAnnonces > 0 && <Row label="Annonces défense" value={`+${defenseAnnonces}`} />}
        {beloteWinner && <Row label="Belote / Rebelote" value={`${beloteWinner} (+20)`} />}
        <Row
          label="Total de la donne"
          value={`${attackNames} ${result.teamPoints[result.attackingTeam]} - ${result.teamPoints[result.defendingTeam]} ${defenseNames}`}
        />
      </div>
    );
  }

  if (round.module === "tarot") {
    const { input, result } = round;
    const preneur = nameOf(players, round.preneurId);
    const partner = round.partnerId ? nameOf(players, round.partnerId) : null;
    const defenders = round.defenderIds.filter((id) => id !== round.partnerId).map((id) => nameOf(players, id));

    return (
      <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {dealer && <Row label="Distribué par" value={dealer} />}
        <Row label="Preneur" value={preneur} />
        {partner && <Row label="Appelé (partenaire)" value={partner} />}
        <Row label="Défenseurs" value={defenders.join(", ")} />
        <Row label="Contrat" value={TAROT_CONTRACT_LABELS[input.contract] ?? input.contract} />
        <Row label="Points réalisés" value={input.pointsPreneur} />
        <Row label="Bouts" value={input.bouts} />
        <Row label="Seuil requis" value={result.threshold} />
        <Row label="Différence" value={result.difference > 0 ? `+${result.difference}` : result.difference} />
        {input.petitAuBout && <Row label="Petit au bout" value="+10" />}
        {input.poignee && <Row label="Poignée" value={input.poignee} />}
        <Row label="Résultat" value={result.success ? "Contrat réussi ✅" : "Contrat chuté ❌"} />
        <Row
          label="Valeur finale"
          value={partner ? `${preneur} x2, ${partner} x1, défenseurs x1` : `${preneur} vs ${defenders.length} défenseurs`}
        />
        <Row label="Points échangés" value={`${result.finalValue > 0 ? "+" : ""}${result.finalValue}`} />
      </div>
    );
  }

  // cumulative / cumulative-inverted
  const joker = gameId === FIVE_ROIS_GAME_ID ? jokerForRound(round.roundNumber) : null;
  return (
    <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
      {dealer && <Row label="Distribué par" value={dealer} />}
      {joker && <Row label="Joker de la manche" value={`🃏 ${joker}`} />}
      {round.top !== undefined && <Row label="TOP" value={round.top} />}
      {players
        .filter((p) => round.points[p.id] !== undefined)
        .map((p) => (
          <Row key={p.id} label={p.name} value={`${round.points[p.id] > 0 ? "+" : ""}${round.points[p.id]}`} />
        ))}
    </div>
  );
}
