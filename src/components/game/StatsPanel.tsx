"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GameRecord } from "@/lib/history";
import { computeBadges, computePlayerStats } from "@/lib/stats";

export function StatsPanel({ records, playerName }: { records: GameRecord[]; playerName: string }) {
  const stats = computePlayerStats(records, playerName);
  const badges = computeBadges(stats);

  if (stats.gamesPlayed === 0) {
    return (
      <GlassCard className="text-center opacity-70">
        <p>Pas encore de statistiques. Lancez une partie pour commencer votre légende ! 🎲</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Parties jouées" value={stats.gamesPlayed} emoji="🎮" />
        <StatTile label="Taux de victoire" value={`${stats.winRate}%`} emoji="📈" />
        <StatTile label="Série en cours" value={stats.currentStreak} emoji="🔥" />
        <StatTile
          label="Trophées"
          value={`${stats.podiumCounts.gold}🥇 ${stats.podiumCounts.silver}🥈 ${stats.podiumCounts.bronze}🥉`}
          emoji="🏆"
          small
        />
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 flex items-center gap-1"
              title={b.label}
            >
              {b.emoji} {b.label}
            </span>
          ))}
        </div>
      )}

      {stats.worstDefeat && (
        <GlassCard className="flex items-center gap-3">
          <span className="text-3xl">🌧️</span>
          <div>
            <div className="font-semibold">Pire défaite</div>
            <div className="text-sm opacity-70">
              {stats.worstDefeat.record.gameEmoji} {stats.worstDefeat.record.gameName} — écart de{" "}
              {stats.worstDefeat.gapToLeader} points avec le vainqueur
            </div>
          </div>
        </GlassCard>
      )}

      <Link href="/stats" className="text-sm opacity-60 hover:opacity-100 transition-opacity self-start">
        Voir toutes les statistiques →
      </Link>
    </div>
  );
}

function StatTile({
  label,
  value,
  emoji,
  small,
}: {
  label: string;
  value: string | number;
  emoji: string;
  small?: boolean;
}) {
  return (
    <GlassCard className="flex flex-col items-center text-center gap-1 !p-4">
      <span className="text-2xl">{emoji}</span>
      <span className={small ? "text-sm font-semibold" : "text-xl font-bold"}>{value}</span>
      <span className="text-xs opacity-60">{label}</span>
    </GlassCard>
  );
}
