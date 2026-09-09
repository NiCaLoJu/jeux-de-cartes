"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRosterStore } from "@/store/rosterStore";
import { initAppearance } from "@/lib/appearance";

export function AppProviders({ children }: { children: ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const loadRoster = useRosterStore((s) => s.loadRoster);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    initAppearance();
  }, []);

  useEffect(() => {
    if (user) loadRoster(user.uid);
  }, [user, loadRoster]);

  return <>{children}</>;
}
