import { todayKey } from "./xp";

export type DailyRewardTier = {
  day: number;
  xp: number;
  coins: number;
  emoji: string;
  label: string;
};

export const DAILY_LOGIN_REWARDS: DailyRewardTier[] = [
  { day: 1, xp: 25, coins: 5, emoji: "🎁", label: "Welcome back" },
  { day: 2, xp: 35, coins: 8, emoji: "✨", label: "Day 2 bonus" },
  { day: 3, xp: 50, coins: 12, emoji: "🔥", label: "Building momentum" },
  { day: 4, xp: 65, coins: 15, emoji: "⭐", label: "Explorer bonus" },
  { day: 5, xp: 80, coins: 20, emoji: "🏅", label: "Weekly warrior" },
  { day: 6, xp: 100, coins: 25, emoji: "💎", label: "Dedicated learner" },
  { day: 7, xp: 150, coins: 50, emoji: "👑", label: "Week champion" },
];

export type DailyRewardStatus = {
  loginStreak: number;
  canClaim: boolean;
  claimedToday: boolean;
  todayReward: DailyRewardTier;
  nextReward: DailyRewardTier | null;
};

export function processDailyLogin(
  lastLoginDate: string | null,
  loginStreak: number,
  claimedDate: string | null,
): { loginStreak: number; lastLoginDate: string } {
  const today = todayKey();
  if (lastLoginDate === today) {
    return { loginStreak, lastLoginDate: today };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  let streak = 1;
  if (lastLoginDate === yKey) {
    streak = loginStreak + 1;
  }

  return { loginStreak: streak, lastLoginDate: today };
}

export function buildDailyRewardStatus(
  loginStreak: number,
  claimedDate: string | null,
): DailyRewardStatus {
  const today = todayKey();
  const claimedToday = claimedDate === today;
  const dayIndex = Math.min(Math.max(loginStreak, 1), 7) - 1;
  const todayReward = DAILY_LOGIN_REWARDS[dayIndex] ?? DAILY_LOGIN_REWARDS[0]!;
  const nextReward =
    dayIndex < DAILY_LOGIN_REWARDS.length - 1
      ? DAILY_LOGIN_REWARDS[dayIndex + 1]!
      : DAILY_LOGIN_REWARDS[0]!;

  return {
    loginStreak,
    canClaim: !claimedToday && loginStreak > 0,
    claimedToday,
    todayReward,
    nextReward,
  };
}

export function claimDailyReward(loginStreak: number): {
  xp: number;
  coins: number;
  emoji: string;
  label: string;
} {
  const dayIndex = Math.min(Math.max(loginStreak, 1), 7) - 1;
  const tier = DAILY_LOGIN_REWARDS[dayIndex] ?? DAILY_LOGIN_REWARDS[0]!;
  return { xp: tier.xp, coins: tier.coins, emoji: tier.emoji, label: tier.label };
}
