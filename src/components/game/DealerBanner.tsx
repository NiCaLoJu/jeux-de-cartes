"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/engine";
import { useRosterStore } from "@/store/rosterStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

export function DealerBanner({
  players,
  dealerId,
  onChangeDealer,
}: {
  players: Player[];
  dealerId: string;
  onChangeDealer: (playerId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dealer = players.find((p) => p.id === dealerId);
  const roster = useRosterStore((s) => s.roster);
  const dealerPhoto = dealer ? roster.find((r) => r.id === dealer.id)?.photo : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-squircle p-5 sm:p-6 !py-2 w-full flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        <span className="text-lg">🃏</span>
        <span className="opacity-70">Distribue :</span>
        {dealer && <PlayerAvatar name={dealer.name} photo={dealerPhoto} size={24} />}
        <span className="font-semibold">{dealer?.name ?? "—"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 w-max max-w-[90vw]"
          >
            <GlassCard className="flex flex-wrap gap-2 justify-center !py-3">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChangeDealer(p.id);
                    setOpen(false);
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                    p.id === dealerId ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
