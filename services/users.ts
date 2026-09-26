import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore';

import type { CreateUserInput, UpdateUserInput, User } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';

function usersRef() {
  return collection(db, COLLECTIONS.users);
}

function userDoc(userId: string) {
  return doc(db, COLLECTIONS.users, userId);
}

function mapUser(id: string, data: DocumentData): User {
  return {
    id,
    clerkId: data.clerkId,
    email: data.email,
    displayName: data.displayName,
    imageUrl: data.imageUrl ?? null,
    subscriptionTier: data.subscriptionTier ?? 'standard',
    isProYearly: data.isProYearly === true,
    blockedUsers: Array.isArray(data.blockedUsers) ? data.blockedUsers : [],
    revenueCatAppUserId: data.revenueCatAppUserId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** Create or overwrite a user profile (doc id = Clerk user id). */
export async function upsertUser(
  userId: string,
  input: CreateUserInput
): Promise<void> {
  const ref = userDoc(userId);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    // Never overwrite avatar from Clerk sync — users set imageUrl via updateUser.
    await updateDoc(ref, {
      email: input.email,
      displayName: input.displayName,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(ref, {
    clerkId: input.clerkId,
    email: input.email,
    displayName: input.displayName,
    imageUrl: input.imageUrl ?? null,
    subscriptionTier: input.subscriptionTier ?? 'standard',
    isProYearly: false,
    blockedUsers: [],
    revenueCatAppUserId: input.revenueCatAppUserId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserById(userId: string): Promise<User | null> {
  const snap = await getDoc(userDoc(userId));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data());
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<void> {
  await updateDoc(userDoc(userId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/** Whether the user may attach `linkUrl` on posts (Firestore mirror of RC). */
export async function userCanAddLinks(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.isProYearly === true;
}

/** Persist a block so the author disappears from the viewer's feed. */
export async function blockUser(
  viewerId: string,
  blockedUserId: string
): Promise<void> {
  if (viewerId === blockedUserId) {
    throw new Error('Du kan ikke blokkere deg selv.');
  }

  const ref = userDoc(viewerId);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    await setDoc(
      ref,
      {
        clerkId: viewerId,
        email: '',
        displayName: 'BioBlix-bruker',
        imageUrl: null,
        subscriptionTier: 'standard',
        isProYearly: false,
        blockedUsers: [blockedUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  await updateDoc(ref, {
    blockedUsers: arrayUnion(blockedUserId),
    updatedAt: serverTimestamp(),
  });
}

export async function getBlockedUserIds(viewerId: string): Promise<string[]> {
  const user = await getUserById(viewerId);
  return user?.blockedUsers ?? [];
}

export async function listUsers(max = 50): Promise<User[]> {
  const q = query(usersRef(), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapUser(d.id, d.data()));
}
