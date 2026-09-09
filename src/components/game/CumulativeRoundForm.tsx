"use client";

import { useState } from "react";
import { Player } from "@/lib/engine";
import { FIVE_ROIS_GAME_ID, jokerForRound } from "@/lib/fiveRoisJoker";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";

export function CumulativeRoundForm({
  players,
  supportsTop,
  invertedScoring,
  onSubmit,
  initialPoints,
  initialTop,
  submitLabel = "✅ Valider le tour",
  onCancel,
  gameId,
  roundNumber,
}: {
  players: Player[];
  supportsTop?: boolean;
  invertedScoring?: boolean;
  onSubmit: (points: Record<string, number>, top?: number) => void;
  initialPoints?: Record<string, number>;
  initialTop?: number;
  submitLabel?: string;
  onCancel?: () => void;
  gameId?: string;
  roundNumber?: number;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    initialPoints
      ? Object.fromEntries(Object.entries(initialPoints).map(([id, v]) => [id, String(v)]))
      : {}
  );
  const [top, setTop] = useState(initialTop !== undefined ? String(initialTop) : "");

  const allFilled = players.every((p) => (values[p.id] ?? "").trim() !== "");
  const joker = gameId === FIVE_ROIS_GAME_ID && roundNumber ? jokerForRound(roundNumber) : null;

  function handleSubmit() {
    if (!allFilled) return;
    const points: Record<string, number> = {};
    for (const p of players) points[p.id] = Number(values[p.id] || 0);
    onSubmit(points, supportsTop && top ? Number(top) : undefined);
    if (!onCancel) {
      setValues({});
      setTop("");
    }
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide">
        {invertedScoring ? "Points de pénalité de la manche" : "Points de la manche"}
      </h3>

      {joker && (
        <div className="rounded-2xl bg-gradient-to-r from-[var(--accent-soft)]/20 to-fuchsia-400/20 px-4 py-2.5 text-sm flex items-center justify-center gap-2 font-medium">
          🃏 Joker de la manche {roundNumber} :
          <span className="text-lg font-bold">{joker}</span>
        </div>
      )}

      {supportsTop && (
        <div>
          <label className="text-xs opacity-60 block mb-1">TOP (score idéal du tour)</label>
          <input
            type="number"
            inputMode="numeric"
            value={top}
            onChange={(e) => setTop(e.target.value)}
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="ex : 68"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3">
            <span className="flex-1 font-medium truncate">{player.name}</span>
            <input
              type="number"
              inputMode="numeric"
              value={values[player.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [player.id]: e.target.value }))}
              className="w-24 rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-3 text-right outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {!allFilled && (
        <p className="text-xs text-rose-500 -mt-2">Renseigne un score pour chaque joueur.</p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <GlossyButton size="lg" variant="ghost" onClick={onCancel} className="flex-1">
            Annuler
          </GlossyButton>
        )}
        <GlossyButton size="lg" onClick={handleSubmit} disabled={!allFilled} className="flex-1">
          {submitLabel}
        </GlossyButton>
      </div>
    </GlassCard>
  );
}
