"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RankedPlayer } from "@/lib/engine";
import { GameSession } from "@/store/gameSessionStore";
import { useAuthStore } from "@/store/authStore";
import { saveGameRecord } from "@/lib/history";
import { Podium } from "@/components/game/Podium";
import { PremiumConfetti } from "@/components/game/PremiumConfetti";
import { GlossyButton } from "@/components/ui/GlossyButton";

export function GameOverCelebration({
  session,
  ranking,
}: {
  session: GameSession;
  ranking: RankedPlayer[];
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [confettiTrigger] = useState(1);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current || !user) return;
    savedRef.current = true;
    const winnerIds = ranking.filter((p) => p.rank === 1).map((p) => p.id);
    saveGameRecord(user.uid, {
      gameId: session.gameId,
      gameName: session.gameName,
      gameEmoji: session.gameEmoji,
      module: session.module,
      playedAt: session.finishedAt ?? new Date().toISOString(),
      players: ranking.map((p) => ({ id: p.id, name: p.name, total: p.total, rank: p.rank })),
      winnerIds,
      roundsCount: session.rounds.length,
    }).catch(() => {});
  }, [ranking, session, user]);

  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center gap-8 pt-6 pb-16">
      <PremiumConfetti trigger={confettiTrigger} />
      <Podium ranking={ranking} />
      <div className="flex gap-3 w-full max-w-sm">
        <GlossyButton variant="ghost" size="lg" className="flex-1" onClick={() => router.push("/dashboard")}>
          🏠 Tableau de bord
        </GlossyButton>
        <GlossyButton size="lg" className="flex-1" onClick={() => router.push("/game/new")}>
          🔁 Rejouer
        </GlossyButton>
      </div>
    </div>
  );
}
