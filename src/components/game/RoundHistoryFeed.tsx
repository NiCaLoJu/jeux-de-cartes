"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeloteRoundInput } from "@/lib/engine/belote";
import { TarotRoundInput } from "@/lib/engine/tarot";
import { Player } from "@/lib/engine";
import { summarizeRound } from "@/lib/roundSummary";
import { RoundRecord } from "@/store/gameSessionStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { RoundDetail } from "@/components/game/RoundDetail";
import { CumulativeRoundForm } from "@/components/game/CumulativeRoundForm";
import { BeloteRoundForm } from "@/components/game/BeloteRoundForm";
import { TarotRoundForm } from "@/components/game/TarotRoundForm";

export function RoundHistoryFeed({
  rounds,
  players,
  gameId,
  supportsTop,
  invertedScoring,
  onUndoLast,
  onEditCumulative,
  onEditBelote,
  onEditTarot,
}: {
  rounds: RoundRecord[];
  players: Player[];
  gameId?: string;
  supportsTop?: boolean;
  invertedScoring?: boolean;
  onUndoLast: () => void;
  onEditCumulative: (roundNumber: number, points: Record<string, number>, top?: number) => void;
  onEditBelote: (
    roundNumber: number,
    input: BeloteRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  onEditTarot: (
    roundNumber: number,
    input: TarotRoundInput,
    preneurId: string,
    defenderIds: string[],
    partnerId?: string | null
  ) => void;
}) {
  if (rounds.length === 0) return null;

  const reversed = [...rounds].reverse();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide px-1">
        Historique de la partie
      </h3>
      <AnimatePresence initial={false}>
        {reversed.map((round, i) => (
          <RoundRow
            key={round.roundNumber}
            round={round}
            players={players}
            gameId={gameId}
            isLast={i === 0}
            supportsTop={supportsTop}
            invertedScoring={invertedScoring}
            onUndoLast={onUndoLast}
            onEditCumulative={onEditCumulative}
            onEditBelote={onEditBelote}
            onEditTarot={onEditTarot}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function RoundRow({
  round,
  players,
  gameId,
  isLast,
  supportsTop,
  invertedScoring,
  onUndoLast,
  onEditCumulative,
  onEditBelote,
  onEditTarot,
}: {
  round: RoundRecord;
  players: Player[];
  gameId?: string;
  isLast: boolean;
  supportsTop?: boolean;
  invertedScoring?: boolean;
  onUndoLast: () => void;
  onEditCumulative: (roundNumber: number, points: Record<string, number>, top?: number) => void;
  onEditBelote: (
    roundNumber: number,
    input: BeloteRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  onEditTarot: (
    roundNumber: number,
    input: TarotRoundInput,
    preneurId: string,
    defenderIds: string[],
    partnerId?: string | null
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const summary = summarizeRound(round, players);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <GlassCard className="!py-3 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
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
          {isLast && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onUndoLast();
              }}
              aria-label="Annuler cette manche"
              className="flex-shrink-0 w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-xs cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-center"
            >
              ↩︎
            </span>
          )}
          <span className="flex-shrink-0 text-xs opacity-40">{expanded ? "▲" : "▼"}</span>
        </button>

        {expanded && !editing && (
          <div className="pt-1">
            <RoundDetail round={round} players={players} gameId={gameId} />
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-2 text-xs font-medium text-violet-500 cursor-pointer"
            >
              ✏️ Modifier cette manche
            </button>
          </div>
        )}

        {expanded && editing && round.module === "cumulative" && (
          <CumulativeRoundForm
            players={players}
            gameId={gameId}
            roundNumber={round.roundNumber}
            supportsTop={supportsTop}
            invertedScoring={invertedScoring}
            initialPoints={round.points}
            initialTop={round.top}
            submitLabel="💾 Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(points, top) => {
              onEditCumulative(round.roundNumber, points, top);
              setEditing(false);
            }}
          />
        )}
        {expanded && editing && round.module === "cumulative-inverted" && (
          <CumulativeRoundForm
            players={players}
            gameId={gameId}
            roundNumber={round.roundNumber}
            supportsTop={supportsTop}
            invertedScoring={invertedScoring}
            initialPoints={round.points}
            initialTop={round.top}
            submitLabel="💾 Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(points, top) => {
              onEditCumulative(round.roundNumber, points, top);
              setEditing(false);
            }}
          />
        )}
        {expanded && editing && round.module === "belote" && (
          <BeloteRoundForm
            players={players}
            initial={{ input: round.input, attackTeamPlayerIds: round.attackTeamPlayerIds }}
            submitLabel="💾 Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(input, attack, defense) => {
              onEditBelote(round.roundNumber, input, attack, defense);
              setEditing(false);
            }}
          />
        )}
        {expanded && editing && round.module === "tarot" && (
          <TarotRoundForm
            players={players}
            initial={{ input: round.input, preneurId: round.preneurId, partnerId: round.partnerId }}
            submitLabel="💾 Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(input, preneurId, defenderIds, partnerId) => {
              onEditTarot(round.roundNumber, input, preneurId, defenderIds, partnerId);
              setEditing(false);
            }}
          />
        )}
      </GlassCard>
    </motion.div>
  );
}
