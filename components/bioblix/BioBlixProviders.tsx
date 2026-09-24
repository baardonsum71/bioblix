import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';

import { useEnsureUserProfile } from '@/hooks/useEnsureUserProfile';
import { configureRevenueCat } from '@/lib/revenuecat';

type BioBlixProvidersProps = {
  children: ReactNode;
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
export const isClerkConfigured = Boolean(publishableKey);

const AppUserIdContext = createContext<string | null>(
  process.env.EXPO_PUBLIC_DEV_USER_ID ?? null
);

export function useAppUserIdContext(): string | null {
  return useContext(AppUserIdContext);
}

function RevenueCatBridge({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  useEffect(() => {
    void configureRevenueCat(userId);
  }, [userId]);
  return <>{children}</>;
}

function ClerkSessionInner({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  useEnsureUserProfile();

  const resolvedId =
    isLoaded && isSignedIn && userId
      ? userId
      : (process.env.EXPO_PUBLIC_DEV_USER_ID ?? null);

  return (
    <AppUserIdContext.Provider value={resolvedId}>
      <RevenueCatBridge userId={resolvedId}>{children}</RevenueCatBridge>
    </AppUserIdContext.Provider>
  );
}

export function BioBlixProviders({ children }: BioBlixProvidersProps) {
  if (!publishableKey) {
    console.warn(
      '[clerk] Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — auth screens will not work until it is set.'
    );
    const devId = process.env.EXPO_PUBLIC_DEV_USER_ID ?? null;
    return (
      <AppUserIdContext.Provider value={devId}>
        <RevenueCatBridge userId={devId}>{children}</RevenueCatBridge>
      </AppUserIdContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkSessionInner>{children}</ClerkSessionInner>
    </ClerkProvider>
  );
}
