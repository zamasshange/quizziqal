import { clerkClient } from "@clerk/nextjs/server";
import {
  getAvatarIdFromClaims,
  getPublicMetadata,
  hasCompletedOnboarding,
  type UserPublicMetadata,
} from "@/lib/userMetadata";

export type ClerkIdentity = {
  username: string;
  avatarId: string | null;
};

/** Resolve display identity from JWT claims, falling back to Clerk API. */
export async function resolveClerkIdentity(
  userId: string,
  sessionClaims: Record<string, unknown> | null | undefined,
  cookies?: { avatar?: string; onboarded?: string },
): Promise<ClerkIdentity | null> {
  if (!hasCompletedOnboarding(sessionClaims, cookies)) return null;

  const meta = getPublicMetadata(sessionClaims);
  let username =
    typeof meta?.username === "string" ? meta.username.trim().toLowerCase() : "";
  let avatarId = getAvatarIdFromClaims(sessionClaims) ?? meta?.avatarId ?? null;

  if (!username || username.length < 3) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const pm = user.publicMetadata as UserPublicMetadata;
      username =
        (typeof pm?.username === "string" ? pm.username : user.username ?? "")
          .trim()
          .toLowerCase();
      avatarId = pm?.avatarId ?? avatarId;
    } catch {
      return null;
    }
  }

  if (!username || username.length < 3) return null;
  return { username, avatarId };
}
