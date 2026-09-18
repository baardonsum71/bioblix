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

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

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
    <BioBlixProviders>
      <StatusBar style="light" />
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
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Om BioBlix',
          }}
        />
      </Stack>
    </BioBlixProviders>
  );
}
