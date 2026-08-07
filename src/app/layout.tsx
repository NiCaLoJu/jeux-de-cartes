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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PastelBackground />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
