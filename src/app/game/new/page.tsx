"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GAME_LIBRARY, GameDefinition } from "@/data/games";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";
import { useGameSessionStore } from "@/store/gameSessionStore";

function makePlayerId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface DraftPlayer {
  id: string;
  name: string;
  teamId?: "A" | "B";
}

function NewGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createGame = useGameSessionStore((s) => s.createGame);

  const preselected = searchParams.get("game");
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(
    GAME_LIBRARY.find((g) => g.id === preselected) ?? null
  );
  const [players, setPlayers] = useState<DraftPlayer[]>([
    { id: makePlayerId(), name: "" },
    { id: makePlayerId(), name: "" },
  ]);

  // Keep selection in sync if the `?game=` query param changes without a
  // full remount (derived-state-during-render pattern, no effect needed).
  const [syncedPreselected, setSyncedPreselected] = useState(preselected);
  if (preselected !== syncedPreselected) {
    setSyncedPreselected(preselected);
    const g = GAME_LIBRARY.find((x) => x.id === preselected);
    if (g) setSelectedGame(g);
  }

  const needsTeams = selectedGame?.module === "belote" && players.length === 4;

  const validNames = players.filter((p) => p.name.trim().length > 0);
  const canStart = useMemo(() => {
    if (!selectedGame) return false;
    if (validNames.length < selectedGame.minPlayers) return false;
    if (validNames.length > selectedGame.maxPlayers) return false;
    if (needsTeams) {
      const teamA = validNames.filter((p) => p.teamId === "A").length;
      const teamB = validNames.filter((p) => p.teamId === "B").length;
      return teamA === 2 && teamB === 2;
    }
    return true;
  }, [selectedGame, validNames, needsTeams]);

  function updatePlayerName(id: string, name: string) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function updatePlayerTeam(id: string, teamId: "A" | "B") {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, teamId } : p)));
  }

  function addPlayer() {
    if (!selectedGame || players.length >= selectedGame.maxPlayers) return;
    setPlayers((prev) => [...prev, { id: makePlayerId(), name: "" }]);
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function handleStart() {
    if (!selectedGame || !canStart) return;
    const finalPlayers = validNames.map((p) => ({
      id: p.id,
      name: p.name.trim(),
      teamId: needsTeams ? p.teamId : undefined,
    }));
    const id = createGame(selectedGame, finalPlayers);
    router.push(`/game/${id}/play`);
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-8 pt-4 pb-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-shadow-soft">Nouvelle partie</h1>

      <section>
        <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">1. Choisir un jeu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAME_LIBRARY.map((game) => (
            <motion.button
              key={game.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedGame(game)}
              className={`rounded-3xl p-4 flex flex-col items-center gap-1 bg-gradient-to-br ${game.gradient} text-white shadow-md transition-all ${
                selectedGame?.id === game.id ? "ring-4 ring-white/80 scale-[1.02]" : "opacity-80"
              }`}
            >
              <span className="text-3xl">{game.emoji}</span>
              <span className="font-semibold text-sm text-shadow-soft">{game.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {selectedGame && (
        <section>
          <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">
            2. Joueurs ({selectedGame.minPlayers}–{selectedGame.maxPlayers})
          </h2>
          <GlassCard className="flex flex-col gap-3">
            {players.map((player, idx) => (
              <div key={player.id} className="flex items-center gap-2">
                <input
                  value={player.name}
                  onChange={(e) => updatePlayerName(player.id, e.target.value)}
                  placeholder={`Joueur ${idx + 1}`}
                  className="flex-1 rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
                />
                {needsTeams && (
                  <div className="flex gap-1">
                    {(["A", "B"] as const).map((team) => (
                      <button
                        key={team}
                        type="button"
                        onClick={() => updatePlayerTeam(player.id, team)}
                        className={`w-9 h-9 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          player.teamId === team
                            ? "bg-violet-500 text-white"
                            : "bg-black/5 dark:bg-white/10"
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                )}
                {players.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-sm cursor-pointer"
                    aria-label="Retirer"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {players.length < selectedGame.maxPlayers && (
              <button
                type="button"
                onClick={addPlayer}
                className="rounded-xl border border-dashed border-black/20 dark:border-white/20 py-3 text-sm opacity-70 hover:opacity-100 cursor-pointer"
              >
                + Ajouter un joueur
              </button>
            )}
            {needsTeams && (
              <p className="text-xs opacity-60">Belote à 4 : formez deux équipes de 2 (A vs B).</p>
            )}
          </GlassCard>
        </section>
      )}

      <GlossyButton size="xl" disabled={!canStart} onClick={handleStart} className="w-full">
        🚀 Lancer la partie
      </GlossyButton>
    </div>
  );
}

export default function NewGamePage() {
  return (
    <Suspense fallback={null}>
      <NewGameContent />
    </Suspense>
  );
}
