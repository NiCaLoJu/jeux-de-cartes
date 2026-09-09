// Remembers the last group of players used per game, so "Nouvelle partie"
// can offer a one-tap "reprendre le même groupe" shortcut for recurring
// game nights. Device-local (localStorage) — not account data.

export interface LastGroupPlayer {
  id: string;
  name: string;
  photo?: string;
}

function key(gameId: string) {
  return `sbp_last_group_${gameId}`;
}

export function getLastGroup(gameId: string): LastGroupPlayer[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(gameId));
    return raw ? (JSON.parse(raw) as LastGroupPlayer[]) : null;
  } catch {
    return null;
  }
}

export function saveLastGroup(gameId: string, players: LastGroupPlayer[]) {
  if (typeof window === "undefined" || players.length === 0) return;
  window.localStorage.setItem(key(gameId), JSON.stringify(players));
}
