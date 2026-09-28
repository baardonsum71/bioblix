import { Link, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import {
  BioBlixGradient,
  BioBlixRadii,
} from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import {
  signInHref,
  signInReasonBodyKey,
  type SignInReason,
} from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/dictionaries';

type BioBlixCreateProfileGateProps = {
  reason: SignInReason;
  titleKey?: MessageKey;
  bodyKey?: MessageKey;
};

/**
 * Soft gate for guests who hit an ownership action (publish / live).
 * Browse stays open; this only appears when they try to create.
 */
export function BioBlixCreateProfileGate({
  reason,
  titleKey = 'upload.gateTitle',
  bodyKey,
}: BioBlixCreateProfileGateProps) {
  const { t } = useI18n();
  const body = bodyKey ?? signInReasonBodyKey(reason);

  return (
    <BioBlixScreenShell>
      <View style={styles.pad}>
        <BioBlixLogo variant="wordmark" size={96} />
        <BioBlixText variant="display">{t(titleKey)}</BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
          {t(body)}
        </BioBlixText>
        <Link href={signInHref(reason) as Href} asChild>
          <Pressable style={styles.primaryWrap}>
            <LinearGradient
              colors={[...BioBlixGradient.colors]}
              locations={[...BioBlixGradient.locations]}
              start={BioBlixGradient.start}
              end={BioBlixGradient.end}
              style={styles.primaryLink}
            >
              <BioBlixText variant="label" color={Colors.ink}>
                {t('auth.createFreeProfile')}
              </BioBlixText>
            </LinearGradient>
          </Pressable>
        </Link>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {t('auth.freeStandardNote')}
        </BioBlixText>
      </View>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
    gap: 12,
  },
  lead: {
    marginBottom: 8,
    maxWidth: 420,
  },
  primaryWrap: {
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
    alignSelf: 'stretch',
    maxWidth: 420,
  },
  primaryLink: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
});
