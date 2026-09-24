import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';

import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';

/** About sheet — unique BioBlix positioning (helps App Store differentiation). */
export default function BioBlixAboutModal() {
  return (
    <BioBlixScreenShell style={styles.container}>
      <BioBlixLogo variant="wordmark" size={120} />
      <BioBlixText variant="title" style={styles.tagline}>
        {BioBlixBrand.tagline}
      </BioBlixText>
      <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.copy}>
        {BioBlixBrand.shortDescription}
      </BioBlixText>
      <View style={styles.card}>
        <BioBlixText variant="label" color={BioBlixPalette.cyan}>
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
      <Link href="/privacy" style={styles.privacyLink}>
        <BioBlixText variant="label" color={BioBlixPalette.magenta}>
          Les personvernerklæringen
        </BioBlixText>
      </Link>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
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
  privacyLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
});
