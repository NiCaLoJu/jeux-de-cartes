import { AuthGuard } from "@/components/AuthGuard";
import { AppHeader } from "@/components/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppHeader />
      <main className="flex-1 px-4 sm:px-6 pb-16">{children}</main>
    </AuthGuard>
  );
}
