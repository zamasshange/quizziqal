"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidAvatarId } from "@/lib/avatars";
import { AVATAR_COOKIE_NAME } from "@/lib/userMetadata";

export async function saveAvatarSelection(avatarId: string): Promise<{ ok: true }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in to pick an avatar.");
  }

  if (!isValidAvatarId(avatarId)) {
    throw new Error("Invalid avatar selection.");
  }

  const client = await clerkClient();
  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { avatarId },
    });
  } catch {
    throw new Error("Could not save your avatar. Please try again.");
  }

  const cookieStore = await cookies();
  cookieStore.set(AVATAR_COOKIE_NAME, avatarId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Bridge until Clerk JWT picks up publicMetadata.avatarId (can take a session refresh).
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/");
  revalidatePath("/onboarding");

  return { ok: true };
}
