import { getCountry } from "./countries";
import { levelFromXp } from "./xp";

export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarId: string | null;
  xp: number;
  level: number;
  countryCode: string;
  countryName: string;
  title: string;
};

export type LeaderboardScope =
  | "global"
  | "weekly"
  | "monthly"
  | "country"
  | "category";

export const LEADERBOARD_CATEGORIES = [
  { slug: "geography", label: "Geography" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Movies" },
  { slug: "history", label: "History" },
  { slug: "science-and-nature", label: "Science" },
] as const;

export const LEADERBOARD_COUNTRIES = [
  { code: "ZA", label: "South Africa" },
  { code: "ZW", label: "Zimbabwe" },
  { code: "NG", label: "Nigeria" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "KE", label: "Kenya" },
  { code: "GH", label: "Ghana" },
  { code: "IN", label: "India" },
  { code: "AU", label: "Australia" },
  { code: "CA", label: "Canada" },
] as const;

type ProgressRow = {
  username: string;
  avatar_id: string | null;
  xp: number;
  level?: number;
  country_code: string;
};

export function rowToLeaderboardEntry(
  row: ProgressRow,
  rank: number,
  xpOverride?: number,
): LeaderboardEntry {
  const xp = xpOverride ?? row.xp;
  const countryCode = row.country_code;
  return {
    rank,
    username: row.username,
    avatarId: row.avatar_id,
    xp,
    level: row.level ?? levelFromXp(xp),
    countryCode,
    countryName: getCountry(countryCode)?.name ?? countryCode,
    title: "Knowledge Explorer",
  };
}
