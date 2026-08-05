"use client";

import { motion } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";
import { groupTeams } from "@/lib/teamRanking";
import { useRosterStore } from "@/store/rosterStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const PODIUM_STYLE = {
  1: { height: "h-40", order: "order-2", color: "from-gold/60 to-amber-300/60", medal: "🥇" },
  2: { height: "h-28", order: "order-1", color: "from-silver/60 to-slate-200/60", medal: "🥈" },
  3: { height: "h-20", order: "order-3", color: "from-bronze/60 to-orange-300/60", medal: "🥉" },
} as const;

export function Podium({ ranking }: { ranking: RankedPlayer[] }) {
  const entries = groupTeams(ranking);
  const top3 = entries.filter((e) => e.rank <= 3).slice(0, 3);
  const others = entries.filter((e) => e.rank > 3);
  const lastRank = entries[entries.length - 1]?.rank;
  const roster = useRosterStore((s) => s.roster);

  return (
    <div className="flex flex-col gap-8 items-center">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
        className="text-7xl drop-shadow-lg"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl sm:text-3xl font-bold text-center text-shadow-soft"
      >
        {top3[0]?.name} {top3[0]?.players.length > 1 ? "remportent" : "remporte"} la partie !
      </motion.h1>

      <div className="flex items-end justify-center gap-3 sm:gap-5 w-full max-w-lg">
        {top3.map((entry) => {
          const style = PODIUM_STYLE[entry.rank as 1 | 2 | 3];
          return (
            <motion.div
              key={entry.id}
              className={`flex-1 flex flex-col items-center gap-2 ${style.order}`}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: entry.rank * 0.15, type: "spring", stiffness: 160, damping: 16 }}
            >
              <span className="text-3xl">{style.medal}</span>
              <div className="flex -space-x-3">
                {entry.players.map((p) => (
                  <PlayerAvatar
                    key={p.id}
                    name={p.name}
                    photo={roster.find((r) => r.id === p.id)?.photo}
                    size={48}
                    className="ring-2 ring-white/80 dark:ring-black/40"
                  />
                ))}
              </div>
              <span className="font-semibold text-sm sm:text-base text-center truncate max-w-full px-1">
                {entry.name}
              </span>
              <span className="text-xs opacity-70">{entry.total} pts</span>
              {entry.rank === lastRank && entries.length > 1 && (
                <span className="rounded-full bg-sky-100 dark:bg-sky-400/10 text-sky-600 dark:text-sky-300 px-2 py-0.5 text-[10px]">
                  🌧️ Meilleur effort
                </span>
              )}
              <div
                className={`w-full ${style.height} rounded-t-2xl glass-squircle !rounded-t-2xl !rounded-b-none bg-gradient-to-t ${style.color}`}
              />
            </motion.div>
          );
        })}
      </div>

      {others.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-2">
          {others.map((entry) => (
            <GlassCard key={entry.id} className="!py-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="opacity-60 text-sm">#{entry.rank}</span>
                <div className="flex -space-x-2">
                  {entry.players.map((p) => (
                    <PlayerAvatar
                      key={p.id}
                      name={p.name}
                      photo={roster.find((r) => r.id === p.id)?.photo}
                      size={28}
                      className="ring-2 ring-[var(--background)]"
                    />
                  ))}
                </div>
                <span className="font-medium">{entry.name}</span>
              </span>
              <span className="flex items-center gap-2 text-sm opacity-70">
                {entry.rank === lastRank && (
                  <span className="rounded-full bg-sky-100 dark:bg-sky-400/10 text-sky-600 dark:text-sky-300 px-2 py-0.5 text-xs">
                    🌧️ Meilleur effort
                  </span>
                )}
                {entry.total} pts
              </span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
