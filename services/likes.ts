import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { COLLECTIONS, db } from '@/lib/firebase';

function likeDoc(postId: string, userId: string) {
  return doc(db, COLLECTIONS.posts, postId, 'likes', userId);
}

function postDoc(postId: string) {
  return doc(db, COLLECTIONS.posts, postId);
}

export async function hasLikedPost(
  postId: string,
  userId: string
): Promise<boolean> {
  const snap = await getDoc(likeDoc(postId, userId));
  return snap.exists();
}

/** Toggle like. Returns the new liked state. */
export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCountDelta: number }> {
  const ref = likeDoc(postId, userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(postDoc(postId), {
      likeCount: increment(-1),
    });
    return { liked: false, likeCountDelta: -1 };
  }
  await setDoc(ref, {
    userId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(postDoc(postId), {
    likeCount: increment(1),
  });
  return { liked: true, likeCountDelta: 1 };
}
