/** Firestore collection names — single source of truth. */
export const COLLECTIONS = {
  users: 'users',
  posts: 'posts',
  reports: 'reports',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
