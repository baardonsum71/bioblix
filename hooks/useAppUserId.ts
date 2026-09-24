/**
 * Active BioBlix user id: Clerk user id when signed in,
 * otherwise optional EXPO_PUBLIC_DEV_USER_ID for local tooling.
 */
import { useAppUserIdContext } from '@/components/bioblix/BioBlixProviders';

export function useAppUserId(): string | null {
  return useAppUserIdContext();
}
