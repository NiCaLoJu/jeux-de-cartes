"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GameRecord } from "@/lib/history";

export function HistoryTimeline({ records }: { records: GameRecord[] }) {
  if (records.length === 0) {
    return (
      <GlassCard className="text-center opacity-70">
        Aucune partie enregistrée pour le moment.
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.slice(0, 12).map((record) => {
        const winners = record.players.filter((p) => record.winnerIds.includes(p.id));
        const date = new Date(record.playedAt);
        return (
          <GlassCard key={record.id} className="flex items-center gap-4 !py-4">
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
        );
      })}
    </div>
  );
}
