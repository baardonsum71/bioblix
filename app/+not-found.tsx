import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';

export default function BioBlixNotFoundScreen() {
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View style={styles.container}>
        <BioBlixText variant="display" color={BioBlixPalette.aurora}>
          404
        </BioBlixText>
        <BioBlixText variant="title" style={styles.title}>
          {t('notFound.title')} · {BioBlixBrand.name}
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.body}>
          {t('notFound.body')}
        </BioBlixText>
        <Link href="/" style={styles.link}>
          <BioBlixText variant="label" color={BioBlixPalette.night}>
            {t('tabs.blix')}
          </BioBlixText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: BioBlixPalette.night,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    maxWidth: 320,
  },
  link: {
    marginTop: 12,
    backgroundColor: BioBlixPalette.aurora,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
});
