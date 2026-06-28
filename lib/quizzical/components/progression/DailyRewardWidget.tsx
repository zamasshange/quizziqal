"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useProgression } from "@/lib/progression/client";
import {
  claimDailyReward,
  DAILY_LOGIN_REWARDS,
  processDailyLogin,
} from "@/lib/progression/dailyRewards";
import { loadRawState, saveRawState } from "@/lib/progression/engine";
import { todayKey } from "@/lib/progression/xp";

export default function DailyRewardWidget() {
  const { isSignedIn } = useUser();
  const { state, loaded, refresh } = useProgression();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!loaded || !state.dailyReward) return null;

  const dr = state.dailyReward;
  const showClaim = dr.canClaim && !claimed && !dr.claimedToday;

  async function handleClaim() {
    setClaiming(true);
    try {
      if (isSignedIn) {
        const res = await fetch("/api/progression/daily-reward", { method: "POST" });
        if (res.ok) {
          setClaimed(true);
          await refresh();
        }
        return;
      }

      const raw = loadRawState();
      const login = processDailyLogin(
        raw.lastLoginDate,
        raw.loginStreak,
        raw.dailyRewardClaimedDate,
      );
      raw.loginStreak = login.loginStreak;
      raw.lastLoginDate = login.lastLoginDate;

      if (raw.dailyRewardClaimedDate !== todayKey()) {
        const reward = claimDailyReward(raw.loginStreak);
        raw.xp += reward.xp;
        raw.coins += reward.coins;
        raw.dailyRewardClaimedDate = todayKey();
        saveRawState(raw);
        setClaimed(true);
        await refresh();
      }
    } finally {
      setClaiming(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-4 border-ink bg-gradient-to-br from-sky/20 via-white to-lime/20 p-4 shadow-[0_4px_0_0_#0d0d0d]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Daily login reward
          </p>
          <p className="font-display text-lg font-black text-ink">
            {dr.todayReward.emoji} Day {Math.min(dr.loginStreak, 7)} of 7
          </p>
          <p className="text-sm font-bold text-ink/60">{dr.todayReward.label}</p>
          <p className="mt-1 text-xs font-extrabold text-grass">
            +{dr.todayReward.xp} XP · +{dr.todayReward.coins} coins
          </p>
        </div>
        {showClaim ? (
          <button
            type="button"
            onClick={() => void handleClaim()}
            disabled={claiming}
            className="shrink-0 rounded-xl border-2 border-ink bg-grass px-4 py-2 text-sm font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {claiming ? "…" : "Claim"}
          </button>
        ) : (
          <span className="shrink-0 rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs font-extrabold text-ink/55">
            {dr.claimedToday || claimed ? "✓ Claimed" : "Play to unlock"}
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-1">
        {DAILY_LOGIN_REWARDS.map((tier, i) => {
          const done =
            i < Math.min(dr.loginStreak, 7) &&
            (dr.claimedToday || claimed || i < dr.loginStreak - 1);
          const current = i === Math.min(dr.loginStreak, 7) - 1;
          return (
            <div
              key={tier.day}
              className={`h-2 flex-1 rounded-full border border-ink/30 ${
                done ? "bg-grass" : current ? "bg-sky" : "bg-cream"
              }`}
              title={`Day ${tier.day}: ${tier.label}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
