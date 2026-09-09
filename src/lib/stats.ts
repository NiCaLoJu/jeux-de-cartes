import { GameRecord, GameRecordPlayer } from "@/lib/history";

const CUMULATIVE_MODULES = new Set(["cumulative", "cumulative-inverted"]);

export interface PlayerStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  podiumCounts: { gold: number; silver: number; bronze: number };
  worstDefeat: { record: GameRecord; gapToLeader: number } | null;
  avgRoundScore: number | null;
  bestRound: { record: GameRecord; roundNumber: number; value: number } | null;
  worstRound: { record: GameRecord; roundNumber: number; value: number } | null;
}

function findPlayerId(record: GameRecord, normalizedName: string): string | undefined {
  return record.players.find((p) => p.name.trim().toLowerCase() === normalizedName)?.id;
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

  let bestStreak = 0;
  let running = 0;
  for (const record of [...chronological].reverse()) {
    const me = record.players.find((p) => p.name.trim().toLowerCase() === normalized);
    if (!me) continue;
    if (me.rank === 1) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  let roundValueSum = 0;
  let roundValueCount = 0;
  let bestRound: PlayerStats["bestRound"] = null;
  let worstRound: PlayerStats["worstRound"] = null;
  for (const record of mine) {
    if (!CUMULATIVE_MODULES.has(record.module) || !record.rounds) continue;
    const myId = findPlayerId(record, normalized);
    if (!myId) continue;
    for (const round of record.rounds) {
      if (round.module !== "cumulative" && round.module !== "cumulative-inverted") continue;
      const value = round.points[myId];
      if (value === undefined) continue;
      roundValueSum += value;
      roundValueCount += 1;
      if (!bestRound || value > bestRound.value) bestRound = { record, roundNumber: round.roundNumber, value };
      if (!worstRound || value < worstRound.value) worstRound = { record, roundNumber: round.roundNumber, value };
    }
  }

  return {
    name: playerName,
    gamesPlayed: mine.length,
    wins,
    winRate: mine.length ? Math.round((wins / mine.length) * 100) : 0,
    currentStreak,
    bestStreak,
    podiumCounts,
    worstDefeat,
    avgRoundScore: roundValueCount ? Math.round((roundValueSum / roundValueCount) * 10) / 10 : null,
    bestRound,
    worstRound,
  };
}

/** Stats for every player name that has ever appeared in the account's history, best win rate first. */
export function computeAllPlayersStats(records: GameRecord[]): PlayerStats[] {
  const namesByKey = new Map<string, string>();
  for (const record of records) {
    for (const p of record.players) {
      const key = p.name.trim().toLowerCase();
      if (key && !namesByKey.has(key)) namesByKey.set(key, p.name.trim());
    }
  }
  return Array.from(namesByKey.values())
    .map((name) => computePlayerStats(records, name))
    .sort((a, b) => b.winRate - a.winRate || b.gamesPlayed - a.gamesPlayed);
}

export interface Badge {
  emoji: string;
  label: string;
}

const BADGE_DEFS: { emoji: string; label: string; test: (s: PlayerStats) => boolean }[] = [
  { emoji: "🎲", label: "Première partie", test: (s) => s.gamesPlayed >= 1 },
  { emoji: "🎯", label: "Habitué·e (10 parties)", test: (s) => s.gamesPlayed >= 10 },
  { emoji: "💎", label: "Vétéran·e (50 parties)", test: (s) => s.gamesPlayed >= 50 },
  { emoji: "🏆", label: "10 victoires", test: (s) => s.wins >= 10 },
  { emoji: "🔥", label: "3 victoires d'affilée", test: (s) => s.bestStreak >= 3 },
  { emoji: "⚡", label: "5 victoires d'affilée", test: (s) => s.bestStreak >= 5 },
  { emoji: "📈", label: "Stratège (60%+ de victoires)", test: (s) => s.gamesPlayed >= 5 && s.winRate >= 60 },
];

/** Achievement badges earned so far, most impressive first. */
export function computeBadges(stats: PlayerStats): Badge[] {
  return BADGE_DEFS.filter((b) => b.test(stats)).map(({ emoji, label }) => ({ emoji, label })).reverse();
}

export interface DuoStats {
  playerNames: [string, string];
  gamesTogether: number;
  wins: number;
  winRate: number;
}

/**
 * Win rate of teammate pairs in team games (Belote/Coinche/Contrée, 4p).
 * Teammates aren't stored directly on GameRecordPlayer, but two players
 * sharing the exact same total+rank in a 4-player game were necessarily on
 * the same team that game.
 */
export function computeDuoStats(records: GameRecord[]): DuoStats[] {
  const map = new Map<string, { names: [string, string]; games: number; wins: number }>();

  for (const record of records) {
    if ((record.module !== "belote" && record.module !== "coinche") || record.players.length !== 4) continue;
    const buckets = new Map<string, GameRecordPlayer[]>();
    for (const p of record.players) {
      const key = `${p.total}_${p.rank}`;
      const arr = buckets.get(key) ?? [];
      arr.push(p);
      buckets.set(key, arr);
    }
    for (const pair of buckets.values()) {
      if (pair.length !== 2) continue;
      const names = [pair[0].name.trim(), pair[1].name.trim()].sort((a, b) =>
        a.localeCompare(b)
      ) as [string, string];
      const key = names.join("__").toLowerCase();
      const entry = map.get(key) ?? { names, games: 0, wins: 0 };
      entry.games += 1;
      if (pair.every((p) => record.winnerIds.includes(p.id))) entry.wins += 1;
      map.set(key, entry);
    }
  }

  return Array.from(map.values())
    .filter((d) => d.games >= 2)
    .map((d) => ({
      playerNames: d.names,
      gamesTogether: d.games,
      wins: d.wins,
      winRate: Math.round((d.wins / d.games) * 100),
    }))
    .sort((a, b) => b.winRate - a.winRate || b.gamesTogether - a.gamesTogether);
}
