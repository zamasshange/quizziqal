"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidAvatarId } from "@/lib/avatars";
import { DEFAULT_COUNTRY, normalizeCountryCode } from "@/lib/progression/countries";
import {
  loadUserProgress,
  persistProgress,
} from "@/lib/progression/server";
import { AVATAR_COOKIE_NAME } from "@/lib/userMetadata";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const NAME_RE = /^[\p{L}\p{M}'\-\s.]{1,50}$/u;

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export type UpdateAccountResult =
  | { success: true }
  | { success: false; error: string };

export async function updateAccountProfile(data: {
  username: string;
  firstName: string;
  lastName: string;
  avatarId: string;
  countryCode: string;
}): Promise<UpdateAccountResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const normalizedUsername = normalizeUsername(data.username);
  if (!USERNAME_RE.test(normalizedUsername)) {
    return {
      success: false,
      error:
        "Username must be 3–20 characters: lowercase letters, numbers, or underscores.",
    };
  }

  const firstName = normalizeName(data.firstName);
  const lastName = normalizeName(data.lastName);
  if (!firstName || !NAME_RE.test(firstName)) {
    return { success: false, error: "Enter a valid first name." };
  }
  if (lastName && !NAME_RE.test(lastName)) {
    return { success: false, error: "Enter a valid last name." };
  }

  if (!isValidAvatarId(data.avatarId)) {
    return { success: false, error: "Invalid avatar selection." };
  }

  const countryCode =
    normalizeCountryCode(data.countryCode) ?? DEFAULT_COUNTRY;

  const client = await clerkClient();

  let user;
  try {
    user = await client.users.getUser(userId);
  } catch {
    return { success: false, error: "Could not load your account. Please try again." };
  }

  const meta = user.publicMetadata as Record<string, unknown>;

  try {
    await client.users.updateUser(userId, {
      username: normalizedUsername,
      firstName,
      lastName: lastName || undefined,
      publicMetadata: {
        ...meta,
        username: normalizedUsername,
        avatarId: data.avatarId,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error && /username/i.test(err.message)
        ? "That username is taken. Try another one."
        : "Could not save your profile. Please try again.";
    return { success: false, error: message };
  }

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
  cookieStore.set(AVATAR_COOKIE_NAME, data.avatarId, cookieOpts);

  const raw = await loadUserProgress(userId);
  raw.countryCode = countryCode;
  await persistProgress(
    userId,
    normalizedUsername,
    data.avatarId,
    raw,
    0,
    "profile_update",
  );

  revalidatePath("/account");
  revalidatePath("/profile");

  return { success: true };
}
