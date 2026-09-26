import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore';

import type { User } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';
import { getUserById } from '@/services/users';

export type Follow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt?: DocumentData['createdAt'];
};

function followsRef() {
  return collection(db, COLLECTIONS.follows);
}

function followId(followerId: string, followingId: string) {
  return `${followerId}_${followingId}`;
}

function followDoc(followerId: string, followingId: string) {
  return doc(db, COLLECTIONS.follows, followId(followerId, followingId));
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  const snap = await getDoc(followDoc(followerId, followingId));
  return snap.exists();
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (!followerId || !followingId) {
    throw new Error('Mangler bruker-id');
  }
  if (followerId === followingId) {
    throw new Error('Du kan ikke følge deg selv.');
  }

  await setDoc(followDoc(followerId, followingId), {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  await deleteDoc(followDoc(followerId, followingId));
}

export async function countFollowers(userId: string): Promise<number> {
  const q = query(followsRef(), where('followingId', '==', userId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function countFollowing(userId: string): Promise<number> {
  const q = query(followsRef(), where('followerId', '==', userId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function listFollowers(
  userId: string,
  max = 40
): Promise<User[]> {
  const q = query(
    followsRef(),
    where('followingId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  const users = await Promise.all(
    snap.docs.map((d) => getUserById(d.data().followerId as string))
  );
  return users.filter((u): u is User => Boolean(u));
}

export async function listFollowing(
  userId: string,
  max = 40
): Promise<User[]> {
  const q = query(
    followsRef(),
    where('followerId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  const users = await Promise.all(
    snap.docs.map((d) => getUserById(d.data().followingId as string))
  );
  return users.filter((u): u is User => Boolean(u));
}
