import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform } from 'react-native';

import { Brand, Colors } from '@/constants/Colors';
import { translate, type AppLocale, type MessageKey } from '@/lib/i18n';
import { extractLinkDomain } from '@/lib/validation/proLink';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function openNormalized(href: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Linking.openURL(href);
    return;
  }
  await WebBrowser.openBrowserAsync(href, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
    controlsColor: Colors.lime,
  });
}

type LinkLabels = {
  locale?: AppLocale;
};

/**
 * Show App Store / Play-required external-navigation disclaimer, then open.
 */
export function confirmAndOpenBioBlixLink(
  url: string,
  options?: LinkLabels
): void {
  const href = normalizeUrl(url);
  const domain = extractLinkDomain(href);
  const locale = options?.locale ?? 'en';
  const t = (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  Alert.alert(
    t('link.leaveTitle', { name: Brand.name }),
    t('link.leaveBody', { name: Brand.name, domain }),
    [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('link.continue'),
        onPress: () => {
          void openNormalized(href);
        },
      },
    ]
  );
}

/** @deprecated Prefer confirmAndOpenBioBlixLink for UGC compliance. */
export async function openBioBlixLink(url: string): Promise<void> {
  await openNormalized(normalizeUrl(url));
}

/** CTA label based on link destination — BioBlix product voice. */
export function bioBlixLinkCtaLabel(
  url: string,
  locale: AppLocale = 'en'
): string {
  const t = (key: MessageKey) => translate(locale, key);
  const lower = url.toLowerCase();
  if (
    lower.includes('apps.apple.com') ||
    lower.includes('play.google.com') ||
    lower.includes('appstore') ||
    lower.includes('/app')
  ) {
    return t('link.openApp');
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('cart')) {
    return t('link.buyHere');
  }
  return t('link.seeProduct');
}
