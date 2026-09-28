import { useAuth } from '@clerk/expo';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { BioBlixCreateProfileGate } from '@/components/bioblix/BioBlixCreateProfileGate';
import { BioBlixGoLive } from '@/components/bioblix/BioBlixGoLive';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import { BioBlixBrand, BioBlixPalette, BioBlixSpacing } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';

export default function GoLiveScreen() {
  if (!isClerkConfigured) {
    return <GoLiveBody />;
  }

  return <GoLiveGuarded />;
}

function GoLiveGuarded() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={BioBlixPalette.aurora} />
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <BioBlixCreateProfileGate
        reason="live"
        titleKey="upload.gateLiveTitle"
      />
    );
  }

  return <GoLiveBody />;
}

function GoLiveBody() {
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
  loading: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
