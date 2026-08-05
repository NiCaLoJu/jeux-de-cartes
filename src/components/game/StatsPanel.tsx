"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GameRecord } from "@/lib/history";
import { computePlayerStats } from "@/lib/stats";

export function StatsPanel({ records, playerName }: { records: GameRecord[]; playerName: string }) {
  const stats = computePlayerStats(records, playerName);

  if (stats.gamesPlayed === 0) {
    return (
      <GlassCard className="text-center opacity-70">
        <p>Pas encore de statistiques. Lancez une partie pour commencer votre légende ! 🎲</p>
      </GlassCard>
    );
  }

  return (
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
      {stats.worstDefeat && (
        <GlassCard className="col-span-2 sm:col-span-4 flex items-center gap-3">
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
