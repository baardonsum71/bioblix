import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';

import { apiUrl } from '@/lib/apiBase';
import { firebaseAuth } from '@/lib/firebase/auth';

/**
 * Exchange a Clerk session JWT for a Firebase custom token, then sign in.
 * Required so Firestore rules see `request.auth.uid` == Clerk user id.
 */
export async function syncFirebaseAuthFromClerk(
  getClerkToken: () => Promise<string | null>
): Promise<FirebaseUser> {
  const clerkJwt = await getClerkToken();
  if (!clerkJwt) {
    throw new Error('Mangler Clerk-sesjonstoken');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  let res: Response;
  try {
    res = await fetch(apiUrl('/api/clerk-firebase-token'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clerkJwt}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Firebase-token tok for lang tid (20s). Prøv igjen.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const raw = await res.text();
    let message = `Firebase-token feilet (${res.status})`;
    try {
      const body = JSON.parse(raw) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      if (raw.trim()) message = `${message}: ${raw.slice(0, 180)}`;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error('Tom Firebase-token fra server');
  }

  const credential = await signInWithCustomToken(firebaseAuth, data.token);
  return credential.user;
}

export async function clearFirebaseAuth(): Promise<void> {
  if (firebaseAuth.currentUser) {
    await firebaseSignOut(firebaseAuth);
  }
}

export function waitForFirebaseUser(
  timeoutMs = 8_000
): Promise<FirebaseUser | null> {
  if (firebaseAuth.currentUser) {
    return Promise.resolve(firebaseAuth.currentUser);
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(firebaseAuth.currentUser);
    }, timeoutMs);

    const unsub = onAuthStateChanged(firebaseAuth, (user: FirebaseUser | null) => {
      if (user) {
        clearTimeout(timer);
        unsub();
        resolve(user);
      }
    });
  });
}
