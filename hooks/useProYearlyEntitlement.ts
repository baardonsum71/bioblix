import { useAuth, useUser } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';

import { isOwnerEmail } from '@/constants/owners';
import {
  configureRevenueCat,
  hasProYearlyEntitlement,
} from '@/lib/revenuecat';
import { userCanAddLinks } from '@/services/users';

function clerkUserEmails(
  user:
    | {
        primaryEmailAddress?: { emailAddress?: string } | null;
        emailAddresses?: { emailAddress?: string }[];
      }
    | null
    | undefined
): string[] {
  if (!user) return [];
  const emails = new Set<string>();
  const primary = user.primaryEmailAddress?.emailAddress;
  if (primary) emails.add(primary);
  for (const entry of user.emailAddresses ?? []) {
    if (entry.emailAddress) emails.add(entry.emailAddress);
  }
  return [...emails];
}

/**
 * Pro access = owner allowlist OR RevenueCat `pro_yearly` OR Firestore mirror.
 */
export function useProYearlyEntitlement(appUserId?: string | null) {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [isProYearly, setIsProYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  const emails = clerkUserEmails(user);
  const owner = emails.some((e) => isOwnerEmail(e));

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (owner) {
        setIsProYearly(true);
        return;
      }

      let fromFs = false;
      let fromRc = false;

      if (appUserId) {
        try {
          fromFs = await userCanAddLinks(appUserId);
        } catch {
          fromFs = false;
        }
      }

      if (isSignedIn) {
        try {
          await configureRevenueCat(appUserId);
          fromRc = await hasProYearlyEntitlement();
        } catch {
          fromRc = false;
        }
      }

      setIsProYearly(fromFs || fromRc);
    } catch {
      setIsProYearly(false);
    } finally {
      setLoading(false);
    }
  }, [appUserId, owner, isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isProYearly, loading, refresh, isOwner: owner };
}
