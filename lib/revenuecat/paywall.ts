import { Platform } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';
import { hasProYearlyEntitlement } from '@/lib/revenuecat';
import { presentWebPaywall } from '@/lib/revenuecat/web';
import { isWeb } from '@/lib/platform';

type PresentOptions = {
  appUserId?: string | null;
  customerEmail?: string | null;
};

/**
 * Present RevenueCat paywall so the user can upgrade to Pro.
 * Web uses purchases-js (RN paywall freezes Safari). Native uses RevenueCatUI.
 */
export async function presentProYearlyPaywall(
  options?: PresentOptions
): Promise<boolean> {
  try {
    if (isWeb || Platform.OS === 'web') {
      const entitled = await presentWebPaywall(
        options?.appUserId,
        options?.customerEmail
      );
      if (entitled) return true;
      return hasProYearlyEntitlement(options?.appUserId);
    }

    const result = await Promise.race([
      RevenueCatUI.presentPaywall({
        displayCloseButton: true,
      }),
      new Promise<PAYWALL_RESULT>((resolve) => {
        setTimeout(() => resolve(PAYWALL_RESULT.CANCELLED), 120_000);
      }),
    ]);

    if (
      result === PAYWALL_RESULT.PURCHASED ||
      result === PAYWALL_RESULT.RESTORED
    ) {
      return hasProYearlyEntitlement(options?.appUserId);
    }

    if (result === PAYWALL_RESULT.NOT_PRESENTED) {
      return hasProYearlyEntitlement(options?.appUserId);
    }

    return false;
  } catch (error) {
    console.warn('[revenuecat] presentPaywall failed', error);
    throw error instanceof Error
      ? error
      : new Error('Kunne ikke åpne betaling. Prøv igjen.');
  }
}

export async function presentProYearlyPaywallIfNeeded(
  options?: PresentOptions
): Promise<boolean> {
  try {
    if (await hasProYearlyEntitlement(options?.appUserId)) {
      return true;
    }
    return presentProYearlyPaywall(options);
  } catch (error) {
    console.warn('[revenuecat] presentPaywallIfNeeded failed', error);
    return false;
  }
}

export { PRO_YEARLY_ENTITLEMENT };
