import {
  addDoc,
  collection,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';

import { COLLECTIONS, db } from '@/lib/firebase';

export type PostComment = {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
};

function commentsRef(postId: string) {
  return collection(db, COLLECTIONS.posts, postId, 'comments');
}

function mapComment(id: string, data: DocumentData): PostComment {
  return {
    id,
    userId: data.userId,
    text: typeof data.text === 'string' ? data.text : '',
    createdAt: data.createdAt,
  };
}

export async function listComments(
  postId: string,
  max = 40
): Promise<PostComment[]> {
  const q = query(
    commentsRef(postId),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapComment(d.id, d.data()));
}

export async function addComment(
  postId: string,
  userId: string,
  text: string
): Promise<PostComment> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Comment cannot be empty.');
  }
  if (trimmed.length > 500) {
    throw new Error('Comment is too long.');
  }
  const ref = await addDoc(commentsRef(postId), {
    userId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.posts, postId), {
    commentCount: increment(1),
  });
  return {
    id: ref.id,
    userId,
    text: trimmed,
    createdAt: null as unknown as Timestamp,
  };
}
