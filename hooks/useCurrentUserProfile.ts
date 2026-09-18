import { useCallback, useEffect, useState } from 'react';

import type { User } from '@/types';
import { getUserById } from '@/services/users';

/**
 * Load Firestore user profile by Clerk user id.
 * Pass `clerkUserId` from `useAuth()` / `useUser()` once Clerk is wired.
 */
export function useCurrentUserProfile(clerkUserId: string | null | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(clerkUserId));
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!clerkUserId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await getUserById(clerkUserId);
      setUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, [clerkUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
}
