import { Redirect, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';
import {
  isReservedHandle,
  isValidHandle,
  sanitizeHandle,
} from '@/lib/validation/handle';
import { getUserByHandle } from '@/services/users';

/**
 * Vanity profile: bioblix.com/{handle} → /u/{userId}
 * Reserved app paths are ignored by more-specific Expo Router routes.
 */
export default function VanityHandleScreen() {
  const { handle: raw } = useLocalSearchParams<{ handle: string }>();
  const { t } = useI18n();
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
    return <Redirect href={`/u/${encodeURIComponent(userId)}` as Href} />;
  }

  return (
    <BioBlixScreenShell
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
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
