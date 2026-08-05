"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlossyButton } from "@/components/ui/GlossyButton";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, mode, error, signInWithGoogle, signInWithEmail, signUpWithEmail, clearError } =
    useAuthStore();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (tab === "signin") {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password, displayName);
    }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-shadow-soft">Score Board Premium</h1>
          <p className="text-sm opacity-70 mt-1">
            Le compteur de points glossy pour vos soirées jeux.
          </p>
        </div>

        <GlassCard>
          {mode === "local" && (
            <div className="mb-4 rounded-2xl bg-amber-100/60 dark:bg-amber-300/10 border border-amber-300/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              Mode démo local — Firebase n&apos;est pas configuré, vos données restent sur cet
              appareil.
            </div>
          )}

          <GlossyButton
            type="button"
            variant="ghost"
            size="lg"
            className="w-full flex items-center justify-center gap-3 mb-4"
            onClick={() => signInWithGoogle()}
          >
            <GoogleIcon />
            Continuer avec Google
          </GlossyButton>

          <div className="flex items-center gap-3 my-4 opacity-50 text-xs">
            <div className="h-px flex-1 bg-current" />
            ou
            <div className="h-px flex-1 bg-current" />
          </div>

          <div className="flex gap-2 mb-4 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  clearError();
                }}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors cursor-pointer ${
                  tab === t ? "bg-white/80 dark:bg-white/15 shadow-sm" : "opacity-60"
                }`}
              >
                {t === "signin" ? "Connexion" : "Créer un compte"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && (
              <input
                type="text"
                placeholder="Nom affiché"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="password"
              required
              minLength={mode === "firebase" ? 6 : undefined}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
            />

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <GlossyButton type="submit" size="lg" className="w-full" disabled={submitting}>
              {tab === "signin" ? "Se connecter" : "Créer mon compte"}
            </GlossyButton>
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.5 35.1 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.9 39.9 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41.5 35.6 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
