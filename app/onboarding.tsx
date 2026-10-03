import { useAuth } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixProgressBar } from '@/components/bioblix/BioBlixProgressBar';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import {
  BioBlixGradient,
  BioBlixGlow,
  BioBlixPalette,
  BioBlixRadii,
  BioBlixSpacing,
} from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/dictionaries';
import { notify } from '@/lib/platform';
import { getUserById, updateUser } from '@/services/users';
import type { BioBlixAudience } from '@/types/user';

const OPTIONS: {
  id: BioBlixAudience;
  labelKey: MessageKey;
  icon: string;
}[] = [
  {
    id: 'influencer',
    labelKey: 'onboarding.audience.influencer',
    icon: '📱',
  },
  {
    id: 'gamer',
    labelKey: 'onboarding.audience.gamer',
    icon: '🎮',
  },
  {
    id: 'student',
    labelKey: 'onboarding.audience.student',
    icon: '🎓',
  },
  {
    id: 'business',
    labelKey: 'onboarding.audience.business',
    icon: '💼',
  },
];

/**
 * Signup step 3 — pick audience(s), then land on empty public profile.
 */
export default function OnboardingScreen() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [selected, setSelected] = useState<BioBlixAudience[]>([]);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const user = await getUserById(userId);
        if (cancelled) return;
        if (user?.audiences && user.audiences.length > 0) {
          router.replace(`/u/${encodeURIComponent(userId)}` as Href);
          return;
        }
      } catch {
        /* show onboarding */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, router]);

  const toggle = useCallback((id: BioBlixAudience) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const finish = useCallback(async () => {
    if (!userId || selected.length === 0) {
      notify(t('common.error'), t('onboarding.pickOne'));
      return;
    }
    setBusy(true);
    try {
      await updateUser(userId, { audiences: selected });
      router.replace(`/u/${encodeURIComponent(userId)}` as Href);
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setBusy(false);
    }
  }, [userId, selected, router, t]);

  if (!isLoaded || checking) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <ActivityIndicator color={BioBlixPalette.aurora} />
      </BioBlixScreenShell>
    );
  }

  if (!isSignedIn || !userId) {
    return <Redirect href="/(auth)/sign-in?reason=publish" />;
  }

  return (
    <BioBlixScreenShell>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <BioBlixProgressBar step={3} />
        <BioBlixLogo variant="wordmark" size={72} />
        <BioBlixText variant="display" style={styles.title}>
          {t('onboarding.headline')}
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.muted}>
          {t('onboarding.sub')}
        </BioBlixText>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const on = selected.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                onPress={() => toggle(opt.id)}
                style={[styles.option, on && styles.optionOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <BioBlixText variant="title">{opt.icon}</BioBlixText>
                <BioBlixText
                  variant="label"
                  color={on ? BioBlixPalette.night : BioBlixPalette.ice}
                >
                  {t(opt.labelKey)}
                </BioBlixText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.ctaWrap, selected.length === 0 && styles.ctaDisabled]}
          onPress={() => void finish()}
          disabled={busy || selected.length === 0}
        >
          <LinearGradient
            colors={[...BioBlixGradient.colors]}
            locations={[...BioBlixGradient.locations]}
            start={BioBlixGradient.start}
            end={BioBlixGradient.end}
            style={[styles.cta, BioBlixGlow.cta]}
          >
            <BioBlixText variant="label" color={BioBlixPalette.night}>
              {busy ? t('common.loading') : t('onboarding.cta')}
            </BioBlixText>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    gap: BioBlixSpacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    marginTop: 8,
  },
  options: {
    gap: 10,
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    backgroundColor: BioBlixPalette.panel,
  },
  optionOn: {
    backgroundColor: BioBlixPalette.aurora,
    borderColor: BioBlixPalette.aurora,
  },
  ctaWrap: {
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
    marginTop: 12,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  cta: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
