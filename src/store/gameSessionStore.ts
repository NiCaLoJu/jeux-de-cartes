import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BeloteRoundInput,
  BeloteRoundResult,
  GameModule,
  Player,
  RankedPlayer,
  TarotRoundInput,
  TarotRoundResult,
  applyBeloteRound,
  applyCumulativeRound,
  applyTarotRound,
  computeBeloteRound,
  computeTarotRound,
  rankCumulative,
  rankInverted,
} from "@/lib/engine";
import { GameDefinition } from "@/data/games";

export type RoundRecord =
  | {
      module: "cumulative" | "cumulative-inverted";
      roundNumber: number;
      points: Record<string, number>;
      top?: number;
    }
  | {
      module: "belote";
      roundNumber: number;
      input: BeloteRoundInput;
      result: BeloteRoundResult;
      attackTeamPlayerIds: string[];
      defenseTeamPlayerIds: string[];
    }
  | {
      module: "tarot";
      roundNumber: number;
      input: TarotRoundInput;
      result: TarotRoundResult;
      preneurId: string;
      defenderIds: string[];
    };

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  gameEmoji: string;
  gradient: string;
  module: GameModule;
  players: Player[];
  totals: Record<string, number>;
  rounds: RoundRecord[];
  status: "active" | "finished";
  castMode: boolean;
  createdAt: string;
  finishedAt?: string;
}

interface GameSessionState {
  sessions: Record<string, GameSession>;
  createGame: (game: GameDefinition, players: { id: string; name: string; teamId?: string }[]) => string;
  submitCumulativeRound: (sessionId: string, points: Record<string, number>, top?: number) => void;
  submitBeloteRound: (
    sessionId: string,
    input: BeloteRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  submitTarotRound: (
    sessionId: string,
    input: TarotRoundInput,
    preneurId: string,
    defenderIds: string[]
  ) => void;
  undoLastRound: (sessionId: string) => void;
  toggleCastMode: (sessionId: string) => void;
  finishGame: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

function makeId() {
  return `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function recomputeTotals(session: GameSession): Record<string, number> {
  let totals: Record<string, number> = {};
  for (const p of session.players) totals[p.id] = 0;

  for (const round of session.rounds) {
    if (round.module === "cumulative" || round.module === "cumulative-inverted") {
      totals = applyCumulativeRound(totals, { points: round.points, top: round.top });
    } else if (round.module === "belote") {
      totals = applyBeloteRound(totals, round.attackTeamPlayerIds, round.defenseTeamPlayerIds, round.result);
    } else if (round.module === "tarot") {
      totals = applyTarotRound(totals, round.preneurId, round.defenderIds, round.result);
    }
  }
  return totals;
}

export const useGameSessionStore = create<GameSessionState>()(
  persist(
    (set, get) => ({
      sessions: {},

      createGame: (game, players) => {
        const id = makeId();
        const totals: Record<string, number> = {};
        const normalizedPlayers: Player[] = players.map((p) => ({
          id: p.id,
          name: p.name,
          teamId: p.teamId,
        }));
        for (const p of normalizedPlayers) totals[p.id] = 0;

        const session: GameSession = {
          id,
          gameId: game.id,
          gameName: game.name,
          gameEmoji: game.emoji,
          gradient: game.gradient,
          module: game.module,
          players: normalizedPlayers,
          totals,
          rounds: [],
          status: "active",
          castMode: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ sessions: { ...state.sessions, [id]: session } }));
        return id;
      },

      submitCumulativeRound: (sessionId, points, top) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const round: RoundRecord = {
          module: session.module as "cumulative" | "cumulative-inverted",
          roundNumber: session.rounds.length + 1,
          points,
          top,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = { ...session, rounds: nextRounds };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      submitBeloteRound: (sessionId, input, attackTeamPlayerIds, defenseTeamPlayerIds) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const result = computeBeloteRound(input);
        const round: RoundRecord = {
          module: "belote",
          roundNumber: session.rounds.length + 1,
          input,
          result,
          attackTeamPlayerIds,
          defenseTeamPlayerIds,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = { ...session, rounds: nextRounds };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      submitTarotRound: (sessionId, input, preneurId, defenderIds) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const result = computeTarotRound(input);
        const round: RoundRecord = {
          module: "tarot",
          roundNumber: session.rounds.length + 1,
          input,
          result,
          preneurId,
          defenderIds,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = { ...session, rounds: nextRounds };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      undoLastRound: (sessionId) => {
        const session = get().sessions[sessionId];
        if (!session || session.rounds.length === 0) return;
        const nextRounds = session.rounds.slice(0, -1);
        const nextSession: GameSession = { ...session, rounds: nextRounds };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      toggleCastMode: (sessionId) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: { ...session, castMode: !session.castMode },
          },
        }));
      },

      finishGame: (sessionId) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              status: "finished",
              finishedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const next = { ...state.sessions };
          delete next[sessionId];
          return { sessions: next };
        });
      },
    }),
    { name: "sbp_active_sessions" }
  )
);

export function getRanking(session: GameSession): RankedPlayer[] {
  if (session.module === "cumulative-inverted") {
    return rankInverted(session.totals, session.players);
  }
  // belote/tarot/cumulative all use "highest wins"
  return rankCumulative(session.totals, session.players);
}
