import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useRef, useState } from 'react';

import { ensureOwnerProAccess } from '@/lib/clerk/ensureOwnerPro';
import {
  clearFirebaseAuth,
  syncFirebaseAuthFromClerk,
} from '@/lib/clerk/firebaseSession';
import { upsertUser } from '@/services/users';

/**
 * After Clerk sign-in: mint Firebase Auth, then upsert Firestore `users/{id}`.
 * Owner emails also get Pro mirrored via Admin API.
 */
export function useEnsureUserProfile() {
  const { isSignedIn, isLoaded, getToken, userId } = useAuth();
  const { user } = useUser();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId || !user) {
      setReady(false);
      setError(null);
      void clearFirebaseAuth();
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setError(null);
      try {
        await syncFirebaseAuthFromClerk(() => getToken());

        const email =
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses[0]?.emailAddress ??
          '';
        const nickname =
          typeof user.unsafeMetadata?.nickname === 'string'
            ? user.unsafeMetadata.nickname.trim()
            : '';
        const displayName =
          nickname ||
          user.username ||
          user.fullName?.trim() ||
          email.split('@')[0] ||
          'BioBlix-bruker';

        await upsertUser(userId, {
          clerkId: userId,
          email,
          displayName,
          imageUrl: user.imageUrl ?? null,
        });

        // Best-effort owner Pro grant (requires FIREBASE_SERVICE_ACCOUNT_JSON).
        // Check all Clerk emails (Apple can attach more than one).
        try {
          const emails = [
            user.primaryEmailAddress?.emailAddress,
            ...user.emailAddresses.map((e) => e.emailAddress),
          ].filter(Boolean) as string[];
          for (const candidate of emails) {
            const result = await ensureOwnerProAccess(() => getToken(), candidate);
            if (result.owner) break;
          }
        } catch (ownerErr) {
          console.warn('[owner-pro]', ownerErr);
        }

        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setReady(false);
          setError(
            err instanceof Error ? err : new Error('Kunne ikke synce profil')
          );
        }
      } finally {
        syncingRef.current = false;
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, user, getToken]);

  return { ready, error };
}
