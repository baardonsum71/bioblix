/**
 * Shared domain helpers (subscription gates, media helpers).
 * Keep UI-free so hooks/services can reuse them on web + native.
 */

import type { SubscriptionTier } from '@/types';

export function canAttachLink(
  tier: SubscriptionTier,
  isProYearly = false
): boolean {
  return isProYearly || tier === 'pro';
}

export const SUBSCRIPTION_PLANS = {
  standard: {
    id: 'standard' as const,
    label: 'Standard',
    billing: 'monthly' as const,
    features: [
      'Publiser produkt-blix (video/bilde)',
      'Synlig i BioBlix-strømmen',
    ],
  },
  pro: {
    id: 'pro' as const,
    /** Must match RevenueCat entitlement identifier */
    entitlementId: 'pro_yearly' as const,
    label: 'Pro',
    billing: 'yearly' as const,
    features: [
      'Alt i Standard',
      'Klikkbare butikklenker på hvert blix',
      'Speilet sikkert via RevenueCat',
    ],
  },
} as const;
