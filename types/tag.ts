import type { Timestamp } from 'firebase/firestore';

/** Firestore `tags/{slug}` — popularity mirror for discovery. */
export interface Tag {
  id: string;
  /** Display/slug name (same as doc id). */
  name: string;
  /** Number of posts that include this tag. */
  postCount: number;
  updatedAt: Timestamp;
}
