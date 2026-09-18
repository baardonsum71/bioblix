/**
 * Example: call this from the client AFTER a successful RevenueCat purchase
 * if you want to wait for Firestore `isProYearly` (webhook may take a second).
 *
 * Prefer the webhook as source of truth — this only polls the user doc.
 */
import { doc, onSnapshot } from 'firebase/firestore';

import { COLLECTIONS, db } from '@/lib/firebase';

export function watchIsProYearly(
  userId: string,
  onChange: (isProYearly: boolean) => void
): () => void {
  const ref = doc(db, COLLECTIONS.users, userId);
  return onSnapshot(ref, (snap) => {
    onChange(snap.data()?.isProYearly === true);
  });
}
