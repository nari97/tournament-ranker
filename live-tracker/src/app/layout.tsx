import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup 2026 Live Tracker",
  description: "Live Sweepstakes Leaderboard and Matchday Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-slate-200 selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}
