import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';

type WebPurchasesModule = typeof import('@revenuecat/purchases-js');
type WebPurchases = InstanceType<WebPurchasesModule['Purchases']>;

let cached: WebPurchasesModule | null = null;

async function loadWebSdk(): Promise<WebPurchasesModule> {
  if (cached) return cached;
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

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function isCancelledError(
  error: unknown,
  PurchasesError: WebPurchasesModule['PurchasesError'],
  ErrorCode: WebPurchasesModule['ErrorCode']
): boolean {
  if (
    error instanceof PurchasesError &&
    error.errorCode === ErrorCode.UserCancelledError
  ) {
    return true;
  }
  const msg = String(error instanceof Error ? error.message : error ?? '').toLowerCase();
  return msg.includes('cancel') || msg.includes('dismiss');
}

function missingPaywallError(error: unknown): boolean {
  const msg = String(error instanceof Error ? error.message : error ?? '').toLowerCase();
  return (
    msg.includes("doesn't have a paywall") ||
    msg.includes('does not have a paywall') ||
    msg.includes('no paywall')
  );
}

function hasPro(active: Record<string, unknown> | undefined): boolean {
  return typeof active?.[PRO_YEARLY_ENTITLEMENT] !== 'undefined';
}

/**
 * Configure RevenueCat Web Billing (`purchases-js`).
 */
export async function configureWebPurchases(
  appUserId?: string | null
): Promise<WebPurchases | null> {
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
      // optional
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
    return hasPro(info.entitlements.active);
  } catch (error) {
    console.warn('[revenuecat-web] getCustomerInfo failed', error);
    return false;
  }
}

/**
 * Fallback when offering has no designed paywall: pick monthly/yearly then purchase().
 */
async function purchaseViaPackagePicker(
  purchases: WebPurchases,
  customerEmail?: string | null
): Promise<boolean> {
  const offerings = await purchases.getOfferings({ currency: 'NOK' }).catch(() =>
    purchases.getOfferings()
  );
  const current = offerings.current;
  if (!current || current.availablePackages.length === 0) {
    throw new Error(
      'Ingen Pro-pakker funnet. Sjekk Offerings i RevenueCat (Current offering + produkter).'
    );
  }

  const yearly =
    current.annual ??
    current.availablePackages.find((p) =>
      /year|årlig|annual/i.test(p.identifier + (p.webBillingProduct?.title ?? ''))
    );
  const monthly =
    current.monthly ??
    current.availablePackages.find((p) =>
      /month|måned/i.test(p.identifier + (p.webBillingProduct?.title ?? ''))
    );

  const lines = [
    'Velg Pro-plan:',
    monthly
      ? `1 = Månedlig (${monthly.webBillingProduct?.currentPrice?.formattedPrice ?? '59 kr'})`
      : null,
    yearly
      ? `2 = Årlig (${yearly.webBillingProduct?.currentPrice?.formattedPrice ?? '399 kr'})`
      : null,
    'Avbryt = lukk',
  ]
    .filter(Boolean)
    .join('\n');

  const choice = window.prompt(lines, yearly ? '2' : '1');
  if (choice == null || choice.trim() === '') return false;

  const trimmed = choice.trim();
  let pkg = yearly && (trimmed === '2' || trimmed.toLowerCase().startsWith('å'))
    ? yearly
    : monthly && (trimmed === '1' || trimmed.toLowerCase().startsWith('m'))
      ? monthly
      : null;

  if (!pkg) {
    pkg = yearly ?? monthly ?? current.availablePackages[0] ?? null;
  }
  if (!pkg) {
    throw new Error('Fant ingen pakke å kjøpe.');
  }

  document.body.style.overflow = 'hidden';
  try {
    const result = await purchases.purchase({
      rcPackage: pkg,
      customerEmail: customerEmail ?? undefined,
    });
    return hasPro(result.customerInfo.entitlements.active);
  } finally {
    unlockBodyScroll();
  }
}

/**
 * Present RevenueCat Web paywall, or package checkout if no paywall is attached.
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
    throw new Error('Betaling krever nettleser.');
  }

  document.body.style.overflow = 'hidden';

  try {
    try {
      const result = await Promise.race([
        purchases.presentPaywall({
          customerEmail: customerEmail ?? undefined,
        }),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error('Paywall tok for lang tid. Prøv igjen.'));
          }, 180_000);
        }),
      ]);
      return hasPro(result?.customerInfo?.entitlements?.active);
    } catch (error) {
      if (isCancelledError(error, PurchasesError, ErrorCode)) {
        return false;
      }
      if (missingPaywallError(error)) {
        unlockBodyScroll();
        return purchaseViaPackagePicker(purchases, customerEmail);
      }
      throw error;
    }
  } catch (error) {
    if (isCancelledError(error, PurchasesError, ErrorCode)) {
      return false;
    }
    throw error;
  } finally {
    unlockBodyScroll();
  }
}
