import { FieldValue } from 'firebase-admin/firestore';

import { getAdminDb } from './firebaseAdmin';

/** Must match RevenueCat entitlement + client constant. */
export const PRO_YEARLY_ENTITLEMENT = 'pro_yearly';

type RevenueCatEntitlement = {
  expires_date: string | null;
  product_identifier?: string;
};

type RevenueCatSubscription = {
  expires_date?: string | null;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
};

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
    subscriptions?: Record<string, RevenueCatSubscription>;
  };
};

function isEntitlementActive(entitlement?: RevenueCatEntitlement): boolean {
  if (!entitlement) return false;
  if (entitlement.expires_date == null) return true;
  return new Date(entitlement.expires_date).getTime() > Date.now();
}

function isSubscriptionActive(sub?: RevenueCatSubscription): boolean {
  if (!sub) return false;
  if (sub.unsubscribe_detected_at) return false;
  if (!sub.expires_date) return true;
  return new Date(sub.expires_date).getTime() > Date.now();
}

function subscriberHasProAccess(
  subscriber: RevenueCatSubscriberResponse['subscriber']
): boolean {
  if (!subscriber) return false;

  const entitlements = subscriber.entitlements ?? {};
  if (isEntitlementActive(entitlements[PRO_YEARLY_ENTITLEMENT])) {
    return true;
  }
  // Products may be attached to a differently named entitlement in the dashboard.
  for (const entitlement of Object.values(entitlements)) {
    if (isEntitlementActive(entitlement)) return true;
  }

  const subscriptions = subscriber.subscriptions ?? {};
  for (const sub of Object.values(subscriptions)) {
    if (isSubscriptionActive(sub)) return true;
  }

  return false;
}

/**
 * Ask RevenueCat (secret API key) whether the user currently has Pro access.
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
  return subscriberHasProAccess(data.subscriber);
}

/**
 * Mirror RevenueCat → Firestore `users/{appUserId}.isProYearly`.
 * Admin SDK bypasses client security rules (only this path may flip RC Pro).
 * Does not clear active coin-redeemed Pro (`coinProUntil`).
 */
export async function mirrorProYearlyToFirestore(appUserId: string): Promise<{
  isProYearly: boolean;
}> {
  const fromRc = await fetchIsProYearlyFromRevenueCat(appUserId);
  const db = getAdminDb();
  const ref = db.collection('users').doc(appUserId);
  const snap = await ref.get();
  const data = snap.data() as Record<string, unknown> | undefined;

  let coinActive = false;
  const until = data?.coinProUntil;
  if (until && typeof until === 'object' && 'toDate' in until) {
    coinActive =
      (until as { toDate: () => Date }).toDate().getTime() > Date.now();
  }

  const isProYearly = fromRc;
  const tier = fromRc || coinActive ? 'pro' : 'standard';

  await ref.set(
    {
      isProYearly,
      subscriptionTier: tier,
      revenueCatAppUserId: appUserId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { isProYearly: fromRc || coinActive };
}
