import { useAuth, useClerk, useSignIn, useSignUp } from '@clerk/expo';
import { Redirect, type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { BioBlixPalette } from '@/constants/bioblixTheme';

function goToProfile(
  router: ReturnType<typeof useRouter>,
  decorateUrl: (url: string) => string
) {
  const url = decorateUrl('/profile');
  if (url.startsWith('http') && Platform.OS === 'web') {
    window.location.href = url;
    return;
  }
  router.replace('/(tabs)/profile' as Href);
}

/**
 * OAuth redirect landing after Apple/Google SSO.
 * Completes transfer / finalize when the IdP returns here.
 */
export default function SsoCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !clerk.loaded || ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              goToProfile(router, decorateUrl);
            },
          });
          return;
        }

        if (signUp.isTransferable) {
          await signIn.create({ transfer: true });
          if (signIn.status === 'complete') {
            await signIn.finalize({
              navigate: async ({ session, decorateUrl }) => {
                if (session?.currentTask) return;
                goToProfile(router, decorateUrl);
              },
            });
            return;
          }
        }

        if (signIn.isTransferable) {
          await signUp.create({
            transfer: true,
            unsafeMetadata: {
              acceptedPrivacyAt: new Date().toISOString(),
            },
          });
          if (signUp.status === 'complete') {
            await signUp.finalize({
              navigate: async ({ session, decorateUrl }) => {
                if (session?.currentTask) return;
                goToProfile(router, decorateUrl);
              },
            });
            return;
          }
          // Still missing info — back to sign-in (should be rare with names off).
          router.replace('/(auth)/sign-in' as Href);
          return;
        }

        if (signUp.status === 'complete') {
          await signUp.finalize({
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              goToProfile(router, decorateUrl);
            },
          });
          return;
        }

        const sessionId =
          signIn.existingSession?.sessionId ??
          signUp.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: async ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              goToProfile(router, decorateUrl);
            },
          });
          return;
        }

        router.replace('/(auth)/sign-in' as Href);
      } catch {
        router.replace('/(auth)/sign-in' as Href);
      }
    })();
  }, [isLoaded, clerk, signIn, signUp, router]);

  if (isSignedIn) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BioBlixPalette.night,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View nativeID="clerk-captcha" />
      <ActivityIndicator color={BioBlixPalette.aurora} />
    </View>
  );
}
