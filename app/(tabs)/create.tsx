import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import BioBlixUpload from '@/components/bioblix/BioBlixUpload';
import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import { BioBlixPalette } from '@/constants/bioblixTheme';

export default function BioBlixUploadTab() {
  if (!isClerkConfigured) {
    return <BioBlixUpload />;
  }
  return <BioBlixUploadGuarded />;
}

function BioBlixUploadGuarded() {
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

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <BioBlixUpload />;
}
