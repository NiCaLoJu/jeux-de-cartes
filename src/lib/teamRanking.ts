// Shared "group tied team members into one entry" logic for team-based
// games (Belote 4p, ...). Every UI that shows a ranking (live scoreboard,
// delta banner, podium) must reason about teams, not individual players,
// once players carry a teamId — otherwise two teammates who legitimately
// tied get treated as "two separate leaders" or "a tie at the top".

import { RankedPlayer } from "@/lib/engine";

export interface TeamEntry {
  id: string;
  name: string;
  total: number;
  rank: number;
  players: RankedPlayer[];
}

export function isTeamRanking(ranking: RankedPlayer[]): boolean {
  return ranking.some((p) => p.teamId);
}

/** Groups ranking entries by teamId (falls back to 1 player per "team" if not a team game). */
export function groupTeams(ranking: RankedPlayer[]): TeamEntry[] {
  const map = new Map<string, RankedPlayer[]>();
  for (const p of ranking) {
    const key = p.teamId ?? p.id;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .map(([id, players]) => ({
      id,
      name: players.map((p) => p.name).join(" & "),
      total: players[0]?.total ?? 0,
      rank: players[0]?.rank ?? 1,
      players,
    }))
    .sort((a, b) => a.rank - b.rank);
}
