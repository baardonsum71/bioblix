import { isAllowedCountry } from '@/lib/i18n/countries';

export type AppLocale = 'en' | 'nb';

/** ISO 4217 currency codes used for RevenueCat web offerings. */
export type AppCurrency = string;

const EUR_COUNTRIES = new Set([
  'AT',
  'BE',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
  'AD',
  'MC',
  'SM',
  'VA',
  'ME',
  'XK',
]);

/** Explicit country → currency overrides (non-EUR). */
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  NO: 'NOK',
  SJ: 'NOK',
  SE: 'SEK',
  DK: 'DKK',
  FO: 'DKK',
  GL: 'DKK',
  US: 'USD',
  UM: 'USD',
  PR: 'USD',
  VI: 'USD',
  GU: 'USD',
  MP: 'USD',
  AS: 'USD',
  GB: 'GBP',
  IM: 'GBP',
  JE: 'GBP',
  GG: 'GBP',
  GI: 'GBP',
  CH: 'CHF',
  LI: 'CHF',
  JP: 'JPY',
  CN: 'CNY',
  HK: 'HKD',
  MO: 'MOP',
  TW: 'TWD',
  KR: 'KRW',
  IN: 'INR',
  AU: 'AUD',
  NZ: 'NZD',
  CA: 'CAD',
  MX: 'MXN',
  BR: 'BRL',
  AR: 'ARS',
  CL: 'CLP',
  CO: 'COP',
  PE: 'PEN',
  UY: 'UYU',
  ZA: 'ZAR',
  NG: 'NGN',
  EG: 'EGP',
  KE: 'KES',
  GH: 'GHS',
  MA: 'MAD',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  IL: 'ILS',
  TR: 'TRY',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
  IS: 'ISK',
  UA: 'UAH',
  BY: 'BYN',
  RS: 'RSD',
  BA: 'BAM',
  MK: 'MKD',
  AL: 'ALL',
  GE: 'GEL',
  AM: 'AMD',
  AZ: 'AZN',
  KZ: 'KZT',
  UZ: 'UZS',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  ID: 'IDR',
  PH: 'PHP',
  VN: 'VND',
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
  NP: 'NPR',
  MM: 'MMK',
  KH: 'KHR',
  LA: 'LAK',
  MN: 'MNT',
};

export function normalizeCountryCode(
  code: string | null | undefined
): string | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  if (!isAllowedCountry(upper)) return null;
  return upper;
}

/** v1: Norway → Norwegian Bokmål; everyone else → English. */
export function localeFromCountry(
  countryCode: string | null | undefined
): AppLocale {
  const code = normalizeCountryCode(countryCode);
  if (code === 'NO' || code === 'SJ') return 'nb';
  return 'en';
}

export function currencyFromCountry(
  countryCode: string | null | undefined
): AppCurrency {
  const code = normalizeCountryCode(countryCode);
  if (!code) return 'USD';
  if (CURRENCY_BY_COUNTRY[code]) return CURRENCY_BY_COUNTRY[code];
  if (EUR_COUNTRIES.has(code)) return 'EUR';
  return 'USD';
}

/** Fallback price labels when RevenueCat offerings are unavailable. */
export function formatPlanPricesFallback(
  countryCode: string | null | undefined
): { monthly: string; yearly: string; summary: string } {
  const currency = currencyFromCountry(countryCode);
  const monthly =
    currency === 'NOK'
      ? '59 kr/mnd'
      : currency === 'USD'
        ? '$5.99/mo'
        : currency === 'EUR'
          ? '€5.99/mo'
          : currency === 'GBP'
            ? '£5.99/mo'
            : currency === 'SEK'
              ? '69 kr/mån'
              : currency === 'DKK'
                ? '49 kr/md'
                : `Pro / ${currency}`;
  const yearly =
    currency === 'NOK'
      ? '399 kr/år'
      : currency === 'USD'
        ? '$39.99/yr'
        : currency === 'EUR'
          ? '€39.99/yr'
          : currency === 'GBP'
            ? '£39.99/yr'
            : currency === 'SEK'
              ? '449 kr/år'
              : currency === 'DKK'
                ? '349 kr/år'
                : `Pro yearly / ${currency}`;
  return {
    monthly,
    yearly,
    summary: `${monthly} · ${yearly}`,
  };
}
