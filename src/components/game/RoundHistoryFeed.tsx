"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeloteRoundInput } from "@/lib/engine/belote";
import { TarotRoundInput } from "@/lib/engine/tarot";
import { CoincheRoundInput } from "@/lib/engine/coinche";
import { Player } from "@/lib/engine";
import { getGameById } from "@/data/games";
import { summarizeRound } from "@/lib/roundSummary";
import { roundWinnerIds } from "@/lib/roundWinner";
import { RoundRecord } from "@/store/gameSessionStore";
import { useRosterStore } from "@/store/rosterStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { RoundDetail } from "@/components/game/RoundDetail";
import { CumulativeRoundForm } from "@/components/game/CumulativeRoundForm";
import { BeloteRoundForm } from "@/components/game/BeloteRoundForm";
import { TarotRoundForm } from "@/components/game/TarotRoundForm";
import { CoincheRoundForm } from "@/components/game/CoincheRoundForm";

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
  onEditCoinche,
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
  onEditCoinche: (
    roundNumber: number,
    input: CoincheRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
}) {
  if (rounds.length === 0) return null;

  const reversed = [...rounds].reverse();
  const supportsCoincheLevel = gameId ? getGameById(gameId)?.supportsCoincheLevel : undefined;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide px-1">
        Historique de la partie
      </h3>
      <RoundWinsPanel rounds={rounds} players={players} invertedScoring={invertedScoring} />
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
            supportsCoincheLevel={supportsCoincheLevel}
            onUndoLast={onUndoLast}
            onEditCumulative={onEditCumulative}
            onEditBelote={onEditBelote}
            onEditTarot={onEditTarot}
            onEditCoinche={onEditCoinche}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function RoundWinsPanel({
  rounds,
  players,
  invertedScoring,
}: {
  rounds: RoundRecord[];
  players: Player[];
  invertedScoring?: boolean;
}) {
  const roster = useRosterStore((s) => s.roster);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const winCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of players) counts[p.id] = 0;
    for (const round of rounds) {
      for (const id of roundWinnerIds(round, invertedScoring ?? false)) {
        counts[id] = (counts[id] ?? 0) + 1;
      }
    }
    return counts;
  }, [rounds, players, invertedScoring]);

  const selected = players.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId((v) => (v === p.id ? null : p.id))}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <PlayerAvatar
              name={p.name}
              photo={roster.find((r) => r.id === p.id)?.photo}
              size={40}
              className={selectedId === p.id ? "ring-4 ring-[var(--accent-soft)]" : "opacity-80"}
            />
            <span className="text-xs max-w-[4rem] truncate">{p.name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="!py-2.5 text-sm flex items-center justify-center gap-2">
              🏆 <strong>{selected.name}</strong> a gagné{" "}
              <strong>
                {winCounts[selected.id] ?? 0} manche{(winCounts[selected.id] ?? 0) > 1 ? "s" : ""}
              </strong>{" "}
              sur {rounds.length}
            </GlassCard>
          </motion.div>
        )}
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
  supportsCoincheLevel,
  onUndoLast,
  onEditCumulative,
  onEditBelote,
  onEditTarot,
  onEditCoinche,
}: {
  round: RoundRecord;
  players: Player[];
  gameId?: string;
  isLast: boolean;
  supportsTop?: boolean;
  invertedScoring?: boolean;
  supportsCoincheLevel?: boolean;
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
  onEditCoinche: (
    roundNumber: number,
    input: CoincheRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const summary = summarizeRound(round, players, invertedScoring);

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
              className="mt-2 text-xs font-medium text-[var(--accent)] cursor-pointer"
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
        {expanded && editing && round.module === "coinche" && (
          <CoincheRoundForm
            players={players}
            supportsCoincheLevel={supportsCoincheLevel}
            initial={{ input: round.input, attackTeamPlayerIds: round.attackTeamPlayerIds }}
            submitLabel="💾 Enregistrer"
            onCancel={() => setEditing(false)}
            onSubmit={(input, attack, defense) => {
              onEditCoinche(round.roundNumber, input, attack, defense);
              setEditing(false);
            }}
          />
        )}
      </GlassCard>
    </motion.div>
  );
}
