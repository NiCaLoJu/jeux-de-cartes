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
            className={`group relative flex-shrink-0 w-40 sm:w-48 h-52 sm:h-56 rounded-[28px] p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${game.gradient} shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] active:scale-[0.98]`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="relative text-5xl drop-shadow-sm">{game.emoji}</div>
            <div className="relative">
              <div className="font-bold text-lg text-white text-shadow-soft leading-tight">
                {game.name}
              </div>
              <div className="text-xs text-white/85 mt-1">{game.tagline}</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
