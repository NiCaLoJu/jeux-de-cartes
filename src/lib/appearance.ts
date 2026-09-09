// Per-device appearance settings (accent color, light/dark/system) — stored
// in localStorage since they're a device preference, not account data.

export interface AccentPreset {
  id: string;
  label: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "violet", label: "Violet", accent: "#8b5cf6", accentSoft: "#a78bfa", accentStrong: "#7c3aed" },
  { id: "blue", label: "Bleu", accent: "#3b82f6", accentSoft: "#60a5fa", accentStrong: "#2563eb" },
  { id: "emerald", label: "Émeraude", accent: "#10b981", accentSoft: "#34d399", accentStrong: "#059669" },
  { id: "orange", label: "Orange", accent: "#f97316", accentSoft: "#fb923c", accentStrong: "#ea580c" },
  { id: "rose", label: "Rose", accent: "#f43f5e", accentSoft: "#fb7185", accentStrong: "#e11d48" },
  { id: "graphite", label: "Graphite", accent: "#4b5563", accentSoft: "#9ca3af", accentStrong: "#1f2937" },
];

export type ThemeMode = "system" | "light" | "dark";

const ACCENT_KEY = "sbp_accent";
const THEME_KEY = "sbp_theme";

export function getStoredAccentId(): string {
  if (typeof window === "undefined") return "violet";
  return window.localStorage.getItem(ACCENT_KEY) ?? "violet";
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" ? v : "system";
}

export function applyAccent(id: string) {
  const preset = ACCENT_PRESETS.find((p) => p.id === id) ?? ACCENT_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty("--accent", preset.accent);
  root.style.setProperty("--accent-soft", preset.accentSoft);
  root.style.setProperty("--accent-strong", preset.accentStrong);
  window.localStorage.setItem(ACCENT_KEY, preset.id);
}

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  window.localStorage.setItem(THEME_KEY, mode);
}

/** Re-applies the stored accent/theme on load — call once on app mount. */
export function initAppearance() {
  applyAccent(getStoredAccentId());
  applyThemeMode(getStoredThemeMode());
}
