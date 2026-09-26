import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  en,
  nb,
  type Dictionary,
  type MessageKey,
} from '@/lib/i18n/dictionaries';
import {
  currencyFromCountry,
  localeFromCountry,
  normalizeCountryCode,
  type AppCurrency,
  type AppLocale,
} from '@/lib/i18n/countryLocale';

const DICTS: Record<AppLocale, Dictionary> = { en, nb };

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`
  );
}

type I18nContextValue = {
  locale: AppLocale;
  countryCode: string | null;
  currency: AppCurrency;
  setCountryCode: (code: string | null) => void;
  t: (key: MessageKey, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialCountryCode = null,
}: {
  children: ReactNode;
  initialCountryCode?: string | null;
}) {
  const [countryCode, setCountryCodeState] = useState<string | null>(() =>
    normalizeCountryCode(initialCountryCode)
  );

  const setCountryCode = useCallback((code: string | null) => {
    setCountryCodeState(normalizeCountryCode(code));
  }, []);

  const locale = localeFromCountry(countryCode);
  const currency = currencyFromCountry(countryCode);

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => {
      const dict = DICTS[locale] ?? en;
      const raw = dict[key] ?? en[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      countryCode,
      currency,
      setCountryCode,
      t,
    }),
    [locale, countryCode, currency, setCountryCode, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

/** Safe translate outside React when locale is known (e.g. paywall helpers). */
export function translate(
  locale: AppLocale,
  key: MessageKey,
  vars?: Vars
): string {
  const dict = DICTS[locale] ?? en;
  return interpolate(dict[key] ?? en[key] ?? key, vars);
}

export type { MessageKey, AppLocale, AppCurrency };
