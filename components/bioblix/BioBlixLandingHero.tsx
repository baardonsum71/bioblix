import { Link, useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import {
  BioBlixGradient,
  BioBlixPalette,
  BioBlixRadii,
  BioBlixSpacing,
} from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';

/**
 * Guest landing — value hook + claim-handle CTA before tabs feel empty.
 */
export function BioBlixLandingHero({
  onBrowseFeed,
}: {
  onBrowseFeed?: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const claim = () => {
    const nick = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (nick.length < 3) {
      setError(t('landing.handleShort'));
      return;
    }
    setError(null);
    router.push(`/(auth)/sign-in?reason=publish&nick=${encodeURIComponent(nick)}` as Href);
  };

  return (
    <BioBlixScreenShell>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <BioBlixLogo variant="wordmark" size={88} />
        <BioBlixText variant="display" style={styles.headline}>
          {t('landing.headline')}
        </BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.sub}>
          {t('landing.sub')}
        </BioBlixText>

        <View style={styles.demoCard}>
          <View style={styles.demoAvatar}>
            <BioBlixText variant="title" color={Colors.ink}>
              B
            </BioBlixText>
          </View>
          <View style={styles.demoBody}>
            <BioBlixText variant="label" color={Colors.lime}>
              @{t('landing.demoHandle')}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('landing.demoLine')}
            </BioBlixText>
            <View style={styles.demoLink}>
              <BioBlixText variant="caption" color={Colors.ink}>
                Instagram
              </BioBlixText>
            </View>
            <View style={styles.demoLink}>
              <BioBlixText variant="caption" color={Colors.ink}>
                {t('landing.demoShop')}
              </BioBlixText>
            </View>
          </View>
        </View>

        <BioBlixText variant="label" color={Colors.mistDim}>
          {t('landing.claimLabel')}
        </BioBlixText>
        <View style={styles.claimRow}>
          <BioBlixText variant="body" color={Colors.mistDim}>
            bioblix.com/
          </BioBlixText>
          <TextInput
            value={handle}
            onChangeText={(v) => {
              setHandle(v.replace(/\s+/g, '').toLowerCase());
              setError(null);
            }}
            placeholder={t('landing.handlePlaceholder')}
            placeholderTextColor={Colors.mistDim}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.claimInput}
            maxLength={24}
          />
        </View>
        {error ? (
          <BioBlixText variant="caption" color={BioBlixPalette.danger}>
            {error}
          </BioBlixText>
        ) : null}

        <Pressable style={styles.primaryWrap} onPress={claim}>
          <LinearGradient
            colors={[...BioBlixGradient.colors]}
            locations={[...BioBlixGradient.locations]}
            start={BioBlixGradient.start}
            end={BioBlixGradient.end}
            style={styles.primaryBtn}
          >
            <BioBlixText variant="label" color={Colors.ink}>
              {t('landing.claimCta')}
            </BioBlixText>
          </LinearGradient>
        </Pressable>

        <Link href="/(auth)/sign-in?reason=publish" asChild>
          <Pressable style={styles.secondaryBtn}>
            <BioBlixText variant="label" color={Colors.lime}>
              {t('auth.createFreeProfile')}
            </BioBlixText>
          </Pressable>
        </Link>

        {onBrowseFeed ? (
          <Pressable onPress={onBrowseFeed} style={styles.browseBtn}>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('landing.browseFeed')}
            </BioBlixText>
          </Pressable>
        ) : null}
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 48,
    gap: BioBlixSpacing.sm,
  },
  headline: {
    marginTop: 8,
    maxWidth: 420,
  },
  sub: {
    maxWidth: 420,
    marginBottom: 8,
  },
  demoCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: BioBlixRadii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
    marginVertical: 8,
  },
  demoAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  demoBody: {
    flex: 1,
    gap: 6,
  },
  demoLink: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    backgroundColor: Colors.surface,
  },
  claimInput: {
    flex: 1,
    color: Colors.mist,
    fontSize: 16,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  primaryWrap: {
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryBtn: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
  },
  browseBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
