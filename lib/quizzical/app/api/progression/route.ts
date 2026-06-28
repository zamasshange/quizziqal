import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildFullProgressionState } from "@/lib/progression/buildState";
import {
  fetchUserRank,
  loadUserProgress,
  persistProgress,
  syncProfileFromClerk,
} from "@/lib/progression/server";
import { resolveClerkIdentity } from "@/lib/progression/resolveClerkIdentity";
import { isSupabaseConfigured } from "@/lib/supabase";
import { normalizeCountryCode } from "@/lib/progression/countries";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
} from "@/lib/userMetadata";
import type { ProgressionState } from "@/lib/progression/types";

async function onboardingCookies() {
  const jar = await cookies();
  return {
    avatar: jar.get(AVATAR_COOKIE_NAME)?.value,
    onboarded: jar.get(ONBOARDING_COOKIE_NAME)?.value,
  };
}

/** GET /api/progression — full explorer state */
export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    await syncProfileFromClerk(userId, sessionClaims, await onboardingCookies());
  }

  const raw = await loadUserProgress(userId);
  const state = buildFullProgressionState(raw);

  if (isSupabaseConfigured()) {
    state.rank = await fetchUserRank(raw.xp);
  }

  return NextResponse.json(state satisfies ProgressionState);
}

/** PATCH /api/progression — update country */
export async function PATCH(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await req.json()) as { countryCode?: string };
  const raw = await loadUserProgress(userId);
  if (body.countryCode) {
    const code = normalizeCountryCode(body.countryCode);
    if (code) raw.countryCode = code;
  }

  const identity = await resolveClerkIdentity(
    userId,
    sessionClaims,
    await onboardingCookies(),
  );

  await persistProgress(
    userId,
    identity?.username ?? "Player",
    identity?.avatarId ?? null,
    raw,
    0,
    "profile_update",
  );

  return NextResponse.json(buildFullProgressionState(raw));
}
