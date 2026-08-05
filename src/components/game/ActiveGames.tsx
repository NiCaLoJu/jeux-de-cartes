"use client";

import Link from "next/link";
import { useGameSessionStore } from "@/store/gameSessionStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";

export function ActiveGames() {
  const sessions = useGameSessionStore((s) => s.sessions);
  const active = Object.values(sessions)
    .filter((s) => s.status === "active")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (active.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {active.map((session) => (
        <GlassCard key={session.id} className="flex items-center gap-4 !py-4">
          <span className="text-3xl">{session.gameEmoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{session.gameName}</div>
            <div className="text-xs opacity-60">
              {session.players.length} joueurs · manche {session.rounds.length + 1} en cours
            </div>
          </div>
          <Link href={`/game/${session.id}/play`}>
            <GlossyButton size="sm" variant="mint">
              Reprendre
            </GlossyButton>
          </Link>
        </GlassCard>
      ))}
    </div>
  );
}
