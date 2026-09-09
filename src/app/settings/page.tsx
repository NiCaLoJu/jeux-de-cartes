"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ACCENT_PRESETS,
  ThemeMode,
  applyAccent,
  applyThemeMode,
  getStoredAccentId,
  getStoredThemeMode,
} from "@/lib/appearance";
import { GlassCard } from "@/components/ui/GlassCard";

const THEME_OPTIONS: { id: ThemeMode; label: string; emoji: string }[] = [
  { id: "system", label: "Système", emoji: "🌗" },
  { id: "light", label: "Clair", emoji: "☀️" },
  { id: "dark", label: "Sombre", emoji: "🌙" },
];

export default function SettingsPage() {
  const [accentId, setAccentId] = useState(getStoredAccentId);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  function pickAccent(id: string) {
    setAccentId(id);
    applyAccent(id);
  }

  function pickTheme(mode: ThemeMode) {
    setThemeMode(mode);
    applyThemeMode(mode);
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 pt-4 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-sm flex-shrink-0"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">⚙️ Réglages</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">Couleur d&apos;accent</h2>
        <GlassCard className="!py-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => pickAccent(preset.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                aria-label={preset.label}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom, ${preset.accentSoft}, ${preset.accentStrong})`,
                    boxShadow: accentId === preset.id ? `0 0 0 3px var(--background), 0 0 0 5px ${preset.accent}` : "none",
                  }}
                >
                  {accentId === preset.id && <span className="text-white text-xs">✓</span>}
                </span>
                <span className="text-[11px] opacity-70">{preset.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">Apparence</h2>
        <GlassCard className="!py-3">
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pickTheme(opt.id)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  themeMode === opt.id ? "bg-[var(--accent)] text-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                <span>{opt.emoji}</span> {opt.label}
              </button>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
