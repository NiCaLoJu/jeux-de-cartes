// Core types shared by every scoring engine module.

export type GameModule = "cumulative" | "cumulative-inverted" | "belote" | "tarot";

export interface Player {
  id: string;
  name: string;
  /** For team-based games (Belote), players share a teamId. */
  teamId?: string;
}

export interface RankedPlayer extends Player {
  total: number;
  rank: number;
  /** Points behind the leader (or ahead of the trailer for inverted scoring). */
  delta: number;
}

/** Generic sort direction resolved per module: "desc" = highest wins, "asc" = lowest wins. */
export type SortDirection = "asc" | "desc";

export function rankPlayers(
  totals: Record<string, number>,
  players: Player[],
  direction: SortDirection
): RankedPlayer[] {
  const sorted = [...players].sort((a, b) => {
    const diff = (totals[a.id] ?? 0) - (totals[b.id] ?? 0);
    return direction === "desc" ? -diff : diff;
  });

  const lead = totals[sorted[0]?.id] ?? 0;

  let rank = 0;
  let previousTotal: number | null = null;
  return sorted.map((player, index) => {
    const total = totals[player.id] ?? 0;
    if (previousTotal === null || total !== previousTotal) {
      rank = index + 1;
      previousTotal = total;
    }
    return {
      ...player,
      total,
      rank,
      delta: Math.abs(total - lead),
    };
  });
}
