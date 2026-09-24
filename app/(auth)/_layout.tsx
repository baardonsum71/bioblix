import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import { BioBlixPalette } from '@/constants/bioblixTheme';

export default function AuthLayout() {
  if (!isClerkConfigured) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" />
      </Stack>
    );
  }

  return <AuthLayoutGuarded />;
}

function AuthLayoutGuarded() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BioBlixPalette.night,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={BioBlixPalette.aurora} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
