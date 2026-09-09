"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { GameRecord, listGameRecords } from "@/lib/history";
import { PlayerStats, computeAllPlayersStats, computeBadges, computeDuoStats } from "@/lib/stats";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

export default function StatsPage() {
  const user = useAuthStore((s) => s.user);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listGameRecords(user.uid)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [user]);

  const players = computeAllPlayersStats(records);
  const duos = computeDuoStats(records);

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 pt-4 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-sm flex-shrink-0"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">📊 Statistiques</h1>
      </div>

      {loading ? (
        <div className="opacity-60 text-sm">Chargement…</div>
      ) : players.length === 0 ? (
        <GlassCard className="text-center opacity-70">
          <p>Pas encore de parties terminées. Lancez-en une pour commencer les stats ! 🎲</p>
        </GlassCard>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">Par joueur</h2>
            {players.map((p) => (
              <PlayerStatsCard
                key={p.name}
                stats={p}
                open={expanded === p.name}
                onToggle={() => setExpanded(expanded === p.name ? null : p.name)}
              />
            ))}
          </section>

          {duos.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">Meilleurs duos (Belote)</h2>
              {duos.map((d) => (
                <GlassCard key={d.playerNames.join("+")} className="flex items-center justify-between !py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <PlayerAvatar name={d.playerNames[0]} size={28} />
                      <PlayerAvatar name={d.playerNames[1]} size={28} />
                    </div>
                    <div className="text-sm font-medium">{d.playerNames.join(" & ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums">{d.winRate}%</div>
                    <div className="text-xs opacity-50">{d.gamesTogether} parties ensemble</div>
                  </div>
                </GlassCard>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PlayerStatsCard({
  stats,
  open,
  onToggle,
}: {
  stats: PlayerStats;
  open: boolean;
  onToggle: () => void;
}) {
  const badges = computeBadges(stats);
  return (
    <GlassCard className="!py-3">
      <button type="button" onClick={onToggle} className="flex items-center gap-3 w-full text-left cursor-pointer">
        <PlayerAvatar name={stats.name} size={36} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{stats.name}</div>
          <div className="text-xs opacity-60">{stats.gamesPlayed} parties · {stats.wins} victoires</div>
        </div>
        <div className="text-lg font-bold tabular-nums flex-shrink-0">{stats.winRate}%</div>
        <span className="flex-shrink-0 text-xs opacity-40">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="pt-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="🏆 Podiums" value={`${stats.podiumCounts.gold}/${stats.podiumCounts.silver}/${stats.podiumCounts.bronze}`} />
            <MiniStat label="🔥 Meilleure série" value={stats.bestStreak} />
            <MiniStat label="🎯 Score moyen/manche" value={stats.avgRoundScore ?? "—"} />
          </div>

          {(stats.bestRound || stats.worstRound) && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stats.bestRound && (
                <div className="rounded-xl bg-emerald-100 dark:bg-emerald-400/10 px-3 py-2">
                  <div className="opacity-60">Meilleure manche</div>
                  <div className="font-semibold">
                    +{stats.bestRound.value} · {stats.bestRound.record.gameName}
                  </div>
                </div>
              )}
              {stats.worstRound && (
                <div className="rounded-xl bg-rose-100 dark:bg-rose-400/10 px-3 py-2">
                  <div className="opacity-60">Pire manche</div>
                  <div className="font-semibold">
                    {stats.worstRound.value} · {stats.worstRound.record.gameName}
                  </div>
                </div>
              )}
            </div>
          )}

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
        </div>
      )}
    </GlassCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-black/5 dark:bg-white/5 px-2 py-2">
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] opacity-60 leading-tight mt-0.5">{label}</div>
    </div>
  );
}
