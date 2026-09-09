import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BeloteRoundInput,
  BeloteRoundResult,
  CoincheRoundInput,
  CoincheRoundResult,
  GameModule,
  Player,
  RankedPlayer,
  TarotRoundInput,
  TarotRoundResult,
  applyBeloteRound,
  applyCoincheRound,
  applyCumulativeRound,
  applyTarotRound,
  computeBeloteRound,
  computeCoincheRound,
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
      dealerId?: string;
    }
  | {
      module: "belote";
      roundNumber: number;
      input: BeloteRoundInput;
      result: BeloteRoundResult;
      attackTeamPlayerIds: string[];
      defenseTeamPlayerIds: string[];
      dealerId?: string;
    }
  | {
      module: "tarot";
      roundNumber: number;
      input: TarotRoundInput;
      result: TarotRoundResult;
      preneurId: string;
      defenderIds: string[];
      partnerId?: string | null;
      dealerId?: string;
    }
  | {
      module: "coinche";
      roundNumber: number;
      input: CoincheRoundInput;
      result: CoincheRoundResult;
      attackTeamPlayerIds: string[];
      defenseTeamPlayerIds: string[];
      dealerId?: string;
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
  /** Joueur qui distribue la manche en cours ; tourne automatiquement après chaque manche. */
  dealerId: string;
  /** true = le score le plus bas gagne. Par défaut dérivé du module, mais réglable pour "Divers". */
  invertedScoring: boolean;
  /** "Divers" : fin de partie optionnelle, fixée à la création. */
  endCondition?: { type: "score"; value: number } | { type: "rounds"; value: number };
}

function nextPlayerId(players: Player[], currentId: string): string {
  if (players.length === 0) return currentId;
  const idx = players.findIndex((p) => p.id === currentId);
  if (idx === -1) return players[0].id;
  return players[(idx + 1) % players.length].id;
}

interface GameSessionState {
  sessions: Record<string, GameSession>;
  createGame: (
    game: GameDefinition,
    players: { id: string; name: string; teamId?: string }[],
    invertedScoring?: boolean,
    gameName?: string,
    endCondition?: GameSession["endCondition"]
  ) => string;
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
    defenderIds: string[],
    partnerId?: string | null
  ) => void;
  submitCoincheRound: (
    sessionId: string,
    input: CoincheRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  undoLastRound: (sessionId: string) => void;
  editCumulativeRound: (sessionId: string, roundNumber: number, points: Record<string, number>, top?: number) => void;
  editBeloteRound: (
    sessionId: string,
    roundNumber: number,
    input: BeloteRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  editTarotRound: (
    sessionId: string,
    roundNumber: number,
    input: TarotRoundInput,
    preneurId: string,
    defenderIds: string[],
    partnerId?: string | null
  ) => void;
  editCoincheRound: (
    sessionId: string,
    roundNumber: number,
    input: CoincheRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
  setDealer: (sessionId: string, playerId: string) => void;
  toggleCastMode: (sessionId: string) => void;
  finishGame: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

function makeId() {
  return `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function replaceRound(session: GameSession, roundNumber: number, newRound: RoundRecord): GameSession {
  const nextRounds = session.rounds.map((r) => (r.roundNumber === roundNumber ? newRound : r));
  const nextSession: GameSession = { ...session, rounds: nextRounds };
  nextSession.totals = recomputeTotals(nextSession);
  return nextSession;
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
      totals = applyTarotRound(totals, round.preneurId, round.defenderIds, round.result, round.partnerId);
    } else if (round.module === "coinche") {
      totals = applyCoincheRound(totals, round.attackTeamPlayerIds, round.defenseTeamPlayerIds, round.result);
    }
  }
  return totals;
}

export const useGameSessionStore = create<GameSessionState>()(
  persist(
    (set, get) => ({
      sessions: {},

      createGame: (game, players, invertedScoring, gameName, endCondition) => {
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
          gameName: gameName?.trim() || game.name,
          gameEmoji: game.emoji,
          gradient: game.gradient,
          module: game.module,
          players: normalizedPlayers,
          totals,
          rounds: [],
          status: "active",
          castMode: false,
          createdAt: new Date().toISOString(),
          dealerId: normalizedPlayers[0]?.id ?? "",
          invertedScoring: invertedScoring ?? game.module === "cumulative-inverted",
          endCondition,
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
          dealerId: session.dealerId,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = {
          ...session,
          rounds: nextRounds,
          dealerId: nextPlayerId(session.players, session.dealerId),
        };
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
          dealerId: session.dealerId,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = {
          ...session,
          rounds: nextRounds,
          dealerId: nextPlayerId(session.players, session.dealerId),
        };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      submitTarotRound: (sessionId, input, preneurId, defenderIds, partnerId) => {
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
          partnerId: partnerId ?? null,
          dealerId: session.dealerId,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = {
          ...session,
          rounds: nextRounds,
          dealerId: nextPlayerId(session.players, session.dealerId),
        };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      submitCoincheRound: (sessionId, input, attackTeamPlayerIds, defenseTeamPlayerIds) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const result = computeCoincheRound(input);
        const round: RoundRecord = {
          module: "coinche",
          roundNumber: session.rounds.length + 1,
          input,
          result,
          attackTeamPlayerIds,
          defenseTeamPlayerIds,
          dealerId: session.dealerId,
        };
        const nextRounds = [...session.rounds, round];
        const nextSession: GameSession = {
          ...session,
          rounds: nextRounds,
          dealerId: nextPlayerId(session.players, session.dealerId),
        };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      undoLastRound: (sessionId) => {
        const session = get().sessions[sessionId];
        if (!session || session.rounds.length === 0) return;
        const nextRounds = session.rounds.slice(0, -1);
        const lastRound = session.rounds[session.rounds.length - 1];
        const nextSession: GameSession = {
          ...session,
          rounds: nextRounds,
          dealerId: lastRound.dealerId ?? session.dealerId,
        };
        nextSession.totals = recomputeTotals(nextSession);
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      editCumulativeRound: (sessionId, roundNumber, points, top) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const existing = session.rounds.find((r) => r.roundNumber === roundNumber);
        if (!existing || existing.module === "belote" || existing.module === "tarot" || existing.module === "coinche")
          return;
        const nextSession = replaceRound(session, roundNumber, { ...existing, points, top });
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      editBeloteRound: (sessionId, roundNumber, input, attackTeamPlayerIds, defenseTeamPlayerIds) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const existing = session.rounds.find((r) => r.roundNumber === roundNumber);
        if (!existing || existing.module !== "belote") return;
        const result = computeBeloteRound(input);
        const nextSession = replaceRound(session, roundNumber, {
          ...existing,
          input,
          result,
          attackTeamPlayerIds,
          defenseTeamPlayerIds,
        });
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      editTarotRound: (sessionId, roundNumber, input, preneurId, defenderIds, partnerId) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const existing = session.rounds.find((r) => r.roundNumber === roundNumber);
        if (!existing || existing.module !== "tarot") return;
        const result = computeTarotRound(input);
        const nextSession = replaceRound(session, roundNumber, {
          ...existing,
          input,
          result,
          preneurId,
          defenderIds,
          partnerId: partnerId ?? null,
        });
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      editCoincheRound: (sessionId, roundNumber, input, attackTeamPlayerIds, defenseTeamPlayerIds) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        const existing = session.rounds.find((r) => r.roundNumber === roundNumber);
        if (!existing || existing.module !== "coinche") return;
        const result = computeCoincheRound(input);
        const nextSession = replaceRound(session, roundNumber, {
          ...existing,
          input,
          result,
          attackTeamPlayerIds,
          defenseTeamPlayerIds,
        });
        set((state) => ({ sessions: { ...state.sessions, [sessionId]: nextSession } }));
      },

      setDealer: (sessionId, playerId) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        set((state) => ({
          sessions: { ...state.sessions, [sessionId]: { ...session, dealerId: playerId } },
        }));
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

/** True once the session's optional "Divers" end condition (score cible / nombre de manches) is met. */
export function endConditionReached(session: GameSession): boolean {
  const condition = session.endCondition;
  if (!condition) return false;
  if (condition.type === "rounds") return session.rounds.length >= condition.value;

  const inverted = session.invertedScoring ?? session.module === "cumulative-inverted";
  return session.players.some((p) => {
    const total = session.totals[p.id] ?? 0;
    return inverted ? total <= condition.value : total >= condition.value;
  });
}

export function getRanking(session: GameSession): RankedPlayer[] {
  // Older persisted sessions predate `invertedScoring`; fall back to the module default.
  const inverted = session.invertedScoring ?? session.module === "cumulative-inverted";
  return inverted ? rankInverted(session.totals, session.players) : rankCumulative(session.totals, session.players);
}
