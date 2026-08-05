"use client";

import { motion } from "framer-motion";
import { RankedPlayer } from "@/lib/engine";

export function DeltaBanner({ ranking, cast }: { ranking: RankedPlayer[]; cast?: boolean }) {
  if (ranking.length < 2) return null;
  const [leader, second] = ranking;
  const gap = Math.abs(leader.total - second.total);

  return (
    <motion.div
      key={`${leader.id}-${gap}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-auto rounded-full glass-squircle !rounded-full px-5 py-2 text-center font-medium ${
        cast ? "text-xl px-8 py-3" : "text-sm"
      }`}
    >
      {gap === 0 ? (
        <span>⚖️ Égalité en tête !</span>
      ) : (
        <span>
          🚀 <strong>{leader.name}</strong> mène de <strong>{gap}</strong> pt{gap > 1 ? "s" : ""}
        </span>
      )}
    </motion.div>
  );
}
