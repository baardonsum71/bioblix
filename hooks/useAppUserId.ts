/**
 * Temporary user id until Clerk is wired.
 * Prefer EXPO_PUBLIC_DEV_USER_ID in .env for local testing.
 */
export function useAppUserId(): string | null {
  return process.env.EXPO_PUBLIC_DEV_USER_ID ?? null;
}
