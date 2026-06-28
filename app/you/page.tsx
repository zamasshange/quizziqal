"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function YouPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]">
        <Header searchQuery="" onSearchChange={() => {}} />

        <main className="flex-1 p-3 pb-24 lg:p-8 lg:pb-8">
          <section className="mx-auto max-w-md">
            <div className="mb-5 overflow-hidden rounded-2xl border-2 border-purple-100 bg-white p-5 text-center shadow-md">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--kahoot-purple)] text-2xl font-extrabold text-white">
                G
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Guest player</h1>
              <p className="mt-1 text-sm text-gray-500">
                Playing free — no account needed
              </p>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                { label: "Games", value: "—" },
                { label: "Streak", value: "0" },
                { label: "Best", value: "—" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border-2 border-gray-100 bg-white p-3 text-center"
                >
                  <p className="text-lg font-extrabold text-[var(--kahoot-purple)]">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="mb-4 rounded-xl bg-purple-50 px-4 py-3 text-center text-xs font-semibold text-purple-700">
              Sign-in coming soon — your scores &amp; streaks will live here 🏆
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/home"
                className="game-pill rounded-xl bg-[var(--kahoot-green)] py-3 text-center text-sm font-extrabold text-white"
              >
                ▶ Play a game
              </Link>
              <Link
                href="/library"
                className="game-pill rounded-xl border-2 border-gray-200 bg-white py-3 text-center text-sm font-extrabold text-gray-700"
              >
                📚 Browse library
              </Link>
            </div>
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
