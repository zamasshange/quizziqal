"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MicroFloat from "@/components/atmosphere/MicroFloat";
import { useProgression } from "@/lib/progression/client";
import { xpToNextLevel } from "@/lib/progression/xp";
import AppIcon, { type AppIconName } from "@/components/icons/AppIcon";
import CountryFlag from "@/components/CountryFlag";
import { getCountry } from "@/lib/progression/countries";
import NextUnlockWidget from "./NextUnlockWidget";
import DailyRewardWidget from "./DailyRewardWidget";
import KingdomPicker from "./KingdomPicker";

export default function ExplorerHub() {
  const { state, loaded } = useProgression();
  if (!loaded) return null;

  const xpBar = xpToNextLevel(state.xp);
  const country = getCountry(state.countryCode);
  const topMission = state.missions.find((m) => !m.completed);
  const recentDiscovery = state.discoveries[0];

  return (
    <section className="mt-5 md:mt-7">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-ink">🧭 Become a Knowledge Explorer</h2>
          <p className="text-sm font-bold text-ink/55">
            Learn, discover, compete, and level up across every quiz.
          </p>
        </div>
        <Link
          href="/knowledge-atlas"
          className="text-sm font-extrabold text-grass hover:underline"
        >
          World Knowledge Atlas →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d] sm:col-span-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
                Knowledge Explorer
              </p>
              <p className="font-display text-2xl font-black text-ink">
                {state.knowledgeRankEmoji ?? "🧭"} Level {state.level}{" "}
                <span className="text-lg font-extrabold text-grass">
                  {state.knowledgeRank ?? state.title}
                </span>
              </p>
              {country && (
                <p className="mt-0.5 flex items-center gap-2 text-sm font-bold text-ink/55">
                  <CountryFlag code={state.countryCode} width={24} />
                  {country.name}
                  {state.rank ? ` · Rank #${state.rank}` : ""}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold text-grass">
                {state.xp.toLocaleString()} XP
              </p>
              <p className="text-xs font-bold text-ink/45">
                🪙 {state.coins} coins
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-extrabold uppercase text-ink/45">
              <span>Progress to level {xpBar.level + 1}</span>
              <span>
                {xpBar.current}/{xpBar.needed} XP
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
              <motion.div
                className="h-full bg-grass"
                initial={{ width: 0 }}
                animate={{ width: `${xpBar.progress * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <StatCard
          icon="flame"
          label="Streak"
          value={`${state.currentStreak} day${state.currentStreak === 1 ? "" : "s"}`}
          sub={`Best: ${state.longestStreak}`}
          floatDelay={0.1}
        />
        <StatCard
          icon="telescope"
          label="Atlas"
          value={`${state.atlas?.overallPct ?? 0}%`}
          sub={`${state.discoveryCount} discoveries`}
          floatDelay={0.2}
        />

        {state.season && (
          <StatCard
            icon="trophy"
            label={state.season.title}
            value={`${state.season.daysRemaining}d left`}
            sub="Season XP race"
            floatDelay={0.25}
          />
        )}

        <div className="sm:col-span-2">
          <DailyRewardWidget />
        </div>

        <div className="sm:col-span-2">
          <KingdomPicker />
        </div>

        <div className="sm:col-span-2">
          <NextUnlockWidget />
        </div>

        {topMission && (
          <div className="rounded-2xl border-4 border-ink bg-lime/25 p-4 shadow-[0_4px_0_0_#0d0d0d] sm:col-span-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
              Daily mission
            </p>
            <p className="font-extrabold text-ink">
              {topMission.emoji} {topMission.label}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full border border-ink/30 bg-white">
              <div
                className="h-full bg-grass transition-all"
                style={{
                  width: `${Math.min(100, (topMission.progress / topMission.target) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs font-bold text-ink/50">
              {topMission.progress}/{topMission.target} · +{topMission.rewardXp} XP reward
            </p>
          </div>
        )}

        {recentDiscovery && (
          <div className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d] sm:col-span-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
              Latest discovery
            </p>
            <p className="font-extrabold text-ink">✓ {recentDiscovery.term}</p>
            <p className="text-xs font-bold text-ink/45">{recentDiscovery.category}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  floatDelay = 0,
}: {
  icon: AppIconName;
  label: string;
  value: string;
  sub: string;
  floatDelay?: number;
}) {
  return (
    <MicroFloat delay={floatDelay} y={4}>
      <div className="rounded-2xl border-4 border-ink bg-white p-4 shadow-[0_4px_0_0_#0d0d0d]">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink/45">
          <AppIcon name={icon} size={14} className="text-grass" />
          {label}
        </p>
        <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
        <p className="text-xs font-bold text-ink/45">{sub}</p>
      </div>
    </MicroFloat>
  );
}
