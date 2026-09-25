import type { Timestamp } from 'firebase/firestore';

export type MediaType = 'video' | 'image';

/**
 * Firestore `posts` document.
 * `linkUrl` is only allowed for Pro subscribers (enforced in app + security rules).
 */
export interface Post {
  id: string;
  /** Clerk user id of the author */
  userId: string;
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  description: string;
  /** Normalized tag slugs (lowercase, no #). */
  tags: string[];
  /** Clickable product/app link — Pro tier only */
  linkUrl?: string | null;
  createdAt: Timestamp;
}

/** Payload for creating a new post (id & createdAt assigned by the service). */
export type CreatePostInput = Omit<Post, 'id' | 'createdAt'>;

/** Partial update for editable post fields. */
export type UpdatePostInput = Partial<
  Pick<
    Post,
    'title' | 'description' | 'linkUrl' | 'mediaUrl' | 'mediaType' | 'tags'
  >
>;
