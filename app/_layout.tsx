import {
  DMSans_400Regular,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Syne_700Bold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { BioBlixProviders } from '@/components/bioblix/BioBlixProviders';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { I18nProvider, useI18n } from '@/lib/i18n';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { t } = useI18n();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: BioBlixPalette.night },
        headerStyle: { backgroundColor: BioBlixPalette.night },
        headerTintColor: BioBlixPalette.fog,
        headerTitleStyle: { fontFamily: 'Syne_700Bold' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="privacy"
        options={{
          title: t('nav.privacy'),
          headerBackTitle: t('nav.back'),
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: t('nav.about'),
        }}
      />
      <Stack.Screen
        name="tags/index"
        options={{
          title: t('nav.tags'),
          headerBackTitle: t('nav.back'),
        }}
      />
      <Stack.Screen
        name="tags/[tag]"
        options={{
          title: t('nav.tag'),
          headerBackTitle: t('nav.tags'),
        }}
      />
      <Stack.Screen
        name="u/[userId]"
        options={{
          title: t('nav.profile'),
          headerBackTitle: t('nav.back'),
        }}
      />
      <Stack.Screen
        name="live/go"
        options={{
          title: t('live.goLive'),
          headerBackTitle: t('nav.back'),
        }}
      />
    </Stack>
  );
}

export default function BioBlixRootLayout() {
  const [loaded, error] = useFonts({
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: BioBlixPalette.night }} />;
  }

  return (
    <I18nProvider>
      <BioBlixProviders>
        <StatusBar style="light" />
        <RootStack />
      </BioBlixProviders>
    </I18nProvider>
  );
}
