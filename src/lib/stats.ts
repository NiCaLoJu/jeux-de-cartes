import { GameRecord } from "@/lib/history";

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  podiumCounts: { gold: number; silver: number; bronze: number };
  worstDefeat: { record: GameRecord; gapToLeader: number } | null;
}

/** Stats for a given player name (case-insensitive), across the account's game history. */
export function computePlayerStats(records: GameRecord[], playerName: string): PlayerStats {
  const normalized = playerName.trim().toLowerCase();
  const mine = records.filter((r) => r.players.some((p) => p.name.trim().toLowerCase() === normalized));
  // Most recent first (records are expected sorted desc by playedAt already).
  const chronological = [...mine].sort((a, b) => (a.playedAt < b.playedAt ? 1 : -1));

  let wins = 0;
  const podiumCounts = { gold: 0, silver: 0, bronze: 0 };
  let worstDefeat: PlayerStats["worstDefeat"] = null;
  let currentStreak = 0;
  let streakBroken = false;

  for (const record of chronological) {
    const me = record.players.find((p) => p.name.trim().toLowerCase() === normalized);
    if (!me) continue;
    if (me.rank === 1) {
      wins += 1;
      podiumCounts.gold += 1;
      if (!streakBroken) currentStreak += 1;
    } else {
      streakBroken = true;
      if (me.rank === 2) podiumCounts.silver += 1;
      if (me.rank === 3) podiumCounts.bronze += 1;

      const leader = record.players.find((p) => p.rank === 1);
      if (leader) {
        const gap = Math.abs(leader.total - me.total);
        if (!worstDefeat || gap > worstDefeat.gapToLeader) {
          worstDefeat = { record, gapToLeader: gap };
        }
      }
    }
  }

  return {
    gamesPlayed: mine.length,
    wins,
    winRate: mine.length ? Math.round((wins / mine.length) * 100) : 0,
    currentStreak,
    podiumCounts,
    worstDefeat,
  };
}
