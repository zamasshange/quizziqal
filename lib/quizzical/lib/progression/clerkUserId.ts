/** Clerk user IDs always start with "user_". Filters test/demo rows from leaderboards. */
export function isRealClerkUserId(userId: string): boolean {
  return userId.startsWith("user_");
}

export const CLERK_USER_ID_FILTER = "user_%";
