"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AppProviders({ children }: { children: ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
