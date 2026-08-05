import { AuthGuard } from "@/components/AuthGuard";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <main className="flex-1 px-4 sm:px-6 pb-16 safe-top">{children}</main>
    </AuthGuard>
  );
}
