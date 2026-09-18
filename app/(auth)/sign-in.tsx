import { StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';

export default function BioBlixSignInScreen() {
  return (
    <View style={styles.container}>
      <BioBlixText variant="label" color={BioBlixPalette.aurora}>
        {BioBlixBrand.name}
      </BioBlixText>
      <BioBlixText variant="display">Velkommen inn</BioBlixText>
      <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.copy}>
        Logg inn for å publisere produkt-blix og synce Pro-status. Clerk-auth
        kobles hit i neste steg.
      </BioBlixText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  copy: {
    maxWidth: 360,
  },
});
