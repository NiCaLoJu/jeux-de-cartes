"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useGameSessionStore, getRanking, endConditionReached } from "@/store/gameSessionStore";
import { getGameById } from "@/data/games";
import { RankingBoard } from "@/components/game/RankingBoard";
import { TeamRankingBoard } from "@/components/game/TeamRankingBoard";
import { DealerBanner } from "@/components/game/DealerBanner";
import { RoundHistoryFeed } from "@/components/game/RoundHistoryFeed";
import { ScoreChart } from "@/components/game/ScoreChart";
import { DeltaBanner } from "@/components/game/DeltaBanner";
import { GlassCard } from "@/components/ui/GlassCard";
import { CumulativeRoundForm } from "@/components/game/CumulativeRoundForm";
import { BeloteRoundForm } from "@/components/game/BeloteRoundForm";
import { TarotRoundForm } from "@/components/game/TarotRoundForm";
import { CoincheRoundForm } from "@/components/game/CoincheRoundForm";
import { GameOverCelebration } from "@/components/game/GameOverCelebration";
import { GlossyButton } from "@/components/ui/GlossyButton";
import { FIVE_ROIS_GAME_ID } from "@/lib/fiveRoisJoker";

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const session = useGameSessionStore((s) => s.sessions[id]);
  const submitCumulativeRound = useGameSessionStore((s) => s.submitCumulativeRound);
  const submitBeloteRound = useGameSessionStore((s) => s.submitBeloteRound);
  const submitTarotRound = useGameSessionStore((s) => s.submitTarotRound);
  const submitCoincheRound = useGameSessionStore((s) => s.submitCoincheRound);
  const editCumulativeRound = useGameSessionStore((s) => s.editCumulativeRound);
  const editBeloteRound = useGameSessionStore((s) => s.editBeloteRound);
  const editTarotRound = useGameSessionStore((s) => s.editTarotRound);
  const editCoincheRound = useGameSessionStore((s) => s.editCoincheRound);
  const undoLastRound = useGameSessionStore((s) => s.undoLastRound);
  const setDealer = useGameSessionStore((s) => s.setDealer);
  const toggleCastMode = useGameSessionStore((s) => s.toggleCastMode);
  const finishGame = useGameSessionStore((s) => s.finishGame);

  if (!session) {
    return (
      <div className="mx-auto max-w-md pt-16 text-center flex flex-col gap-4">
        <p className="opacity-70">Cette partie est introuvable ou a expiré.</p>
        <GlossyButton onClick={() => router.push("/dashboard")}>Retour au tableau de bord</GlossyButton>
      </div>
    );
  }

  const gameDef = getGameById(session.gameId);
  const ranking = getRanking(session);
  const invertedScoring = session.invertedScoring ?? session.module === "cumulative-inverted";
  const isTeamGame = session.players.some((p) => p.teamId);
  const dealerBannerAboveForm = session.gameId === FIVE_ROIS_GAME_ID;
  const endReached = endConditionReached(session);

  const dealerBanner = (
    <DealerBanner
      players={session.players}
      dealerId={session.dealerId}
      onChangeDealer={(playerId) => setDealer(id, playerId)}
    />
  );

  if (session.status === "finished") {
    return <GameOverCelebration session={session} ranking={ranking} />;
  }

  if (session.castMode) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 px-6 py-10 overflow-y-auto">
        <button
          type="button"
          onClick={() => toggleCastMode(id)}
          className="fixed right-4 w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 text-sm cursor-pointer z-30"
          style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          aria-label="Quitter le mode cast"
        >
          ✕
        </button>
        <div className="text-4xl">{session.gameEmoji}</div>
        <h1 className="text-3xl font-bold text-shadow-soft">{session.gameName}</h1>
        <DeltaBanner ranking={ranking} cast />
        <div className="w-full max-w-2xl">
          {isTeamGame ? (
            <TeamRankingBoard ranking={ranking} cast />
          ) : (
            <RankingBoard ranking={ranking} cast invertedScoring={invertedScoring} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{session.gameEmoji}</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">{session.gameName}</h1>
            <p className="text-xs opacity-60">Manche {session.rounds.length + 1}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <GlossyButton size="sm" variant="ghost" onClick={() => toggleCastMode(id)}>
            📺 Caster
          </GlossyButton>
          <GlossyButton size="sm" variant="danger" onClick={() => finishGame(id)}>
            🏁 Terminer
          </GlossyButton>
        </div>
      </div>

      {!dealerBannerAboveForm && dealerBanner}

      {endReached && (
        <GlassCard className="!py-3 flex items-center justify-between gap-3 bg-amber-100/70 dark:bg-amber-400/10">
          <div className="text-sm font-medium">
            🏁 Fin de partie atteinte !
          </div>
          <GlossyButton size="sm" variant="danger" onClick={() => finishGame(id)}>
            Terminer
          </GlossyButton>
        </GlassCard>
      )}

      <DeltaBanner ranking={ranking} />

      {isTeamGame ? (
        <TeamRankingBoard ranking={ranking} />
      ) : (
        <RankingBoard ranking={ranking} invertedScoring={invertedScoring} />
      )}

      {session.rounds.length > 1 && (
        <GlassCard className="!py-3">
          <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-2">Évolution du score</h3>
          <ScoreChart players={session.players} rounds={session.rounds} />
        </GlassCard>
      )}

      <RoundHistoryFeed
        rounds={session.rounds}
        players={session.players}
        gameId={session.gameId}
        supportsTop={gameDef?.supportsTop}
        invertedScoring={invertedScoring}
        onUndoLast={() => undoLastRound(id)}
        onEditCumulative={(roundNumber, points, top) => editCumulativeRound(id, roundNumber, points, top)}
        onEditBelote={(roundNumber, input, attack, defense) =>
          editBeloteRound(id, roundNumber, input, attack, defense)
        }
        onEditTarot={(roundNumber, input, preneurId, defenderIds, partnerId) =>
          editTarotRound(id, roundNumber, input, preneurId, defenderIds, partnerId)
        }
        onEditCoinche={(roundNumber, input, attack, defense) =>
          editCoincheRound(id, roundNumber, input, attack, defense)
        }
      />

      {(session.module === "cumulative" || session.module === "cumulative-inverted") && (
        <>
          {dealerBannerAboveForm && dealerBanner}
          <CumulativeRoundForm
            players={session.players}
            gameId={session.gameId}
            roundNumber={session.rounds.length + 1}
            supportsTop={gameDef?.supportsTop}
            invertedScoring={invertedScoring}
            onSubmit={(points, top) => submitCumulativeRound(id, points, top)}
          />
        </>
      )}

      {session.module === "belote" && (
        <BeloteRoundForm
          players={session.players}
          onSubmit={(input, attack, defense) => submitBeloteRound(id, input, attack, defense)}
        />
      )}

      {session.module === "tarot" && (
        <TarotRoundForm
          players={session.players}
          onSubmit={(input, preneurId, defenderIds, partnerId) =>
            submitTarotRound(id, input, preneurId, defenderIds, partnerId)
          }
        />
      )}

      {session.module === "coinche" && (
        <CoincheRoundForm
          players={session.players}
          supportsCoincheLevel={gameDef?.supportsCoincheLevel}
          onSubmit={(input, attack, defense) => submitCoincheRound(id, input, attack, defense)}
        />
      )}
    </div>
  );
}
