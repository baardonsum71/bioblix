import type { AppLocale } from '@/lib/i18n/countryLocale';

/** Compact popularity like Instagram: 30.4M / 30,4M / 4.2K / 12 */
export function formatTagPostCount(
  count: number,
  locale: AppLocale = 'en'
): string {
  const n = Math.max(0, Math.floor(count));
  const useComma = locale === 'nb';

  const fmt = (value: number, suffix: string) => {
    const rounded =
      value >= 10 ? Math.round(value).toString() : value.toFixed(1);
    const body = useComma ? rounded.replace('.', ',') : rounded;
    return `${body}${suffix}`;
  };

  if (n >= 1_000_000) return fmt(n / 1_000_000, 'M');
  if (n >= 1_000) return fmt(n / 1_000, 'K');
  return String(n);
}
