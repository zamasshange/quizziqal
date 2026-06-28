import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyProgressionEvent } from "@/lib/progression/engine";
import { buildFullProgressionState } from "@/lib/progression/buildState";
import type {
  ProgressionEventPayload,
  ProgressionEventResult,
} from "@/lib/progression/types";
import {
  loadUserProgress,
  persistProgress,
  fetchUserRank,
  syncProfileFromClerk,
} from "@/lib/progression/server";
import { resolveClerkIdentity } from "@/lib/progression/resolveClerkIdentity";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  activityFromProgression,
  emitActivityEvent,
} from "@/lib/platform/activity";
import { tryCrownKnowledgeLegend } from "@/lib/progression/legendCrown";
import { ALL_UNLOCKS } from "@/lib/progression/unlockDefinitions";
import { recordContentPlays } from "@/lib/platform/contentHistoryServer";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
} from "@/lib/userMetadata";

/** POST /api/progression/event — record gameplay progression */
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let payload: ProgressionEventPayload;
  try {
    payload = (await req.json()) as ProgressionEventPayload;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const jar = await cookies();
  const cookieOpts = {
    avatar: jar.get(AVATAR_COOKIE_NAME)?.value,
    onboarded: jar.get(ONBOARDING_COOKIE_NAME)?.value,
  };

  await syncProfileFromClerk(userId, sessionClaims, cookieOpts);

  const raw = await loadUserProgress(userId);
  const result = applyProgressionEvent(raw, payload, { persistLocal: false });

  const identity = await resolveClerkIdentity(userId, sessionClaims, cookieOpts);
  const username = identity?.username ?? "Player";
  const avatarId = identity?.avatarId ?? null;

  const crown = await tryCrownKnowledgeLegend(
    userId,
    username,
    raw.countryCode,
    avatarId,
    raw,
  );

  await persistProgress(
    userId,
    username,
    avatarId,
    raw,
    result.xpEarned,
    payload.type,
    payload.quizCategory,
  );

  if (result.discovery?.isNew) {
    const sb = getSupabaseAdmin();
    if (sb) {
      await sb.from("user_discoveries").upsert(
        {
          user_id: userId,
          term: result.discovery.term,
          category: result.discovery.category,
          discovery_type: result.discovery.discoveryType,
          quiz_id: result.discovery.quizId ?? null,
        },
        { onConflict: "user_id,term" },
      );
    }
  }

  if (payload.term) {
    const contentType =
      result.discovery?.discoveryType ?? payload.quizCategory ?? "general";
    await recordContentPlays(userId, [
      {
        contentId: payload.term,
        contentType,
        category: payload.quizCategory ?? payload.category,
      },
    ]);
  }

  const activity = activityFromProgression({
    username,
    type: payload.type,
    term: payload.term,
    quizCategory: payload.quizCategory,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    badgesUnlocked: result.badgesUnlocked,
    unlocksEarned: result.unlocksEarned,
    missionsCompleted: result.missionsCompleted,
    becameLegend: crown.crowned,
    legendNumber: crown.legendNumber,
    discovery: result.discovery
      ? { term: result.discovery.term, isNew: result.discovery.isNew }
      : undefined,
  });

  if (activity) {
    await emitActivityEvent({
      userId,
      username,
      avatarId,
      countryCode: raw.countryCode,
      eventKind: activity.eventKind,
      message: activity.message,
      emoji: activity.emoji,
      category: payload.quizCategory,
    });
  }

  if (result.unlocksEarned.length > 0) {
    const sb = getSupabaseAdmin();
    if (sb) {
      for (const unlockId of result.unlocksEarned) {
        await sb.from("user_unlocks").upsert(
          { user_id: userId, unlock_id: unlockId, unlock_kind: "auto" },
          { onConflict: "user_id,unlock_id" },
        );
      }
    }
    const firstUnlock = ALL_UNLOCKS.find((u) => u.id === result.unlocksEarned[0]);
    await emitActivityEvent({
      userId,
      username,
      avatarId,
      countryCode: raw.countryCode,
      eventKind: "unlock",
      message: `${username} unlocked ${firstUnlock?.title ?? "new content"}`,
      emoji: firstUnlock?.emoji ?? "🔓",
      category: payload.quizCategory,
    });
  }

  const state = buildFullProgressionState(raw);
  state.rank = await fetchUserRank(raw.xp);

  return NextResponse.json({
    ...result,
    becameLegend: crown.crowned,
    legendNumber: crown.legendNumber,
    state,
  } satisfies ProgressionEventResult);
}
