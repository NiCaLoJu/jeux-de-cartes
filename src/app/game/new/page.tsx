"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_LIBRARY, GameDefinition } from "@/data/games";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useGameSessionStore } from "@/store/gameSessionStore";
import { useRosterStore } from "@/store/rosterStore";
import { useAuthStore } from "@/store/authStore";
import { resizeImageFile } from "@/lib/imageResize";

function makePlayerId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface DraftPlayer {
  id: string;
  name: string;
  teamId?: "A" | "B";
  photo?: string;
}

function NewGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createGame = useGameSessionStore((s) => s.createGame);
  const user = useAuthStore((s) => s.user);
  const roster = useRosterStore((s) => s.roster);
  const addSavedPlayer = useRosterStore((s) => s.addSavedPlayer);
  const updateSavedPlayer = useRosterStore((s) => s.updateSavedPlayer);
  const [activeSuggestId, setActiveSuggestId] = useState<string | null>(null);

  const preselected = searchParams.get("game");
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(
    GAME_LIBRARY.find((g) => g.id === preselected) ?? null
  );
  const [players, setPlayers] = useState<DraftPlayer[]>([
    { id: makePlayerId(), name: "" },
    { id: makePlayerId(), name: "" },
  ]);
  const [newRosterName, setNewRosterName] = useState("");
  const [addingToRoster, setAddingToRoster] = useState(false);
  const [invertedScoring, setInvertedScoring] = useState(false);
  const [customGameName, setCustomGameName] = useState("");
  const [endConditionType, setEndConditionType] = useState<"none" | "score" | "rounds">("none");
  const [endConditionValue, setEndConditionValue] = useState("");

  const photoTargetRef = useRef<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const newRosterPhotoInputRef = useRef<HTMLInputElement>(null);
  const [newRosterPhoto, setNewRosterPhoto] = useState<string | undefined>();

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

  function shuffleTeams() {
    setPlayers((prev) => {
      const ids = prev.map((p) => p.id);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      const half = Math.ceil(ids.length / 2);
      const teamOf = new Map(ids.map((id, idx) => [id, idx < half ? "A" : "B"] as const));
      return prev.map((p) => ({ ...p, teamId: teamOf.get(p.id) }));
    });
  }

  function addPlayer() {
    if (!selectedGame || players.length >= selectedGame.maxPlayers) return;
    setPlayers((prev) => [...prev, { id: makePlayerId(), name: "" }]);
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleRosterPlayer(id: string, name: string, photo?: string) {
    setPlayers((prev) => {
      if (prev.some((p) => p.id === id)) {
        return prev.filter((p) => p.id !== id);
      }
      const emptySlot = prev.find((p) => !p.name.trim() && !p.teamId);
      if (emptySlot) {
        return prev.map((p) => (p.id === emptySlot.id ? { id, name, photo } : p));
      }
      if (selectedGame && prev.length >= selectedGame.maxPlayers) return prev;
      return [...prev, { id, name, photo }];
    });
  }

  function openPhotoPicker(playerId: string) {
    photoTargetRef.current = playerId;
    photoInputRef.current?.click();
  }

  async function handlePhotoSelected(file: File | undefined) {
    const playerId = photoTargetRef.current;
    if (!file || !playerId || !user) return;
    const photo = await resizeImageFile(file);
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, photo } : p)));
    const player = players.find((p) => p.id === playerId);
    if (player?.name.trim()) {
      if (roster.some((r) => r.id === playerId)) {
        updateSavedPlayer(user.uid, playerId, { photo });
      } else {
        addSavedPlayer(user.uid, player.name, photo);
      }
    }
  }

  async function handleNewRosterPhotoSelected(file: File | undefined) {
    if (!file) return;
    setNewRosterPhoto(await resizeImageFile(file));
  }

  async function confirmAddToRoster() {
    if (!newRosterName.trim() || !user) return;
    const saved = await addSavedPlayer(user.uid, newRosterName, newRosterPhoto);
    toggleRosterPlayer(saved.id, saved.name, saved.photo);
    setNewRosterName("");
    setNewRosterPhoto(undefined);
    setAddingToRoster(false);
  }

  function selectSuggestion(draftId: string, suggestion: { id: string; name: string; photo?: string }) {
    setPlayers((prev) => {
      if (prev.some((p) => p.id === suggestion.id && p.id !== draftId)) return prev;
      return prev.map((p) =>
        p.id === draftId ? { id: suggestion.id, name: suggestion.name, teamId: p.teamId, photo: suggestion.photo } : p
      );
    });
    setActiveSuggestId(null);
  }

  function handleStart() {
    if (!selectedGame || !canStart) return;
    const finalPlayers = validNames.map((p) => ({
      id: p.id,
      name: p.name.trim(),
      teamId: needsTeams ? p.teamId : undefined,
    }));

    // Anyone typed in by hand (not already a saved roster entry, and not
    // just a re-typed name that matches one) is remembered from here on,
    // so next time their name autocompletes.
    if (user) {
      for (const p of validNames) {
        const alreadySaved = roster.some(
          (r) => r.id === p.id || r.name.trim().toLowerCase() === p.name.trim().toLowerCase()
        );
        if (!alreadySaved) {
          addSavedPlayer(user.uid, p.name, p.photo);
        }
      }
    }

    const endConditionNumeric = Number(endConditionValue);
    const endCondition =
      selectedGame.supportsEndCondition && endConditionType !== "none" && endConditionNumeric > 0
        ? { type: endConditionType, value: endConditionNumeric }
        : undefined;

    const id = createGame(
      selectedGame,
      finalPlayers,
      selectedGame.supportsInvertedToggle ? invertedScoring : undefined,
      selectedGame.supportsCustomName ? customGameName : undefined,
      endCondition
    );
    router.push(`/game/${id}/play`);
  }

  let stepCounter = 1;
  const nameStepNum = selectedGame?.supportsCustomName ? ++stepCounter : null;
  const invertedStepNum = selectedGame?.supportsInvertedToggle ? ++stepCounter : null;
  const endConditionStepNum = selectedGame?.supportsEndCondition ? ++stepCounter : null;
  const playersStepNum = selectedGame ? ++stepCounter : null;

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-8 pb-16">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handlePhotoSelected(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

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

      {selectedGame?.supportsCustomName && (
        <section>
          <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">
            {nameStepNum}. Nom de la partie
          </h2>
          <GlassCard className="!py-3">
            <input
              value={customGameName}
              onChange={(e) => setCustomGameName(e.target.value)}
              placeholder={selectedGame.name}
              maxLength={40}
              className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
            />
            <p className="text-xs opacity-60 mt-2">
              Ex. « Rami », « Yams »… laisse vide pour garder « {selectedGame.name} ».
            </p>
          </GlassCard>
        </section>
      )}

      {selectedGame?.supportsInvertedToggle && (
        <section>
          <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">
            {invertedStepNum}. Sens du score
          </h2>
          <GlassCard className="flex flex-col gap-2 !py-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInvertedScoring(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                  !invertedScoring ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                🔼 Le plus de points gagne
              </button>
              <button
                type="button"
                onClick={() => setInvertedScoring(true)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                  invertedScoring ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                🔽 Le moins de points gagne
              </button>
            </div>
          </GlassCard>
        </section>
      )}

      {selectedGame?.supportsEndCondition && (
        <section>
          <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">
            {endConditionStepNum}. Fin de partie
          </h2>
          <GlassCard className="flex flex-col gap-2 !py-3">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["none", "♾️ Illimitée"],
                  ["score", "🎯 Score cible"],
                  ["rounds", "🔢 Nb. manches"],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEndConditionType(type)}
                  className={`rounded-xl px-2 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                    endConditionType === type ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {endConditionType !== "none" && (
              <input
                type="number"
                inputMode="numeric"
                value={endConditionValue}
                onChange={(e) => setEndConditionValue(e.target.value)}
                placeholder={endConditionType === "score" ? "Ex. 500" : "Ex. 10"}
                className="mt-1 w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-400"
              />
            )}
          </GlassCard>
        </section>
      )}

      {selectedGame && (
        <section>
          <h2 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wide">
            {playersStepNum}. Joueurs ({selectedGame.minPlayers}–{selectedGame.maxPlayers})
          </h2>

          {(roster.length > 0 || addingToRoster) && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-3 px-1">
              {roster.map((r) => {
                const selected = players.some((p) => p.id === r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRosterPlayer(r.id, r.name, r.photo)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
                  >
                    <PlayerAvatar
                      name={r.name}
                      photo={r.photo}
                      size={56}
                      className={selected ? "ring-4 ring-violet-400" : "opacity-70"}
                    />
                    <span className="text-xs max-w-[4rem] truncate">{r.name}</span>
                  </button>
                );
              })}

              {!addingToRoster ? (
                <button
                  type="button"
                  onClick={() => setAddingToRoster(true)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-black/20 dark:border-white/20 flex items-center justify-center text-xl opacity-60">
                    +
                  </div>
                  <span className="text-xs opacity-60">Nouveau</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <input
                    ref={newRosterPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleNewRosterPhotoSelected(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => newRosterPhotoInputRef.current?.click()}
                    className="cursor-pointer"
                    aria-label="Choisir une photo"
                  >
                    <PlayerAvatar name={newRosterName || "?"} photo={newRosterPhoto} size={56} />
                  </button>
                </div>
              )}
            </div>
          )}

          {addingToRoster && (
            <GlassCard className="flex items-center gap-2 !py-3 mb-3">
              <input
                autoFocus
                value={newRosterName}
                onChange={(e) => setNewRosterName(e.target.value)}
                placeholder="Prénom"
                className="flex-1 rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-400"
              />
              <GlossyButton size="sm" onClick={confirmAddToRoster} disabled={!newRosterName.trim()}>
                Ajouter
              </GlossyButton>
              <button
                type="button"
                onClick={() => {
                  setAddingToRoster(false);
                  setNewRosterName("");
                  setNewRosterPhoto(undefined);
                }}
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-sm cursor-pointer flex-shrink-0"
                aria-label="Annuler"
              >
                ✕
              </button>
            </GlassCard>
          )}

          <GlassCard className="flex flex-col gap-3">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center gap-2 rounded-2xl transition-colors ${
                  needsTeams && player.teamId
                    ? player.teamId === "A"
                      ? "bg-[var(--pastel-mint)]/40"
                      : "bg-[var(--pastel-peach)]/40"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => player.name.trim() && openPhotoPicker(player.id)}
                  className="flex-shrink-0 cursor-pointer disabled:cursor-default"
                  disabled={!player.name.trim()}
                  aria-label="Ajouter une photo"
                >
                  <PlayerAvatar name={player.name || "?"} photo={player.photo} size={40} />
                </button>
                <div className="relative flex-1">
                  <input
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    onFocus={() => setActiveSuggestId(player.id)}
                    onBlur={() => setTimeout(() => setActiveSuggestId(null), 150)}
                    placeholder={`Joueur ${idx + 1}`}
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  {activeSuggestId === player.id &&
                    player.name.trim().length > 0 &&
                    (() => {
                      const query = player.name.trim().toLowerCase();
                      const suggestions = roster.filter(
                        (r) =>
                          r.id !== player.id &&
                          r.name.toLowerCase().startsWith(query) &&
                          !players.some((p) => p.id === r.id)
                      );
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="absolute z-10 mt-1 w-full glass-squircle !rounded-2xl !p-1.5 flex flex-col gap-0.5">
                          {suggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectSuggestion(player.id, s)}
                              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-left"
                            >
                              <PlayerAvatar name={s.name} photo={s.photo} size={28} />
                              <span className="text-sm">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                </div>
                {needsTeams && (
                  <div className="flex gap-1">
                    {(["A", "B"] as const).map((team) => (
                      <button
                        key={team}
                        type="button"
                        onClick={() => updatePlayerTeam(player.id, team)}
                        className={`w-9 h-9 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          player.teamId === team
                            ? team === "A"
                              ? "bg-emerald-400 text-white"
                              : "bg-orange-400 text-white"
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
              <>
                <button
                  type="button"
                  onClick={shuffleTeams}
                  className="self-center text-xs font-medium text-violet-500 cursor-pointer flex items-center gap-1"
                >
                  🔀 Mélanger les équipes
                </button>
                <p className="text-xs opacity-60 text-center">
                  Belote à 4 : formez deux équipes de 2 (A vs B).
                </p>
              </>
            )}
          </GlassCard>

          {needsTeams && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {(["A", "B"] as const).map((team) => {
                const members = players.filter((p) => p.teamId === team && p.name.trim());
                return (
                  <motion.div
                    key={team}
                    layout
                    className={`rounded-2xl p-3 text-center ${
                      team === "A" ? "bg-[var(--pastel-mint)]/50" : "bg-[var(--pastel-peach)]/50"
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                      Équipe {team}
                    </div>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={members.map((m) => m.id).join(",") || "empty"}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm font-medium"
                      >
                        {members.length > 0 ? members.map((m) => m.name).join(" & ") : "—"}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
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
