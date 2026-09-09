import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PastelBackground } from "@/components/ui/PastelBackground";
import { AppProviders } from "@/components/AppProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Score Board Premium",
  description: "Le tableau de score des soirées jeux — glossy, animé, prêt pour le cast TV.",
  appleWebApp: {
    capable: true,
    // "black-translucent" makes the status bar transparent so the page draws
    // edge-to-edge under it — required for env(safe-area-inset-top) to be
    // honored at all in standalone mode. With "default", iOS was leaving the
    // status bar/Dynamic Island area opaque over our own content instead of
    // reserving space for it, cutting the page off right below it.
    statusBarStyle: "black-translucent",
    title: "Score Board",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f5f5f7",
  viewportFit: "cover",
};

const THEME_INIT_SCRIPT = `try {
  var m = localStorage.getItem("sbp_theme");
  if (m === "light" || m === "dark") document.documentElement.setAttribute("data-theme", m);
  var a = localStorage.getItem("sbp_accent");
  var presets = { blue: ["#3b82f6","#60a5fa","#2563eb"], emerald: ["#10b981","#34d399","#059669"], orange: ["#f97316","#fb923c","#ea580c"], rose: ["#f43f5e","#fb7185","#e11d48"], graphite: ["#4b5563","#9ca3af","#1f2937"] };
  if (a && presets[a]) {
    var s = document.documentElement.style;
    s.setProperty("--accent", presets[a][0]);
    s.setProperty("--accent-soft", presets[a][1]);
    s.setProperty("--accent-strong", presets[a][2]);
  }
} catch (e) {}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PastelBackground />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
