import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';

type WebPurchasesModule = typeof import('@revenuecat/purchases-js');

let cached: WebPurchasesModule | null = null;

async function loadWebSdk(): Promise<WebPurchasesModule> {
  if (cached) return cached;
  // CSS for checkout/paywall overlay
  try {
    await import('@revenuecat/purchases-js/styles');
  } catch {
    // styles optional if bundler skips CSS
  }
  cached = await import('@revenuecat/purchases-js');
  return cached;
}

function webApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY;
}

/**
 * Configure RevenueCat Web Billing (`purchases-js`).
 * Do not use react-native-purchases for web checkout — it freezes Safari.
 */
export async function configureWebPurchases(
  appUserId?: string | null
): Promise<InstanceType<WebPurchasesModule['Purchases']> | null> {
  const apiKey = webApiKey();
  if (!apiKey) {
    console.warn('[revenuecat-web] Missing EXPO_PUBLIC_REVENUECAT_WEB_API_KEY');
    return null;
  }
  if (!appUserId) {
    console.warn('[revenuecat-web] Missing appUserId — sign in first');
    return null;
  }

  try {
    const { Purchases } = await loadWebSdk();
    if (Purchases.isConfigured()) {
      return Purchases.getSharedInstance();
    }

    const purchases = Purchases.configure({
      apiKey,
      appUserId,
    });
    try {
      await purchases.preload();
    } catch {
      // preload is optional
    }
    return purchases;
  } catch (error) {
    console.warn('[revenuecat-web] configure failed', error);
    return null;
  }
}

export async function hasWebProEntitlement(
  appUserId?: string | null
): Promise<boolean> {
  try {
    const purchases = await configureWebPurchases(appUserId);
    if (!purchases) return false;
    const info = await purchases.getCustomerInfo();
    return typeof info.entitlements.active[PRO_YEARLY_ENTITLEMENT] !== 'undefined';
  } catch (error) {
    console.warn('[revenuecat-web] getCustomerInfo failed', error);
    return false;
  }
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

/**
 * Present RevenueCat Web paywall overlay. Always cleans up so the page never stays locked.
 */
export async function presentWebPaywall(
  appUserId?: string | null,
  customerEmail?: string | null
): Promise<boolean> {
  const { PurchasesError, ErrorCode } = await loadWebSdk();
  const purchases = await configureWebPurchases(appUserId);
  if (!purchases) {
    throw new Error(
      'RevenueCat Web er ikke konfigurert. Sjekk EXPO_PUBLIC_REVENUECAT_WEB_API_KEY.'
    );
  }

  if (typeof document === 'undefined') {
    throw new Error('Paywall krever nettleser.');
  }

  document.body.style.overflow = 'hidden';

  const timeoutMs = 180_000;
  try {
    const result = await Promise.race([
      purchases.presentPaywall({
        customerEmail: customerEmail ?? undefined,
      }),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error('Paywall tok for lang tid. Lukk og prøv igjen.'));
        }, timeoutMs);
      }),
    ]);

    const active = result?.customerInfo?.entitlements?.active ?? {};
    return typeof active[PRO_YEARLY_ENTITLEMENT] !== 'undefined';
  } catch (error) {
    if (
      error instanceof PurchasesError &&
      error.errorCode === ErrorCode.UserCancelledError
    ) {
      return false;
    }
    const msg = String(
      error instanceof Error ? error.message : error ?? ''
    ).toLowerCase();
    if (msg.includes('cancel') || msg.includes('dismiss')) {
      return false;
    }
    throw error;
  } finally {
    unlockBodyScroll();
  }
}
