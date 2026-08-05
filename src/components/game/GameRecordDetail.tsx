"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameRecord } from "@/lib/history";
import { summarizeRound } from "@/lib/roundSummary";
import { RoundDetail } from "@/components/game/RoundDetail";
import { GlassCard } from "@/components/ui/GlassCard";

export function GameRecordDetail({ record, onClose }: { record: GameRecord; onClose: () => void }) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const sortedPlayers = [...record.players].sort((a, b) => a.rank - b.rank);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl glass-squircle p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{record.gameEmoji}</span>
            <div>
              <div className="font-bold">{record.gameName}</div>
              <div className="text-xs opacity-60">
                {new Date(record.playedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-sm cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {sortedPlayers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                record.winnerIds.includes(p.id)
                  ? "bg-amber-100 dark:bg-amber-400/10 font-semibold"
                  : "bg-black/5 dark:bg-white/5"
              }`}
            >
              <span>
                {record.winnerIds.includes(p.id) ? "🏆 " : `#${p.rank} `}
                {p.name}
              </span>
              <span className="tabular-nums">{p.total} pts</span>
            </div>
          ))}
        </div>

        {record.rounds && record.rounds.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wide">Détail des manches</h3>
            <AnimatePresence initial={false}>
              {record.rounds.map((round) => {
                const summary = summarizeRound(round, record.players);
                const isOpen = expandedRound === round.roundNumber;
                return (
                  <GlassCard key={round.roundNumber} className="!py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedRound(isOpen ? null : round.roundNumber)}
                      className="flex items-center gap-3 w-full text-left cursor-pointer"
                    >
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
                      <span className="flex-shrink-0 text-xs opacity-40">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="pt-2">
                        <RoundDetail round={round} players={record.players} />
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-xs opacity-50 text-center">
            Détail des manches non disponible pour cette partie.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
