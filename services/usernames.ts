import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { COLLECTIONS, db } from '@/lib/firebase';
import {
  isReservedHandle,
  isValidHandle,
  sanitizeHandle,
} from '@/lib/validation/handle';

function usernameDoc(handle: string) {
  return doc(db, COLLECTIONS.usernames, handle);
}

export class UsernameTakenError extends Error {
  constructor(handle: string) {
    super(`Username taken: ${handle}`);
    this.name = 'UsernameTakenError';
  }
}

/**
 * True when `usernames/{handle}` does not exist (and handle is valid).
 * Public read — used on the landing claim box before Auth.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const nick = sanitizeHandle(username);
  if (!isValidHandle(nick) || isReservedHandle(nick)) return false;
  const snap = await getDoc(usernameDoc(nick));
  return !snap.exists();
}

/** Look up which userId owns a handle, if any. */
export async function getUidForHandle(handle: string): Promise<string | null> {
  const nick = sanitizeHandle(handle);
  if (!isValidHandle(nick)) return null;
  const snap = await getDoc(usernameDoc(nick));
  if (!snap.exists()) return null;
  const uid = snap.data()?.uid;
  return typeof uid === 'string' && uid ? uid : null;
}

/**
 * Lock a vanity handle for the signed-in Firebase/Clerk uid.
 * Safe to call repeatedly for the same owner; throws if owned by someone else.
 */
export async function claimUsername(
  userId: string,
  username: string
): Promise<string> {
  const nick = sanitizeHandle(username);
  if (!isValidHandle(nick) || isReservedHandle(nick)) {
    throw new Error('Invalid username');
  }

  const ref = usernameDoc(nick);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const owner = snap.data()?.uid;
    if (owner === userId) return nick;
    throw new UsernameTakenError(nick);
  }

  // Document id uniqueness + rules `create` = atomic lock against races.
  await setDoc(ref, {
    uid: userId,
    createdAt: serverTimestamp(),
  });

  return nick;
}
