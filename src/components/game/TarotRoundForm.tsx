"use client";

import { useState } from "react";
import { Player } from "@/lib/engine";
import {
  TarotBouts,
  TarotContract,
  TarotPoignee,
  TarotRoundInput,
  computeTarotRound,
} from "@/lib/engine/tarot";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";

const CONTRACTS: { id: TarotContract; label: string }[] = [
  { id: "petite", label: "Petite (x1)" },
  { id: "garde", label: "Garde (x2)" },
  { id: "garde-sans", label: "Garde Sans (x4)" },
  { id: "garde-contre", label: "Garde Contre (x6)" },
];

const POIGNEES: { id: TarotPoignee; label: string }[] = [
  { id: null, label: "—" },
  { id: "simple", label: "Simple (+20)" },
  { id: "double", label: "Double (+30)" },
  { id: "triple", label: "Triple (+40)" },
];

export function TarotRoundForm({
  players,
  onSubmit,
}: {
  players: Player[];
  onSubmit: (
    input: TarotRoundInput,
    preneurId: string,
    defenderIds: string[],
    partnerId?: string | null
  ) => void;
}) {
  const [preneurId, setPreneurId] = useState(players[0]?.id ?? "");
  const [points, setPoints] = useState("50");
  const [bouts, setBouts] = useState<TarotBouts>(1);
  const [contract, setContract] = useState<TarotContract>("petite");
  const [petitAuBout, setPetitAuBout] = useState(false);
  const [poignee, setPoignee] = useState<TarotPoignee>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const isFivePlayers = players.length === 5;
  const otherPlayers = players.filter((p) => p.id !== preneurId);

  const input: TarotRoundInput = {
    pointsPreneur: Number(points || 0),
    bouts,
    contract,
    petitAuBout,
    poignee,
  };

  const preview = computeTarotRound(input);

  const defenderIds = otherPlayers.map((p) => p.id);
  const effectivePartnerId = isFivePlayers ? partnerId : null;

  function handleSubmit() {
    onSubmit(input, preneurId, defenderIds, effectivePartnerId);
    setPoints("50");
    setPetitAuBout(false);
    setPoignee(null);
    setPartnerId(null);
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide">Nouveau contrat</h3>

      <div>
        <label className="text-xs opacity-60 block mb-1">Preneur</label>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPreneurId(p.id);
                setPartnerId(null);
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                preneurId === p.id ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {isFivePlayers && (
        <div>
          <label className="text-xs opacity-60 block mb-1">Roi appelé (partenaire)</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPartnerId(null)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                partnerId === null ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              Garde seul (son roi)
            </button>
            {otherPlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPartnerId(p.id)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                  partnerId === p.id ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-xs opacity-50 mt-1">
            {partnerId
              ? "2 contre 3 : le preneur touche double, l'appelé touche simple."
              : "1 contre 4 : le preneur a son propre roi, il joue seul."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs opacity-60 block mb-1">Points bruts du preneur</label>
          <input
            type="number"
            inputMode="numeric"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <label className="text-xs opacity-60 block mb-1">Nombre de bouts</label>
          <div className="grid grid-cols-4 gap-1">
            {([0, 1, 2, 3] as TarotBouts[]).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBouts(b)}
                className={`rounded-xl py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                  bouts === b ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs opacity-60 block mb-1">Contrat</label>
        <div className="grid grid-cols-2 gap-2">
          {CONTRACTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setContract(c.id)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                contract === c.id ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={petitAuBout}
            onChange={(e) => setPetitAuBout(e.target.checked)}
            className="w-5 h-5 accent-violet-500"
          />
          Petit au bout (+10)
        </label>
        <div>
          <label className="text-xs opacity-60 block mb-1">Poignée</label>
          <select
            value={poignee ?? ""}
            onChange={(e) => setPoignee((e.target.value || null) as TarotPoignee)}
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-3 outline-none focus:ring-2 focus:ring-violet-400"
          >
            {POIGNEES.map((p) => (
              <option key={p.label} value={p.id ?? ""}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-black/5 dark:bg-white/5 px-4 py-3 text-sm flex items-center justify-between">
        <span className="opacity-70">
          Seuil {preview.threshold} · {preview.success ? "Contrat réussi ✅" : "Contrat chuté ❌"}
        </span>
        <span className="font-bold text-lg tabular-nums">
          {preview.finalValue > 0 ? "+" : ""}
          {preview.finalValue}
        </span>
      </div>

      <GlossyButton size="lg" onClick={handleSubmit} className="w-full">
        ✅ Valider le contrat
      </GlossyButton>
    </GlassCard>
  );
}
