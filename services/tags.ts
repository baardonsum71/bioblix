import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  serverTimestamp,
  setDoc,
  increment,
  type DocumentData,
} from 'firebase/firestore';

import type { Tag } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';
import { sanitizeTags } from '@/lib/validation/tags';

function tagsRef() {
  return collection(db, COLLECTIONS.tags);
}

function tagDoc(slug: string) {
  return doc(db, COLLECTIONS.tags, slug);
}

function mapTag(id: string, data: DocumentData): Tag {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : id,
    postCount: typeof data.postCount === 'number' ? data.postCount : 0,
    updatedAt: data.updatedAt,
  };
}

/** Bump popularity for each tag after a post is created. */
export async function incrementTagCounts(rawTags: string[]): Promise<void> {
  const tags = sanitizeTags(rawTags);
  await Promise.all(
    tags.map(async (slug) => {
      const ref = tagDoc(slug);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await setDoc(
          ref,
          {
            postCount: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(ref, {
          name: slug,
          postCount: 1,
          updatedAt: serverTimestamp(),
        });
      }
    })
  );
}

/** Top tags by postCount (popularity). */
export async function listPopularTags(max = 20): Promise<Tag[]> {
  const q = query(tagsRef(), orderBy('postCount', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapTag(d.id, d.data()));
}

/** All tags sorted by popularity. */
export async function listAllTags(max = 200): Promise<Tag[]> {
  return listPopularTags(max);
}

export async function getTagById(slug: string): Promise<Tag | null> {
  const snap = await getDoc(tagDoc(slug));
  if (!snap.exists()) return null;
  return mapTag(snap.id, snap.data());
}
