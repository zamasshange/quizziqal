import { flagUrlFromCode } from "@/lib/flagUrl";

/** Supported countries for representation on profiles and leaderboards. */

export const DEFAULT_COUNTRY = "ZA";

export type CountryOption = {
  code: string;
  name: string;
  /** Emoji fallback when images fail to load. */
  flag: string;
};

export const COUNTRIES: CountryOption[] = [
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
];

export function getCountry(code: string): CountryOption | undefined {
  const normalized = code.trim().toUpperCase();
  return COUNTRIES.find((c) => c.code === normalized);
}

export function normalizeCountryCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  return COUNTRIES.some((c) => c.code === normalized) ? normalized : null;
}

/** Self-hosted PNG in /public/flags (reliable on all hosts). */
export function flagImageUrl(code: string, _width = 40): string {
  const iso2 = normalizeCountryCode(code) ?? DEFAULT_COUNTRY;
  return flagUrlFromCode(iso2);
}

const TIMEZONE_COUNTRY: Record<string, string> = {
  "Africa/Johannesburg": "ZA",
  "Africa/Harare": "ZW",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Accra": "GH",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "Europe/London": "GB",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Asia/Kolkata": "IN",
  "Asia/Tokyo": "JP",
  "Australia/Sydney": "AU",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
};

function detectFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code = TIMEZONE_COUNTRY[tz];
    return code && COUNTRIES.some((c) => c.code === code) ? code : null;
  } catch {
    return null;
  }
}

export function detectCountryCode(): string {
  if (typeof navigator === "undefined") return DEFAULT_COUNTRY;

  const langs = [
    navigator.language,
    ...(navigator.languages ?? []),
  ];
  for (const lang of langs) {
    const part = lang.split("-")[1]?.toUpperCase();
    if (part && COUNTRIES.some((c) => c.code === part)) return part;
  }

  const fromTz = detectFromTimezone();
  if (fromTz) return fromTz;

  return DEFAULT_COUNTRY;
}
