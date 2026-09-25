import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { BioBlixPalette } from '@/constants/bioblixTheme';

/**
 * OAuth redirect landing (Expo AuthSession / deep link `…/sso-callback`).
 * Session is usually finalized inside `useSSO`; this route just routes onward.
 */
export default function SsoCallbackScreen() {
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

  return <Redirect href="/(auth)/sign-in" />;
}
