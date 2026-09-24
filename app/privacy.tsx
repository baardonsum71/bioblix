import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette, BioBlixSpacing } from '@/constants/bioblixTheme';
import {
  privacyPolicyMeta,
  privacyPolicySections,
} from '@/constants/privacyPolicy';

/**
 * Personvernerklæring for BioBlix app + web.
 * Web: https://<domain>/privacy (bruk denne URL-en i App Store / Play).
 */
export default function BioBlixPrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Personvern',
          headerShown: true,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 28) + 24 },
        ]}
      >
        <BioBlixText variant="label" color={BioBlixPalette.aurora}>
          {BioBlixBrand.name}
        </BioBlixText>
        <BioBlixText variant="display">Personvernerklæring</BioBlixText>
        <BioBlixText variant="caption" color={BioBlixPalette.muted} style={styles.meta}>
          Sist oppdatert: {privacyPolicyMeta.lastUpdated}
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.fog} style={styles.intro}>
          Gjelder BioBlix på iOS, Android og web. Kontakt:{' '}
          {privacyPolicyMeta.contactEmail}
        </BioBlixText>

        {privacyPolicySections.map((section) => (
          <View key={section.title} style={styles.section}>
            <BioBlixText variant="title" style={styles.sectionTitle}>
              {section.title}
            </BioBlixText>
            {section.paragraphs.map((paragraph) => (
              <BioBlixText
                key={paragraph.slice(0, 48)}
                variant="body"
                color={BioBlixPalette.fog}
                style={styles.paragraph}
              >
                {paragraph}
              </BioBlixText>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <BioBlixText variant="caption" color={BioBlixPalette.muted}>
            © {new Date().getFullYear()} {BioBlixBrand.name}. Alle rettigheter
            forbeholdt.
          </BioBlixText>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
  },
  content: {
    paddingHorizontal: BioBlixSpacing.xl,
    paddingTop: BioBlixSpacing.lg,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  meta: {
    marginTop: 4,
  },
  intro: {
    marginTop: 8,
    marginBottom: 16,
  },
  section: {
    marginTop: 18,
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: BioBlixPalette.panel,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  paragraph: {
    lineHeight: 24,
  },
  footer: {
    marginTop: 28,
    paddingVertical: 12,
  },
});
