import Head from 'expo-router/head';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { BioBlixPublicProfile } from '@/components/bioblix/BioBlixPublicProfile';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';
import { buildProfileSeo, type SeoLocale } from '@/lib/seo/profileMeta';
import {
  isReservedHandle,
  isValidHandle,
  sanitizeHandle,
} from '@/lib/validation/handle';
import { getUserByHandle } from '@/services/users';

/**
 * Vanity profile: bioblix.com/{handle}
 * Renders the public profile in place (no redirect) so Google indexes the clean URL.
 */
export default function VanityHandleScreen() {
  const { handle: raw } = useLocalSearchParams<{ handle: string }>();
  const { t, locale } = useI18n();
  const seoLocale: SeoLocale = locale === 'en' ? 'en' : 'nb';
  const handle = sanitizeHandle(typeof raw === 'string' ? raw : '');
  const [userId, setUserId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!isValidHandle(handle) || isReservedHandle(handle)) {
      setMissing(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const user = await getUserByHandle(handle);
        if (cancelled) return;
        if (user) setUserId(user.id);
        else setMissing(true);
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (userId) {
    return <BioBlixPublicProfile userId={userId} />;
  }

  const pendingSeo = handle
    ? buildProfileSeo({
        userId: handle,
        displayName: handle,
        locale: seoLocale,
      })
    : null;

  return (
    <BioBlixScreenShell
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {pendingSeo ? (
        <Head>
          <title>{pendingSeo.title}</title>
          <meta name="description" content={pendingSeo.description} />
          <meta property="og:title" content={`${handle} på ${BioBlixBrand.name}`} />
          <meta property="og:description" content={pendingSeo.description} />
        </Head>
      ) : null}
      {missing ? (
        <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
          <BioBlixText variant="title">{t('profile.notFound')}</BioBlixText>
          <BioBlixText variant="caption" color={BioBlixPalette.muted}>
            bioblix.com/{handle || '…'}
          </BioBlixText>
        </View>
      ) : (
        <ActivityIndicator color={BioBlixPalette.aurora} />
      )}
    </BioBlixScreenShell>
  );
}
