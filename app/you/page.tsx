"use client";

import Link from "next/link";
import SonkeAppShell from "@/components/skin/SonkeAppShell";
import { ContentModule, SectionHeading } from "@/components/skin/content";

export default function YouPage() {
  return (
    <SonkeAppShell pageTitle="You">
      <ContentModule panel className="text-center">
        <div
          className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black text-white"
          style={{ background: "#2638c4" }}
        >
          G
        </div>
        <h1 className="sonke-game-title" style={{ fontSize: "1.75rem" }}>
          Guest player
        </h1>
        <p className="sonke-game-tagline">Playing free — no account needed</p>
      </ContentModule>

      <ContentModule>
        <ul className="sonke-facts-grid">
          {[
            { label: "Games", value: "—" },
            { label: "Streak", value: "0" },
            { label: "Best", value: "—" },
          ].map((stat) => (
            <li key={stat.label} className="sonke-fact-card text-center">
              <p className="sonke-section-title" style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                {stat.value}
              </p>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}>{stat.label}</p>
            </li>
          ))}
        </ul>
      </ContentModule>

      <ContentModule panel>
        <p className="sonke-section-lead text-center">
          Sign-in coming soon — your scores &amp; streaks will live here 🏆
        </p>
      </ContentModule>

      <ContentModule>
        <SectionHeading>Quick links</SectionHeading>
        <div className="sonke-play-actions">
          <Link href="/home" className="sonke-btn sonke-btn-play">
            ▶ Play a game
          </Link>
          <Link href="/library" className="sonke-btn sonke-btn-secondary">
            📚 Library
          </Link>
        </div>
      </ContentModule>
    </SonkeAppShell>
  );
}
