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

function coinProUntilFromData(data: DocumentData): User['coinProUntil'] {
  const raw = data.coinProUntil;
  if (!raw) return null;
  return raw as User['coinProUntil'];
}

function mapUser(id: string, data: DocumentData): User {
  return {
    id,
    clerkId: data.clerkId,
    email: data.email,
    displayName: data.displayName,
    imageUrl: data.imageUrl ?? null,
    birthDate:
      typeof data.birthDate === 'string' && data.birthDate.trim()
        ? data.birthDate.trim()
        : null,
    countryCode:
      typeof data.countryCode === 'string' && data.countryCode.trim()
        ? data.countryCode.trim().toUpperCase()
        : null,
    subscriptionTier: data.subscriptionTier ?? 'standard',
    isProYearly: data.isProYearly === true,
    coins: typeof data.coins === 'number' ? data.coins : 0,
    coinsSignupBonusGranted: data.coinsSignupBonusGranted === true,
    coinProUntil: coinProUntilFromData(data),
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
    const patch: Record<string, unknown> = {
      email: input.email,
      displayName: input.displayName,
      updatedAt: serverTimestamp(),
    };
    // Only set birthDate if missing and we have a value from Clerk metadata.
    if (input.birthDate && !existing.data()?.birthDate) {
      patch.birthDate = input.birthDate;
    }
    if (input.countryCode) {
      patch.countryCode = input.countryCode;
    }
    await updateDoc(ref, patch);
    return;
  }

  await setDoc(ref, {
    clerkId: input.clerkId,
    email: input.email,
    displayName: input.displayName,
    imageUrl: input.imageUrl ?? null,
    birthDate: input.birthDate ?? null,
    countryCode: input.countryCode ?? null,
    subscriptionTier: input.subscriptionTier ?? 'standard',
    isProYearly: false,
    coins: 0,
    coinsSignupBonusGranted: false,
    coinProUntil: null,
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

/** Whether the user may attach `linkUrl` on posts (RC Pro or active coin Pro). */
export async function userCanAddLinks(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  if (user.isProYearly) return true;
  if (!user.coinProUntil) return false;
  const until =
    typeof user.coinProUntil.toDate === 'function'
      ? user.coinProUntil.toDate()
      : null;
  return Boolean(until && until.getTime() > Date.now());
}

export function isCoinProActive(user: User | null | undefined): boolean {
  if (!user?.coinProUntil) return false;
  const until =
    typeof user.coinProUntil.toDate === 'function'
      ? user.coinProUntil.toDate()
      : null;
  return Boolean(until && until.getTime() > Date.now());
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
        coins: 0,
        coinsSignupBonusGranted: false,
        coinProUntil: null,
        birthDate: null,
        countryCode: null,
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
