import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixBrand, BioBlixPalette, BioBlixSpacing } from '@/constants/bioblixTheme';
import {
  getPrivacyPolicy,
  privacyPolicyMeta,
} from '@/constants/privacyPolicy';
import { useI18n } from '@/lib/i18n';

/**
 * Privacy policy for BioBlix app + web.
 */
export default function BioBlixPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { t, locale } = useI18n();
  const policy = getPrivacyPolicy(locale);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('nav.privacy'),
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
        <BioBlixText variant="display">{t('privacy.title')}</BioBlixText>
        <BioBlixText variant="caption" color={BioBlixPalette.muted} style={styles.meta}>
          {t('privacy.updated', { date: policy.lastUpdated })}
        </BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.fog} style={styles.intro}>
          {t('privacy.intro', { email: privacyPolicyMeta.contactEmail })}
        </BioBlixText>

        {policy.sections.map((section) => (
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
            © {new Date().getFullYear()} {BioBlixBrand.name}. {t('privacy.rights')}
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
