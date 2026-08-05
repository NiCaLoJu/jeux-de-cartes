"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";

const TEAM_GRADIENTS = [
  "from-[var(--pastel-mint)] to-[var(--pastel-sky)]",
  "from-[var(--pastel-peach)] to-[var(--pastel-lavender)]",
];

interface Team {
  id: string;
  players: RankedPlayer[];
  total: number;
}

export function TeamRankingBoard({
  ranking,
  cast = false,
  invertedScoring = false,
}: {
  ranking: RankedPlayer[];
  cast?: boolean;
  invertedScoring?: boolean;
}) {
  const teamsMap = new Map<string, RankedPlayer[]>();
  for (const p of ranking) {
    const key = p.teamId ?? p.id;
    const arr = teamsMap.get(key) ?? [];
    arr.push(p);
    teamsMap.set(key, arr);
  }

  const teams: Team[] = Array.from(teamsMap.entries())
    .map(([id, players]) => ({ id, players, total: players[0]?.total ?? 0 }))
    .sort((a, b) => (invertedScoring ? a.total - b.total : b.total - a.total));

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
