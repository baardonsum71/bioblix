import { useEffect, type ReactNode } from 'react';

import { useAppUserId } from '@/hooks/useAppUserId';
import { configureRevenueCat } from '@/lib/revenuecat';

type BioBlixProvidersProps = {
  children: ReactNode;
};

export function BioBlixProviders({ children }: BioBlixProvidersProps) {
  const appUserId = useAppUserId();

  useEffect(() => {
    void configureRevenueCat(appUserId);
  }, [appUserId]);

  // TODO: wrap with ClerkProvider when publishable key is available
  return <>{children}</>;
}
