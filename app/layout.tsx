import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/components/skin/pbs-theme.css";
import "@/components/skin/pbs-home-theme.css";
import "@/components/skin/game-page.css";
import "@/components/skin/sonke-shell.css";
import "@/components/skin/sonke-play-shell.css";
import SonkeSkinHead from "@/components/skin/SonkeSkinHead";

export const metadata: Metadata = {
  title: "Quizziqal | Free quiz games",
  description:
    "Play free interactive quizzes — no codes, no signup needed.",
  icons: {
    icon: "/sonke-favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quizziqal",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <SonkeSkinHead />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
