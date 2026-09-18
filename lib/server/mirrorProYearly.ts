import { FieldValue } from 'firebase-admin/firestore';

import { getAdminDb } from './firebaseAdmin';

/** Must match RevenueCat entitlement + client constant. */
const PRO_YEARLY_ENTITLEMENT = 'pro_yearly';

type RevenueCatEntitlement = {
  expires_date: string | null;
  product_identifier?: string;
};

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
  };
};

function isEntitlementActive(entitlement?: RevenueCatEntitlement): boolean {
  if (!entitlement) return false;
  if (entitlement.expires_date == null) return true;
  return new Date(entitlement.expires_date).getTime() > Date.now();
}

/**
 * Ask RevenueCat (secret API key) whether `pro_yearly` is currently active.
 */
export async function fetchIsProYearlyFromRevenueCat(
  appUserId: string
): Promise<boolean> {
  const secret = process.env.REVENUECAT_SECRET_API_KEY;
  if (!secret) {
    throw new Error('Missing REVENUECAT_SECRET_API_KEY');
  }

  const url = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `RevenueCat subscriber lookup failed (${response.status}): ${body}`
    );
  }

  const data = (await response.json()) as RevenueCatSubscriberResponse;
  const entitlement = data.subscriber?.entitlements?.[PRO_YEARLY_ENTITLEMENT];
  return isEntitlementActive(entitlement);
}

/**
 * Mirror RevenueCat → Firestore `users/{appUserId}.isProYearly`.
 * Admin SDK bypasses client security rules (only this path may flip Pro).
 */
export async function mirrorProYearlyToFirestore(appUserId: string): Promise<{
  isProYearly: boolean;
}> {
  const isProYearly = await fetchIsProYearlyFromRevenueCat(appUserId);
  const db = getAdminDb();
  const ref = db.collection('users').doc(appUserId);

  await ref.set(
    {
      isProYearly,
      subscriptionTier: isProYearly ? 'pro' : 'standard',
      revenueCatAppUserId: appUserId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { isProYearly };
}
