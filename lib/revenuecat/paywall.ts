import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';
import { hasProYearlyEntitlement } from '@/lib/revenuecat';

/**
 * Present RevenueCat paywall so the user can upgrade to Pro Yearly.
 * Returns true if they purchased/restored and now have `pro_yearly`.
 */
export async function presentProYearlyPaywall(): Promise<boolean> {
  try {
    const result = await RevenueCatUI.presentPaywall({
      displayCloseButton: true,
    });

    if (
      result === PAYWALL_RESULT.PURCHASED ||
      result === PAYWALL_RESULT.RESTORED
    ) {
      return hasProYearlyEntitlement();
    }

    // Fallback: user may already have been entitled when paywall closed
    if (result === PAYWALL_RESULT.NOT_PRESENTED) {
      return hasProYearlyEntitlement();
    }

    return false;
  } catch (error) {
    console.warn('[revenuecat] presentPaywall failed', error);
    return false;
  }
}

export async function presentProYearlyPaywallIfNeeded(): Promise<boolean> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_YEARLY_ENTITLEMENT,
    });

    return (
      result === PAYWALL_RESULT.PURCHASED ||
      result === PAYWALL_RESULT.RESTORED ||
      (await hasProYearlyEntitlement())
    );
  } catch (error) {
    console.warn('[revenuecat] presentPaywallIfNeeded failed', error);
    return false;
  }
}
