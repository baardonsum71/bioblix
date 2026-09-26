import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases';

import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';
import {
  configureWebPurchases,
  hasWebProEntitlement,
} from '@/lib/revenuecat/web';
import { isWeb } from '@/lib/platform';

let configured = false;

function apiKeyForPlatform(): string | undefined {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  }
  return process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY;
}

/**
 * Configure Purchases once at app start. Safe to call multiple times.
 * Web → purchases-js. Native → react-native-purchases.
 */
export async function configureRevenueCat(appUserId?: string | null): Promise<void> {
  try {
    if (isWeb || Platform.OS === 'web') {
      await configureWebPurchases(appUserId);
      return;
    }

    if (configured) {
      if (appUserId) {
        await Purchases.logIn(appUserId);
      }
      return;
    }

    const apiKey = apiKeyForPlatform();
    if (!apiKey) {
      console.warn(
        '[revenuecat] Missing API key for this platform. Set EXPO_PUBLIC_REVENUECAT_* in .env / Vercel.'
      );
      return;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({
      apiKey,
      appUserID: appUserId ?? undefined,
    });
    configured = true;
  } catch (error) {
    console.warn('[revenuecat] configure failed (non-fatal)', error);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (isWeb || Platform.OS === 'web') {
      return null;
    }
    if (!configured) {
      await configureRevenueCat();
    }
    if (!configured) return null;
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.warn('[revenuecat] getCustomerInfo failed', error);
    return null;
  }
}

/**
 * True when the active entitlements include `pro_yearly`.
 */
export async function hasProYearlyEntitlement(
  appUserId?: string | null
): Promise<boolean> {
  if (isWeb || Platform.OS === 'web') {
    return hasWebProEntitlement(appUserId);
  }
  const info = await getCustomerInfo();
  if (!info) return false;
  return typeof info.entitlements.active[PRO_YEARLY_ENTITLEMENT] !== 'undefined';
}

export { PRO_YEARLY_ENTITLEMENT };
