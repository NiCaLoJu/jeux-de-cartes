"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GameRecord } from "@/lib/history";

const DELETE_WIDTH = 84;

export function HistoryTimeline({
  records,
  onDelete,
}: {
  records: GameRecord[];
  onDelete?: (id: string) => void;
}) {
  if (records.length === 0) {
    return (
      <GlassCard className="text-center opacity-70">
        Aucune partie enregistrée pour le moment.
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.slice(0, 12).map((record) => (
        <HistoryRow key={record.id} record={record} onDelete={onDelete} />
      ))}
    </div>
  );
}

function HistoryRow({
  record,
  onDelete,
}: {
  record: GameRecord;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const winners = record.players.filter((p) => record.winnerIds.includes(p.id));
  const date = new Date(record.playedAt);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(record.id)}
          aria-label="Supprimer la partie"
          className="absolute inset-y-0 right-0 flex items-center justify-center text-white bg-rose-500 cursor-pointer"
          style={{ width: DELETE_WIDTH }}
        >
          🗑️
        </button>
      )}
      <motion.div
        drag={onDelete ? "x" : false}
        dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
        dragElastic={0.05}
        animate={{ x: open ? -DELETE_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        onDragEnd={(_, info) => {
          setOpen(info.offset.x < -DELETE_WIDTH / 2);
        }}
      >
        <GlassCard className="flex items-center gap-4 !py-4">
          <span className="text-3xl">{record.gameEmoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{record.gameName}</div>
            <div className="text-xs opacity-60">
              {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}{" "}
              · {record.players.length} joueurs
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold flex items-center gap-1 justify-end">
              🏆 {winners.map((w) => w.name).join(", ")}
            </div>
            <div className="text-xs opacity-60">{winners[0]?.total} pts</div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
