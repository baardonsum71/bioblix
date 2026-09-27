import { ScrollView, StyleSheet } from 'react-native';

import { BioBlixGoLive } from '@/components/bioblix/BioBlixGoLive';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette, BioBlixSpacing } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';

export default function GoLiveScreen() {
  const { t } = useI18n();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <BioBlixText variant="label" color={BioBlixPalette.aurora}>
        {BioBlixBrand.name}
      </BioBlixText>
      <BioBlixText variant="display">{t('live.goLive')}</BioBlixText>
      <BioBlixGoLive />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
  },
  content: {
    padding: BioBlixSpacing.xl,
    gap: 12,
    paddingBottom: 48,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
});
