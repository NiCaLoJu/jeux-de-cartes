"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { GlossyButton } from "@/components/ui/GlossyButton";

export function AppHeader() {
  const { user, signOutUser } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 py-4">
      <div className="mx-auto max-w-5xl glass-squircle !rounded-3xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🏆</span>
          <span className="hidden sm:inline">Score Board Premium</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline text-sm opacity-70 max-w-[10rem] truncate">
              {user.displayName}
            </span>
          )}
          <GlossyButton size="sm" variant="ghost" onClick={() => signOutUser()}>
            Déconnexion
          </GlossyButton>
        </div>
      </div>
    </header>
  );
}
