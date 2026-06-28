"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAvatarId } from "@/lib/avatars";
import { persistProgress } from "@/lib/progression/server";
import { createEmptyRaw } from "@/lib/progression/defaults";
import { DEFAULT_COUNTRY, normalizeCountryCode } from "@/lib/progression/countries";
import {
  AVATAR_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
} from "@/lib/userMetadata";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function completeOnboarding(
  username: string,
  avatarId: string,
  countryCode = DEFAULT_COUNTRY,
): Promise<never> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in to finish setup.");
  }

  const normalized = normalizeUsername(username);
  if (!USERNAME_RE.test(normalized)) {
    throw new Error(
      "Username must be 3–20 characters: lowercase letters, numbers, or underscores.",
    );
  }

  if (!isValidAvatarId(avatarId)) {
    throw new Error("Invalid avatar selection.");
  }

  const client = await clerkClient();

  let user;
  try {
    user = await client.users.getUser(userId);
  } catch {
    throw new Error("Could not load your account. Please try again.");
  }

  try {
    await client.users.updateUser(userId, {
      username: normalized,
      publicMetadata: {
        ...(user.publicMetadata as Record<string, unknown>),
        username: normalized,
        avatarId,
        onboardingComplete: true,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error && /username/i.test(err.message)
        ? "That username is taken. Try another one."
        : "Could not save your profile. Please try again.";
    throw new Error(message);
  }

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };

  cookieStore.set(AVATAR_COOKIE_NAME, avatarId, cookieOpts);
  cookieStore.set(ONBOARDING_COOKIE_NAME, "1", cookieOpts);

  const raw = createEmptyRaw(
    normalizeCountryCode(countryCode) ?? DEFAULT_COUNTRY,
  );
  await persistProgress(userId, normalized, avatarId, raw, 0, "onboarding");

  redirect("/");
}
