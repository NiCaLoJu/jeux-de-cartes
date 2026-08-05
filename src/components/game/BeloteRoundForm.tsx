"use client";

import { useMemo, useState } from "react";
import { Player } from "@/lib/engine";
import {
  BELOTE_SEQUENCE_ANNONCES,
  BELOTE_TOTAL_POINTS,
  BeloteContractType,
  BeloteMode,
  BeloteRoundInput,
  BeloteTeam,
  isDedans,
} from "@/lib/engine/belote";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";

const CONTRACT_TYPES: { id: BeloteContractType; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "tout-atout", label: "Tout Atout" },
  { id: "sans-atout", label: "Sans Atout" },
];

const SEQUENCE_CHIPS: { id: keyof typeof BELOTE_SEQUENCE_ANNONCES; label: string }[] = [
  { id: "tierce", label: `Tierce +${BELOTE_SEQUENCE_ANNONCES.tierce}` },
  { id: "quarte", label: `Quarte +${BELOTE_SEQUENCE_ANNONCES.quarte}` },
  { id: "quinte", label: `Quinte +${BELOTE_SEQUENCE_ANNONCES.quinte}` },
];

export function BeloteRoundForm({
  players,
  onSubmit,
}: {
  players: Player[];
  onSubmit: (
    input: BeloteRoundInput,
    attackTeamPlayerIds: string[],
    defenseTeamPlayerIds: string[]
  ) => void;
}) {
  const hasFixedTeams = players.some((p) => p.teamId);

  const teamA = players.filter((p) => p.teamId === "A");
  const teamB = players.filter((p) => p.teamId === "B");

  const [attackSide, setAttackSide] = useState<BeloteTeam>("A");
  const [preneurId, setPreneurId] = useState(players[0]?.id ?? "");
  const [mode, setMode] = useState<BeloteMode>("normal");
  const [contractType, setContractType] = useState<BeloteContractType>("normal");
  const [attackScore, setAttackScore] = useState("100");
  const [annonceAttack, setAnnonceAttack] = useState("");
  const [annonceDefense, setAnnonceDefense] = useState("");
  const [beloteSide, setBeloteSide] = useState<"none" | "attack" | "defense">("none");

  const attackTeamPlayerIds = hasFixedTeams
    ? (attackSide === "A" ? teamA : teamB).map((p) => p.id)
    : [preneurId];
  const defenseTeamPlayerIds = hasFixedTeams
    ? (attackSide === "A" ? teamB : teamA).map((p) => p.id)
    : players.filter((p) => p.id !== preneurId).map((p) => p.id);

  const totalPoints = BELOTE_TOTAL_POINTS[contractType];
  const attackScoreNumber = Number(attackScore || 0);
  const suggestDedans = mode === "normal" && isDedans(attackScoreNumber, contractType);
  const liveDefenseScore = useMemo(() => {
    if (mode === "capot") return 0;
    if (mode === "dedans") return totalPoints;
    return totalPoints - Math.max(0, Math.min(totalPoints, attackScoreNumber));
  }, [mode, attackScoreNumber, totalPoints]);

  function addAnnonce(side: "attack" | "defense", value: number) {
    if (side === "attack") setAnnonceAttack((prev) => String(Number(prev || 0) + value));
    else setAnnonceDefense((prev) => String(Number(prev || 0) + value));
  }

  function handleSubmit() {
    const input: BeloteRoundInput = {
      attackingTeam: "A",
      attackScore: attackScoreNumber,
      mode,
      contractType,
      annonces: [
        ...(annonceAttack ? [{ team: "A" as const, value: Number(annonceAttack) }] : []),
        ...(annonceDefense ? [{ team: "B" as const, value: Number(annonceDefense) }] : []),
      ],
      beloteTeam: beloteSide === "none" ? null : beloteSide === "attack" ? "A" : "B",
    };
    onSubmit(input, attackTeamPlayerIds, defenseTeamPlayerIds);
    setAttackScore("100");
    setAnnonceAttack("");
    setAnnonceDefense("");
    setBeloteSide("none");
    setMode("normal");
    setContractType("normal");
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm opacity-70 uppercase tracking-wide">Nouvelle donne</h3>

      {hasFixedTeams ? (
        <div>
          <label className="text-xs opacity-60 block mb-1">Équipe qui attaque</label>
          <div className="flex gap-2">
            <TeamButton
              active={attackSide === "A"}
              label={`A · ${teamA.map((p) => p.name).join(" & ")}`}
              onClick={() => setAttackSide("A")}
            />
            <TeamButton
              active={attackSide === "B"}
              label={`B · ${teamB.map((p) => p.name).join(" & ")}`}
              onClick={() => setAttackSide("B")}
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs opacity-60 block mb-1">Preneur</label>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <TeamButton key={p.id} active={preneurId === p.id} label={p.name} onClick={() => setPreneurId(p.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs opacity-60 block mb-1">Contrat</label>
        <div className="grid grid-cols-3 gap-2">
          {CONTRACT_TYPES.map((c) => (
            <ModeButton
              key={c.id}
              active={contractType === c.id}
              label={c.label}
              onClick={() => setContractType(c.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs opacity-60 block mb-1">Résultat</label>
        <div className="grid grid-cols-3 gap-2">
          <ModeButton active={mode === "normal"} label="Normal" onClick={() => setMode("normal")} />
          <ModeButton active={mode === "dedans"} label="Dedans" onClick={() => setMode("dedans")} />
          <ModeButton active={mode === "capot"} label="Capot" onClick={() => setMode("capot")} />
        </div>
      </div>

      {mode === "normal" && (
        <div>
          <label className="text-xs opacity-60 block mb-1">
            Score de l&apos;attaque <span className="opacity-50">(/ {totalPoints})</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={attackScore}
            onChange={(e) => setAttackScore(e.target.value)}
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="opacity-60">Défense (auto) : {liveDefenseScore}</span>
            {suggestDedans && (
              <button
                type="button"
                onClick={() => setMode("dedans")}
                className="text-rose-500 font-medium cursor-pointer"
              >
                Chute → appliquer &quot;Dedans&quot; ?
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs opacity-60 block mb-1">Annonces attaque</label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {SEQUENCE_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => addAnnonce("attack", BELOTE_SEQUENCE_ANNONCES[chip.id])}
                className="rounded-lg px-2 py-1 text-xs font-medium cursor-pointer bg-black/5 dark:bg-white/10"
              >
                {chip.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={annonceAttack}
            onChange={(e) => setAnnonceAttack(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-3 outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <label className="text-xs opacity-60 block mb-1">Annonces défense</label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {SEQUENCE_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => addAnnonce("defense", BELOTE_SEQUENCE_ANNONCES[chip.id])}
                className="rounded-lg px-2 py-1 text-xs font-medium cursor-pointer bg-black/5 dark:bg-white/10"
              >
                {chip.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={annonceDefense}
            onChange={(e) => setAnnonceDefense(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-3 outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      <div>
        <label className="text-xs opacity-60 block mb-1">Belote / Rebelote (+20)</label>
        <div className="grid grid-cols-3 gap-2">
          <ModeButton active={beloteSide === "none"} label="—" onClick={() => setBeloteSide("none")} />
          <ModeButton active={beloteSide === "attack"} label="Attaque" onClick={() => setBeloteSide("attack")} />
          <ModeButton active={beloteSide === "defense"} label="Défense" onClick={() => setBeloteSide("defense")} />
        </div>
      </div>

      <GlossyButton size="lg" onClick={handleSubmit} className="w-full">
        ✅ Valider la donne
      </GlossyButton>
    </GlassCard>
  );
}

function TeamButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
        active ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function ModeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
        active ? "bg-violet-500 text-white" : "bg-black/5 dark:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
