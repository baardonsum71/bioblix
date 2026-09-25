import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore';

import type { CreatePostInput, Post, UpdatePostInput } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';
import { hasProYearlyEntitlement } from '@/lib/revenuecat';
import { sanitizeTags } from '@/lib/validation/tags';
import { validateProLinkUrl } from '@/lib/validation/proLink';
import { incrementTagCounts } from '@/services/tags';
import { userCanAddLinks } from '@/services/users';

async function canAuthorAddLinks(userId: string): Promise<boolean> {
  // Firestore `isProYearly` is what security rules enforce — prefer it.
  if (await userCanAddLinks(userId)) return true;
  // Soft client hint from RevenueCat SDK (webhook may still be in flight).
  return hasProYearlyEntitlement();
}

function postsRef() {
  return collection(db, COLLECTIONS.posts);
}

function postDoc(postId: string) {
  return doc(db, COLLECTIONS.posts, postId);
}

function mapPost(id: string, data: DocumentData): Post {
  return {
    id,
    userId: data.userId,
    mediaUrl: data.mediaUrl,
    mediaType: data.mediaType,
    title: data.title,
    description: data.description,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t: unknown): t is string => typeof t === 'string')
      : [],
    linkUrl: data.linkUrl ?? null,
    createdAt: data.createdAt,
  };
}

/**
 * Create a post. Rejects `linkUrl` unless the author is on the Pro tier.
 */
export async function createPost(input: CreatePostInput): Promise<string> {
  const hasLink = Boolean(input.linkUrl?.trim());
  let linkUrl: string | null = null;
  const tags = sanitizeTags(input.tags);

  if (hasLink) {
    const allowed = await canAuthorAddLinks(input.userId);
    if (!allowed) {
      throw new Error(
        'Link URLs require a Pro subscription. Upgrade to attach clickable links.'
      );
    }
    const validation = validateProLinkUrl(input.linkUrl!.trim());
    if (!validation.ok) {
      throw new Error(validation.message);
    }
    linkUrl = validation.url;
  }

  const ref = await addDoc(postsRef(), {
    userId: input.userId,
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    title: input.title,
    description: input.description,
    tags,
    linkUrl,
    createdAt: serverTimestamp(),
  });

  try {
    await incrementTagCounts(tags);
  } catch (err) {
    console.warn('[tags] count increment failed', err);
  }

  return ref.id;
}

export async function getPostById(postId: string): Promise<Post | null> {
  const snap = await getDoc(postDoc(postId));
  if (!snap.exists()) return null;
  return mapPost(snap.id, snap.data());
}

/** Newest-first feed page (vertical video feed). */
export async function listFeedPosts(max = 20): Promise<Post[]> {
  const q = query(postsRef(), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapPost(d.id, d.data()));
}

/** Posts that include a given tag (newest first). */
export async function listPostsByTag(
  tag: string,
  max = 40
): Promise<Post[]> {
  const slug = sanitizeTags([tag])[0];
  if (!slug) return [];
  const q = query(
    postsRef(),
    where('tags', 'array-contains', slug),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapPost(d.id, d.data()));
}

export async function listPostsByUser(
  userId: string,
  max = 20
): Promise<Post[]> {
  const q = query(
    postsRef(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapPost(d.id, d.data()));
}

export async function updatePost(
  postId: string,
  authorUserId: string,
  input: UpdatePostInput
): Promise<void> {
  const patch: Record<string, unknown> = { ...input };
  if (input.tags !== undefined) {
    patch.tags = sanitizeTags(input.tags);
  }

  if (input.linkUrl !== undefined && input.linkUrl !== null && input.linkUrl.trim()) {
    const allowed = await canAuthorAddLinks(authorUserId);
    if (!allowed) {
      throw new Error(
        'Link URLs require a Pro subscription. Upgrade to attach clickable links.'
      );
    }
    const validation = validateProLinkUrl(input.linkUrl.trim());
    if (!validation.ok) {
      throw new Error(validation.message);
    }
    await updateDoc(postDoc(postId), {
      ...patch,
      linkUrl: validation.url,
    });
    return;
  }

  await updateDoc(postDoc(postId), {
    ...patch,
    linkUrl:
      input.linkUrl === undefined
        ? undefined
        : input.linkUrl?.trim() || null,
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(postDoc(postId));
}
