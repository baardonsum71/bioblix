/** Firestore collection names — single source of truth. */
export const COLLECTIONS = {
  users: 'users',
  posts: 'posts',
  reports: 'reports',
  tags: 'tags',
  follows: 'follows',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
