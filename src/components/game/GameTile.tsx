"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameDefinition } from "@/data/games";

interface GameTileProps {
  game: GameDefinition;
  index?: number;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
}

/** Compact icon-badge tile for a game — shared by the Dashboard library and the "Nouvelle partie" picker. */
export function GameTile({ game, index = 0, selected, onClick, href }: GameTileProps) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      className={`glass-squircle !rounded-2xl !p-3.5 flex flex-col gap-3 h-full transition-shadow ${
        selected ? "ring-2 ring-[var(--accent)]" : ""
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg bg-gradient-to-br ${game.gradient}`}
      >
        {game.emoji}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-[13px] leading-tight truncate">{game.name}</div>
        <div className="text-[11px] opacity-50 mt-0.5 leading-snug line-clamp-2">{game.tagline}</div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block text-left h-full w-full cursor-pointer">
      {inner}
    </button>
  );
}
