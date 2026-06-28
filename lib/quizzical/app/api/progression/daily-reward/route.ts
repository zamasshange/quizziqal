import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { applyProgressionEvent } from "@/lib/progression/engine";
import { buildFullProgressionState } from "@/lib/progression/buildState";
import {
  loadUserProgress,
  persistProgress,
  syncProfileFromClerk,
} from "@/lib/progression/server";
import { claimDailyReward, processDailyLogin } from "@/lib/progression/dailyRewards";
import { todayKey } from "@/lib/progression/xp";
import { cookies } from "next/headers";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
} from "@/lib/userMetadata";
import { resolveClerkIdentity } from "@/lib/progression/resolveClerkIdentity";

/** POST /api/progression/daily-reward — claim daily login reward */
export async function POST() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const jar = await cookies();
  await syncProfileFromClerk(userId, sessionClaims, {
    avatar: jar.get(AVATAR_COOKIE_NAME)?.value,
    onboarded: jar.get(ONBOARDING_COOKIE_NAME)?.value,
  });

  const raw = await loadUserProgress(userId);
  const login = processDailyLogin(raw.lastLoginDate, raw.loginStreak, raw.dailyRewardClaimedDate);
  raw.loginStreak = login.loginStreak;
  raw.lastLoginDate = login.lastLoginDate;

  if (raw.dailyRewardClaimedDate === todayKey()) {
    return NextResponse.json({ error: "Already claimed today." }, { status: 400 });
  }

  const reward = claimDailyReward(raw.loginStreak);
  raw.xp += reward.xp;
  raw.coins += reward.coins;
  raw.dailyRewardClaimedDate = todayKey();

  const identity = await resolveClerkIdentity(userId, sessionClaims, {
    avatar: jar.get(AVATAR_COOKIE_NAME)?.value,
    onboarded: jar.get(ONBOARDING_COOKIE_NAME)?.value,
  });

  await persistProgress(
    userId,
    identity?.username ?? "Player",
    identity?.avatarId ?? null,
    raw,
    reward.xp,
    "daily_reward",
  );

  return NextResponse.json({
    reward,
    state: buildFullProgressionState(raw),
  });
}
