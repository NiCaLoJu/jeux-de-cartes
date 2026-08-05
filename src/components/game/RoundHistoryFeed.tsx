"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/engine";
import { summarizeRound } from "@/lib/roundSummary";
import { RoundRecord } from "@/store/gameSessionStore";
import { GlassCard } from "@/components/ui/GlassCard";

export function RoundHistoryFeed({
  rounds,
  players,
  onUndoLast,
}: {
  rounds: RoundRecord[];
  players: Player[];
  onUndoLast: () => void;
}) {
  if (rounds.length === 0) return null;

  const reversed = [...rounds].reverse();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide px-1">
        Historique de la partie
      </h3>
      <AnimatePresence initial={false}>
        {reversed.map((round, i) => {
          const summary = summarizeRound(round, players);
          const isLast = i === 0;
          return (
            <motion.div
              key={round.roundNumber}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <GlassCard className="!py-3 flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                  {round.roundNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{summary.title}</div>
                  <div className="text-xs opacity-60 truncate">{summary.subtitle}</div>
                </div>
                <div
                  className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                    summary.positive ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {summary.badge}
                </div>
                {isLast && (
                  <button
                    type="button"
                    onClick={onUndoLast}
                    aria-label="Annuler cette manche"
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-xs cursor-pointer opacity-60 hover:opacity-100"
                  >
                    ↩︎
                  </button>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
