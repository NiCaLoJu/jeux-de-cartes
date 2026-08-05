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
    statusBarStyle: "default",
    title: "Score Board",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d9c9f7",
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
