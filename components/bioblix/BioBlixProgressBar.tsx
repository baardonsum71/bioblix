import { StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';

type BioBlixProgressBarProps = {
  /** 1-based current step */
  step: 1 | 2 | 3;
  total?: 3;
};

/**
 * Thin signup progress bar — shows the funnel is short.
 */
export function BioBlixProgressBar({
  step,
  total = 3,
}: BioBlixProgressBarProps) {
  const { t } = useI18n();
  const labels = [
    t('signup.step1'),
    t('signup.step2'),
    t('signup.step3'),
  ];
  const pct = Math.max(0, Math.min(1, step / total));

  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <BioBlixText variant="caption" color={BioBlixPalette.muted} style={styles.label}>
        {t('signup.progress', { step, total })} · {labels[step - 1]}
      </BioBlixText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 8,
    width: '100%',
  },
  track: {
    height: 4,
    borderRadius: BioBlixRadii.pill,
    backgroundColor: BioBlixPalette.hairline,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BioBlixRadii.pill,
    backgroundColor: BioBlixPalette.aurora,
  },
  label: {
    textAlign: 'center',
  },
});
