"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { GameRecord, deleteGameRecord, listGameRecords } from "@/lib/history";
import { GameLibraryCarousel } from "@/components/game/GameLibraryCarousel";
import { ActiveGames } from "@/components/game/ActiveGames";
import { HistoryTimeline } from "@/components/game/HistoryTimeline";
import { StatsPanel } from "@/components/game/StatsPanel";
import { GlossyButton } from "@/components/ui/GlossyButton";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    listGameRecords(user.uid)
      .then(setRecords)
      .finally(() => setLoadingHistory(false));
  }, [user]);

  function handleDeleteRecord(recordId: string) {
    if (!user) return;
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    deleteGameRecord(user.uid, recordId).catch(() => {
      // Best-effort: reload from source of truth if the delete failed server-side.
      listGameRecords(user.uid).then(setRecords);
    });
  }

  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-10 pt-4">
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-shadow-soft">
            Salut {user?.displayName?.split(" ")[0] ?? ""} 👋
          </h1>
          <p className="opacity-70 text-sm mt-1">Prêt·e pour une nouvelle soirée jeux ?</p>
        </div>
        <Link href="/game/new">
          <GlossyButton size="lg" className="w-full sm:w-auto">
            ✨ Nouvelle partie
          </GlossyButton>
        </Link>
      </section>

      <ActiveGames />

      <section>
        <h2 className="text-lg font-semibold mb-3">Bibliothèque de jeux</h2>
        <GameLibraryCarousel />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Mes statistiques</h2>
        {!loadingHistory && user && <StatsPanel records={records} playerName={user.displayName} />}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Historique des parties</h2>
        {loadingHistory ? (
          <div className="opacity-60 text-sm">Chargement de l&apos;historique…</div>
        ) : (
          <HistoryTimeline records={records} onDelete={handleDeleteRecord} />
        )}
      </section>
    </div>
  );
}
