"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";
import { groupTeams } from "@/lib/teamRanking";
import { useRosterStore } from "@/store/rosterStore";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const TEAM_GRADIENTS = [
  "from-[var(--pastel-mint)] to-[var(--pastel-sky)]",
  "from-[var(--pastel-peach)] to-[var(--pastel-lavender)]",
];

export function TeamRankingBoard({
  ranking,
  cast = false,
}: {
  ranking: RankedPlayer[];
  cast?: boolean;
}) {
  // groupTeams() sorts by `rank`, which rankCumulative()/rankInverted() already
  // computed in the right direction upstream — no need to re-sort by raw total here.
  const teams = groupTeams(ranking);
  const roster = useRosterStore((s) => s.roster);

  const isTie = teams.length > 1 && teams[0].total === teams[1].total;

  return (
    <div className={`grid gap-4 ${teams.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
      <AnimatePresence initial={false}>
        {teams.map((team, idx) => {
          const leading = idx === 0 && !isTie;
          return (
            <motion.div
              key={team.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className={`relative rounded-3xl bg-gradient-to-br ${TEAM_GRADIENTS[idx % TEAM_GRADIENTS.length]} p-[1px] shadow-md`}
            >
              <div
                className={`rounded-3xl bg-white/70 dark:bg-black/30 backdrop-blur-xl flex flex-col items-center justify-center text-center ${
                  cast ? "py-10 px-6" : "py-6 px-4"
                } ${leading ? "ring-2 ring-white/80" : ""}`}
              >
                {leading && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-black/70 rounded-full px-3 py-1 text-xs font-semibold shadow flex items-center gap-1"
                  >
                    🔥 En tête
                  </motion.div>
                )}
                <div className="flex -space-x-3 mb-2">
                  {team.players.map((p) => (
                    <PlayerAvatar
                      key={p.id}
                      name={p.name}
                      photo={roster.find((r) => r.id === p.id)?.photo}
                      size={cast ? 56 : 40}
                      className="ring-2 ring-white/80 dark:ring-black/40"
                    />
                  ))}
                </div>
                <span className={`font-semibold opacity-80 ${cast ? "text-xl" : "text-sm"}`}>
                  {team.players.map((p) => p.name).join(" & ")}
                </span>
                <span
                  className={`font-bold tabular-nums mt-1 text-shadow-soft ${
                    cast ? "text-6xl" : "text-4xl"
                  }`}
                >
                  {team.total}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
