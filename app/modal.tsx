import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';

/** About sheet — unique BioBlix positioning (helps App Store differentiation). */
export default function BioBlixAboutModal() {
  return (
    <View style={styles.container}>
      <BioBlixText variant="display" color={BioBlixPalette.aurora}>
        {BioBlixBrand.name}
      </BioBlixText>
      <BioBlixText variant="title" style={styles.tagline}>
        {BioBlixBrand.tagline}
      </BioBlixText>
      <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.copy}>
        {BioBlixBrand.shortDescription}
      </BioBlixText>
      <View style={styles.card}>
        <BioBlixText variant="label" color={BioBlixPalette.aurora}>
          Hva gjør BioBlix annerledes
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.fog} style={styles.bullet}>
          Vertikale produkt-blix laget for apper og fysiske varer — ikke generisk
          sosial scrolling.
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.fog} style={styles.bullet}>
          Pro Årlig låser opp klikkbare butikklenker, speilet sikkert via
          RevenueCat → Firestore.
        </BioBlixText>
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    padding: 28,
    gap: 14,
    justifyContent: 'center',
  },
  tagline: {
    maxWidth: 340,
  },
  copy: {
    maxWidth: 360,
  },
  card: {
    marginTop: 12,
    backgroundColor: BioBlixPalette.panel,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
  },
  bullet: {
    lineHeight: 22,
  },
});
