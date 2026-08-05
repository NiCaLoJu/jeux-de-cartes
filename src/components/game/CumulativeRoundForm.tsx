"use client";

import { useState } from "react";
import { Player } from "@/lib/engine";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";

export function CumulativeRoundForm({
  players,
  supportsTop,
  invertedScoring,
  onSubmit,
}: {
  players: Player[];
  supportsTop?: boolean;
  invertedScoring?: boolean;
  onSubmit: (points: Record<string, number>, top?: number) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [top, setTop] = useState("");

  function handleSubmit() {
    const points: Record<string, number> = {};
    for (const p of players) points[p.id] = Number(values[p.id] || 0);
    onSubmit(points, supportsTop && top ? Number(top) : undefined);
    setValues({});
    setTop("");
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide">
        {invertedScoring ? "Points de pénalité de la manche" : "Points de la manche"}
      </h3>

      {supportsTop && (
        <div>
          <label className="text-xs opacity-60 block mb-1">TOP (score idéal du tour)</label>
          <input
            type="number"
            inputMode="numeric"
            value={top}
            onChange={(e) => setTop(e.target.value)}
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
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
              className="w-24 rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-3 text-right outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <GlossyButton size="lg" onClick={handleSubmit} className="w-full">
        ✅ Valider le tour
      </GlossyButton>
    </GlassCard>
  );
}
