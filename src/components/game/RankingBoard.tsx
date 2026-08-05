"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";
import { useRosterStore } from "@/store/rosterStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** Pastel palette from best rank to worst; cycles if there are more players. */
const RANK_PASTELS = [
  "from-[var(--pastel-mint)] to-[var(--pastel-sky)]",
  "from-[var(--pastel-sky)] to-[var(--pastel-lavender)]",
  "from-[var(--pastel-lavender)] to-[var(--pastel-peach)]",
  "from-[var(--pastel-peach)] to-[var(--pastel-peach)]",
];

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
  const roster = useRosterStore((s) => s.roster);

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {ranking.map((player, index) => {
          const progress = Math.min(100, Math.max(4, (Math.abs(player.total) / maxTotal) * 100));
          const pastel = RANK_PASTELS[Math.min(index, RANK_PASTELS.length - 1)];
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
                <div className="relative flex-shrink-0">
                  <PlayerAvatar
                    name={player.name}
                    photo={roster.find((r) => r.id === player.id)?.photo}
                    size={cast ? 56 : 40}
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 font-bold ring-2 ring-[var(--background)] ${
                      cast ? "w-7 h-7 text-sm" : "w-5 h-5 text-[10px]"
                    }`}
                  >
                    {MEDALS[player.rank] ?? `#${player.rank}`}
                  </div>
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
                      className={`h-full rounded-full bg-gradient-to-r ${pastel}`}
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
