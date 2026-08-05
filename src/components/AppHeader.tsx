"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const { user, signOutUser } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 safe-top-header bg-[var(--background)]/70 backdrop-blur-md">
      <div className="mx-auto max-w-5xl flex items-center justify-between py-2">
        <Link href="/dashboard" className="flex items-center gap-1.5 font-semibold text-sm opacity-80">
          <span className="text-lg">🏆</span>
          <span className="hidden sm:inline">Score Board</span>
        </Link>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="flex items-center gap-1.5 text-[11px] opacity-30 hover:opacity-70 transition-opacity cursor-pointer py-1"
          aria-label={user?.displayName ? `Déconnexion (${user.displayName})` : "Déconnexion"}
        >
          {user?.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
          )}
          Déconnexion
        </button>
      </div>
    </header>
  );
}
