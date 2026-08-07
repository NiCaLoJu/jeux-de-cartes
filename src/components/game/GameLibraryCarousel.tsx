"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GAME_LIBRARY } from "@/data/games";

export function GameLibraryCarousel() {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {GAME_LIBRARY.map((game, i) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Link
            href={`/game/new?game=${game.id}`}
            className="group glass-squircle flex-shrink-0 w-40 sm:w-44 p-4 flex flex-col gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${game.gradient}`}
            >
              {game.emoji}
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">{game.name}</div>
              <div className="text-xs opacity-55 mt-1">{game.tagline}</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
