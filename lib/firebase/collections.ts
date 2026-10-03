/** Firestore collection names — single source of truth. */
export const COLLECTIONS = {
  users: 'users',
  /** Doc id = handle; locks vanity URLs (bioblix.com/{handle}). */
  usernames: 'usernames',
  posts: 'posts',
  reports: 'reports',
  tags: 'tags',
  follows: 'follows',
  lives: 'lives',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
