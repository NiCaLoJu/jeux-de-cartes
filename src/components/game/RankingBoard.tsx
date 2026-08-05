"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";
import { GlassCard } from "@/components/ui/GlassCard";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankingBoard({
  ranking,
  cast = false,
  invertedScoring = false,
}: {
  ranking: RankedPlayer[];
  cast?: boolean;
  invertedScoring?: boolean;
}) {
  const maxTotal = Math.max(...ranking.map((p) => Math.abs(p.total)), 1);
  const leader = ranking[0];

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {ranking.map((player) => {
          const progress = Math.min(100, Math.max(4, (Math.abs(player.total) / maxTotal) * 100));
          return (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <GlassCard
                className={`flex items-center gap-4 ${cast ? "!py-6" : "!py-4"} ${
                  player.rank === 1 ? "ring-2 ring-gold/70" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 font-bold ${
                    cast ? "w-14 h-14 text-2xl" : "w-10 h-10 text-sm"
                  }`}
                >
                  {MEDALS[player.rank] ?? `#${player.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-semibold truncate ${cast ? "text-2xl" : "text-base"}`}>
                      {player.name}
                    </span>
                    <span className={`font-bold tabular-nums ${cast ? "text-3xl" : "text-lg"}`}>
                      {player.total}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                  {leader && player.id !== leader.id && (
                    <div className="text-xs opacity-60 mt-1">
                      {invertedScoring ? "derrière" : "retard"} de {player.delta} pt
                      {player.delta > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
