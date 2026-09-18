import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform } from 'react-native';

import { Brand, Colors } from '@/constants/Colors';
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

/**
 * Show App Store / Play-required external-navigation disclaimer, then open.
 */
export function confirmAndOpenBioBlixLink(url: string): void {
  const href = normalizeUrl(url);
  const domain = extractLinkDomain(href);

  Alert.alert(
    `Du forlater nå ${Brand.name}`,
    `Vær oppmerksom på at ${Brand.name} ikke er ansvarlig for innholdet på eksterne nettsteder. Vil du fortsette til ${domain}?`,
    [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Fortsett',
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
export function bioBlixLinkCtaLabel(url: string): string {
  const lower = url.toLowerCase();
  if (
    lower.includes('apps.apple.com') ||
    lower.includes('play.google.com') ||
    lower.includes('appstore') ||
    lower.includes('/app')
  ) {
    return 'Åpne appen';
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('cart')) {
    return 'Kjøp her';
  }
  return 'Se produktet';
}
