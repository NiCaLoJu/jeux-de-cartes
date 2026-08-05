import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedPlayer {
  id: string;
  name: string;
  /** Small square JPEG data URL, or undefined for the initial-letter fallback avatar. */
  photo?: string;
}

interface RosterState {
  roster: SavedPlayer[];
  addSavedPlayer: (name: string, photo?: string) => SavedPlayer;
  updateSavedPlayer: (id: string, updates: Partial<Pick<SavedPlayer, "name" | "photo">>) => void;
  removeSavedPlayer: (id: string) => void;
}

function makeId() {
  return `roster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useRosterStore = create<RosterState>()(
  persist(
    (set, get) => ({
      roster: [],

      addSavedPlayer: (name, photo) => {
        const player: SavedPlayer = { id: makeId(), name: name.trim(), photo };
        set({ roster: [...get().roster, player] });
        return player;
      },

      updateSavedPlayer: (id, updates) => {
        set({
          roster: get().roster.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        });
      },

      removeSavedPlayer: (id) => {
        set({ roster: get().roster.filter((p) => p.id !== id) });
      },
    }),
    { name: "sbp_roster" }
  )
);
