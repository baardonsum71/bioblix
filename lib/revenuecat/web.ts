import { apiUrl } from '@/lib/apiBase';
import {
  currencyFromCountry,
  formatPlanPricesFallback,
  localeFromCountry,
} from '@/lib/i18n/countryLocale';
import { translate } from '@/lib/i18n';
import { PRO_YEARLY_ENTITLEMENT } from '@/lib/revenuecat/constants';

type WebPurchasesModule = typeof import('@revenuecat/purchases-js');
type WebPurchases = InstanceType<WebPurchasesModule['Purchases']>;
type CustomerInfo = Awaited<ReturnType<WebPurchases['getCustomerInfo']>>;

let cached: WebPurchasesModule | null = null;

async function loadWebSdk(): Promise<WebPurchasesModule> {
  if (cached) return cached;
  try {
    await import('@revenuecat/purchases-js/styles');
  } catch {
    // styles optional
  }
  cached = await import('@revenuecat/purchases-js');
  return cached;
}

function webApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY;
}

/** Remove RevenueCat checkout overlays that leave the page frozen. */
export function cleanupWebCheckoutUi(): void {
  if (typeof document === 'undefined') return;
  const selectors = [
    '.rcb-ui-root',
    '#rcb-ui-root',
    '[class*="rcb-ui"]',
    '[id*="rcb-"]',
  ];
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      try {
        el.remove();
      } catch {
        // ignore
      }
    });
  }
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.documentElement.style.pointerEvents = '';
}

function customerHasPro(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  const active = info.entitlements?.active ?? {};
  if (typeof active[PRO_YEARLY_ENTITLEMENT] !== 'undefined') return true;
  if (Object.keys(active).length > 0) return true;
  try {
    if (info.activeSubscriptions && info.activeSubscriptions.size > 0) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
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
    return customerHasPro(info);
  } catch (error) {
    console.warn('[revenuecat-web] getCustomerInfo failed', error);
    return false;
  }
}

/**
 * Mirror Pro to Firestore via Admin API (webhook may be missing / delayed).
 */
export async function syncProToFirestore(
  getClerkToken: () => Promise<string | null>
): Promise<boolean> {
  const token = await getClerkToken();
  if (!token) return false;
  try {
    const res = await fetch(apiUrl('/api/sync-pro'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn('[sync-pro]', await res.text());
      return false;
    }
    const data = (await res.json()) as { isProYearly?: boolean };
    return data.isProYearly === true;
  } catch (error) {
    console.warn('[sync-pro] failed', error);
    return false;
  }
}

async function racePurchaseWithPoll(
  purchases: WebPurchases,
  purchasePromise: Promise<{ customerInfo: CustomerInfo }>
): Promise<CustomerInfo | null> {
  return new Promise((resolve, reject) => {
    let finished = false;

    const finish = (info: CustomerInfo | null, err?: unknown) => {
      if (finished) return;
      finished = true;
      cleanupWebCheckoutUi();
      if (info) {
        resolve(info);
        return;
      }
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    };

    void purchasePromise
      .then((r) => finish(r.customerInfo))
      .catch((err) => {
        // Give poll a moment in case payment already activated Pro.
        window.setTimeout(() => {
          void purchases
            .getCustomerInfo()
            .then((info) => {
              if (customerHasPro(info)) finish(info);
              else finish(null, err);
            })
            .catch(() => finish(null, err));
        }, 800);
      });

    void (async () => {
      for (let i = 0; i < 45; i++) {
        if (finished) return;
        await new Promise((r) => setTimeout(r, 2000));
        if (finished) return;
        try {
          const info = await purchases.getCustomerInfo();
          if (customerHasPro(info)) {
            finish(info);
            return;
          }
        } catch {
          // keep polling
        }
      }
    })();
  });
}

async function purchaseViaPackagePicker(
  purchases: WebPurchases,
  customerEmail?: string | null,
  countryCode?: string | null
): Promise<boolean> {
  const currency = currencyFromCountry(countryCode);
  const locale = localeFromCountry(countryCode);
  const fallback = formatPlanPricesFallback(countryCode);

  // Prefer offerings in the user's currency. Do NOT fall back to default (often NOK)
  // for display — that mixes English UI with Norwegian prices.
  let offerings = await purchases.getOfferings({ currency }).catch(() => null);
  if (!offerings?.current?.availablePackages.length) {
    offerings = await purchases.getOfferings().catch(() => null);
  }
  const current = offerings?.current;
  if (!current || current.availablePackages.length === 0) {
    throw new Error(translate(locale, 'paywall.noPackages'));
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

  const priceLabel = (
    pkg: NonNullable<typeof monthly> | undefined,
    fallbackLabel: string
  ): string => {
    const price = pkg?.webBillingProduct?.currentPrice;
    if (!price) return fallbackLabel;
    const code = (price.currency || '').toUpperCase();
    // Only show RC price when it matches the country currency.
    if (code && code !== currency.toUpperCase()) return fallbackLabel;
    return price.formattedPrice || fallbackLabel;
  };

  const lines = [
    translate(locale, 'paywall.selectPlan'),
    monthly
      ? translate(locale, 'paywall.monthly', {
          price: priceLabel(monthly, fallback.monthly),
        })
      : null,
    yearly
      ? translate(locale, 'paywall.yearly', {
          price: priceLabel(yearly, fallback.yearly),
        })
      : null,
    translate(locale, 'paywall.cancel'),
  ]
    .filter(Boolean)
    .join('\n');

  const choice = window.prompt(lines, yearly ? '2' : '1');
  if (choice == null || choice.trim() === '') return false;

  const trimmed = choice.trim();
  let pkg =
    yearly && (trimmed === '2' || trimmed.toLowerCase().startsWith('å') || trimmed.toLowerCase().startsWith('y'))
      ? yearly
      : monthly && (trimmed === '1' || trimmed.toLowerCase().startsWith('m'))
        ? monthly
        : null;

  if (!pkg) {
    pkg = yearly ?? monthly ?? current.availablePackages[0] ?? null;
  }
  if (!pkg) {
    throw new Error(translate(locale, 'paywall.noPackage'));
  }

  try {
    const info = await racePurchaseWithPoll(
      purchases,
      purchases.purchase({
        rcPackage: pkg,
        customerEmail: customerEmail ?? undefined,
      })
    );
    return customerHasPro(info);
  } finally {
    cleanupWebCheckoutUi();
  }
}

export async function presentWebPaywall(
  appUserId?: string | null,
  customerEmail?: string | null,
  countryCode?: string | null
): Promise<boolean> {
  const locale = localeFromCountry(countryCode);
  const { PurchasesError, ErrorCode } = await loadWebSdk();
  const purchases = await configureWebPurchases(appUserId);
  if (!purchases) {
    throw new Error(translate(locale, 'paywall.notConfigured'));
  }

  if (typeof document === 'undefined') {
    throw new Error(translate(locale, 'paywall.needsBrowser'));
  }

  try {
    try {
      const info = await racePurchaseWithPoll(
        purchases,
        purchases.presentPaywall({
          customerEmail: customerEmail ?? undefined,
        })
      );
      return customerHasPro(info);
    } catch (error) {
      if (isCancelledError(error, PurchasesError, ErrorCode)) {
        return false;
      }
      if (missingPaywallError(error)) {
        cleanupWebCheckoutUi();
        return purchaseViaPackagePicker(purchases, customerEmail, countryCode);
      }
      throw error;
    }
  } catch (error) {
    if (isCancelledError(error, PurchasesError, ErrorCode)) {
      return false;
    }
    throw error;
  } finally {
    cleanupWebCheckoutUi();
  }
}
