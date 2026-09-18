import { useCallback, useEffect, useState } from 'react';

import {
  configureRevenueCat,
  hasProYearlyEntitlement,
} from '@/lib/revenuecat';

/**
 * Tracks whether the current RevenueCat user has the `pro_yearly` entitlement.
 */
export function useProYearlyEntitlement(appUserId?: string | null) {
  const [isProYearly, setIsProYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await configureRevenueCat(appUserId);
      const entitled = await hasProYearlyEntitlement();
      setIsProYearly(entitled);
    } catch {
      setIsProYearly(false);
    } finally {
      setLoading(false);
    }
  }, [appUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isProYearly, loading, refresh };
}
