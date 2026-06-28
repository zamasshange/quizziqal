import { isValidAvatarId } from "@/lib/avatars";

export type UserPublicMetadata = {
  avatarId?: string;
  username?: string;
  onboardingComplete?: boolean;
};

export const AVATAR_COOKIE_NAME = "quizzical_avatar";
export const ONBOARDING_COOKIE_NAME = "quizzical_onboarded";

export function getAvatarIdFromCookie(
  cookieValue: string | undefined,
): string | undefined {
  if (!cookieValue || !isValidAvatarId(cookieValue)) return undefined;
  return cookieValue;
}

export function getAvatarIdFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!sessionClaims) return undefined;

  if (typeof sessionClaims.avatarId === "string" && sessionClaims.avatarId) {
    return sessionClaims.avatarId;
  }

  const publicMetadata = sessionClaims.publicMetadata as
    | UserPublicMetadata
    | undefined;
  if (publicMetadata?.avatarId) return publicMetadata.avatarId;

  const metadata = sessionClaims.metadata as UserPublicMetadata | undefined;
  return metadata?.avatarId;
}

export function getAvatarId(
  sessionClaims: Record<string, unknown> | null | undefined,
  cookieValue?: string,
): string | undefined {
  return getAvatarIdFromCookie(cookieValue) ?? getAvatarIdFromClaims(sessionClaims);
}

export function getPublicMetadata(
  sessionClaims: Record<string, unknown> | null | undefined,
): UserPublicMetadata | undefined {
  if (!sessionClaims) return undefined;
  return (
    (sessionClaims.publicMetadata as UserPublicMetadata | undefined) ??
    (sessionClaims.metadata as UserPublicMetadata | undefined)
  );
}

export function hasCompletedOnboarding(
  sessionClaims: Record<string, unknown> | null | undefined,
  cookies?: {
    avatar?: string;
    onboarded?: string;
  },
): boolean {
  if (cookies?.onboarded === "1") return true;

  const meta = getPublicMetadata(sessionClaims);
  if (meta?.onboardingComplete) return true;

  const avatarId =
    getAvatarIdFromCookie(cookies?.avatar) ?? meta?.avatarId;
  const username =
    typeof meta?.username === "string" ? meta.username.trim() : "";

  return !!(avatarId && username.length >= 3);
}
