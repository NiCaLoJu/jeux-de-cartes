import { create } from "zustand";
import { SavedPlayer, deleteSavedPlayer, listRoster, saveSavedPlayer } from "@/lib/roster";

export type { SavedPlayer };

interface RosterState {
  roster: SavedPlayer[];
  loadedForUid: string | null;
  loadRoster: (uid: string) => Promise<void>;
  addSavedPlayer: (uid: string, name: string, photo?: string) => Promise<SavedPlayer>;
  updateSavedPlayer: (
    uid: string,
    id: string,
    updates: Partial<Pick<SavedPlayer, "name" | "photo">>
  ) => Promise<void>;
  removeSavedPlayer: (uid: string, id: string) => Promise<void>;
}

function makeId() {
  return `roster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useRosterStore = create<RosterState>((set, get) => ({
  roster: [],
  loadedForUid: null,

  loadRoster: async (uid) => {
    if (get().loadedForUid === uid) return;
    const roster = await listRoster(uid);
    set({ roster, loadedForUid: uid });
  },

  addSavedPlayer: async (uid, name, photo) => {
    const player: SavedPlayer = { id: makeId(), name: name.trim(), photo };
    set({ roster: [...get().roster, player] });
    await saveSavedPlayer(uid, player);
    return player;
  },

  updateSavedPlayer: async (uid, id, updates) => {
    set({ roster: get().roster.map((p) => (p.id === id ? { ...p, ...updates } : p)) });
    const updated = get().roster.find((p) => p.id === id);
    if (updated) await saveSavedPlayer(uid, updated);
  },

  removeSavedPlayer: async (uid, id) => {
    set({ roster: get().roster.filter((p) => p.id !== id) });
    await deleteSavedPlayer(uid, id);
  },
}));
