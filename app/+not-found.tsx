import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';

export default function BioBlixNotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ute av kurs' }} />
      <View style={styles.container}>
        <BioBlixText variant="display" color={BioBlixPalette.aurora}>
          404
        </BioBlixText>
        <BioBlixText variant="title" style={styles.title}>
          Denne siden finnes ikke i {BioBlixBrand.name}
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.body}>
          Gå tilbake til blix-strømmen og fortsett å utforske produkter.
        </BioBlixText>
        <Link href="/" style={styles.link}>
          <BioBlixText variant="label" color={BioBlixPalette.night}>
            Til blix-feeden
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
