"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { PublicShare, getPublicShare } from "@/lib/publicShare";
import { summarizeRound } from "@/lib/roundSummary";
import { RoundDetail } from "@/components/game/RoundDetail";
import { ScoreChart } from "@/components/game/ScoreChart";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [share, setShare] = useState<PublicShare | null | "loading">("loading");
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  useEffect(() => {
    getPublicShare(id).then(setShare);
  }, [id]);

  return (
    <main className="flex-1 px-4 sm:px-6 pb-16 safe-top">
      <div className="mx-auto max-w-2xl flex flex-col gap-6 pt-4">
        <Link href="/" className="flex items-center gap-1.5 font-semibold text-sm opacity-80 self-start">
          <span className="text-lg">🏆</span> Score Board
        </Link>

        {share === "loading" && <div className="opacity-60 text-sm text-center pt-10">Chargement…</div>}

        {share === null && (
          <GlassCard className="text-center opacity-70">
            <p>Ce lien de partage est introuvable ou a expiré. 🤷</p>
          </GlassCard>
        )}

        {share && share !== "loading" && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{share.gameEmoji}</span>
              <div>
                <div className="font-bold text-lg">{share.gameName}</div>
                <div className="text-xs opacity-60">
                  {new Date(share.playedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[...share.players]
                .sort((a, b) => a.rank - b.rank)
                .map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      share.winnerIds.includes(p.id)
                        ? "bg-amber-100 dark:bg-amber-400/10 font-semibold"
                        : "bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    <span>
                      {share.winnerIds.includes(p.id) ? "🏆 " : `#${p.rank} `}
                      {p.name}
                    </span>
                    <span className="tabular-nums">{p.total} pts</span>
                  </div>
                ))}
            </div>

            {share.rounds && share.rounds.length > 1 && (
              <GlassCard className="!py-3">
                <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-2">Évolution du score</h3>
                <ScoreChart players={share.players} rounds={share.rounds} />
              </GlassCard>
            )}

            {share.rounds && share.rounds.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wide">Détail des manches</h3>
                {share.rounds.map((round) => {
                  const summary = summarizeRound(round, share.players, share.invertedScoring);
                  const isOpen = expandedRound === round.roundNumber;
                  return (
                    <GlassCard key={round.roundNumber} className="!py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedRound(isOpen ? null : round.roundNumber)}
                        className="flex items-center gap-3 w-full text-left cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                          {round.roundNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{summary.title}</div>
                          <div className="text-xs opacity-60 truncate">{summary.subtitle}</div>
                        </div>
                        <div
                          className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                            summary.positive ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {summary.badge}
                        </div>
                        <span className="flex-shrink-0 text-xs opacity-40">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div className="pt-2">
                          <RoundDetail round={round} players={share.players} gameId={share.gameId} />
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}

            <p className="text-xs opacity-40 text-center pt-4">
              Partagé depuis <Link href="/" className="underline">Score Board</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
