import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { ensureOwnerProAccess } from '@/lib/clerk/ensureOwnerPro';
import {
  clearFirebaseAuth,
  syncFirebaseAuthFromClerk,
} from '@/lib/clerk/firebaseSession';
import { useI18n } from '@/lib/i18n';
import { claimSignupCoins } from '@/services/coins';
import { upsertUser } from '@/services/users';

/**
 * After Clerk sign-in: mint Firebase Auth, then upsert Firestore `users/{id}`.
 * Owner emails also get Pro mirrored via Admin API.
 */
export function useEnsureUserProfile() {
  const { isSignedIn, isLoaded, getToken, userId } = useAuth();
  const { user } = useUser();
  const { setCountryCode } = useI18n();
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
        const nicknameMeta =
          typeof user.unsafeMetadata?.nickname === 'string'
            ? user.unsafeMetadata.nickname.trim()
            : '';
        let claimedNick = '';
        if (
          typeof sessionStorage !== 'undefined' &&
          Platform.OS === 'web'
        ) {
          claimedNick = (sessionStorage.getItem('bioblix_claim_nick') ?? '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');
        }
        const nickname = nicknameMeta || claimedNick;
        if (claimedNick && claimedNick !== nicknameMeta) {
          try {
            await user.update({
              unsafeMetadata: {
                ...(typeof user.unsafeMetadata === 'object' &&
                user.unsafeMetadata
                  ? user.unsafeMetadata
                  : {}),
                nickname: claimedNick,
              },
            });
          } catch {
            /* best-effort */
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('bioblix_claim_nick');
          }
        }
        const birthDateRaw =
          typeof user.unsafeMetadata?.birthDate === 'string'
            ? user.unsafeMetadata.birthDate.trim()
            : '';
        const countryCodeRaw =
          typeof user.unsafeMetadata?.countryCode === 'string'
            ? user.unsafeMetadata.countryCode.trim().toUpperCase()
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
          birthDate: birthDateRaw || null,
          countryCode: countryCodeRaw || null,
        });

        try {
          await claimSignupCoins(() => getToken());
        } catch (coinErr) {
          console.warn(
            '[coins-signup]',
            coinErr instanceof Error ? coinErr.message : coinErr
          );
        }

        if (countryCodeRaw) {
          setCountryCode(countryCodeRaw);
        }

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
  }, [isLoaded, isSignedIn, userId, user, getToken, setCountryCode]);

  return { ready, error };
}
