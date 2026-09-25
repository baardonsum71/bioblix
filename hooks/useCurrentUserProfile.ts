import { useCallback, useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/lib/firebase/config';
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

    if (!isFirebaseConfigured) {
      setUser(null);
      setLoading(false);
      setError(
        new Error(
          'Firebase mangler i builden. Sett EXPO_PUBLIC_FIREBASE_* i Vercel og Redeploy med Clear cache.'
        )
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await getUserById(clerkUserId);
      setUser(profile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile';
      const nicer =
        message.toLowerCase().includes('offline')
          ? 'Kan ikke nå Firestore (offline). Sjekk at EXPO_PUBLIC_FIREBASE_* er i Vercel-builden (Clear cache + Redeploy), og at Deployment Protection ikke blokkerer.'
          : message;
      setError(new Error(nicer));
    } finally {
      setLoading(false);
    }
  }, [clerkUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
}
