import type { Timestamp } from 'firebase/firestore';

/** Subscription plans tied to RevenueCat (and Stripe on web). */
export type SubscriptionTier = 'standard' | 'pro';

/**
 * Firestore `users` document.
 * Document ID should match the Clerk user id (`userId`).
 */
export interface User {
  id: string;
  /** Clerk user id — same as document id */
  clerkId: string;
  email: string;
  displayName: string;
  imageUrl: string | null;
  /** Standard: post media only. Pro: media + clickable linkUrl on posts. */
  subscriptionTier: SubscriptionTier;
  /**
   * Server-mirrored Pro Yearly flag from RevenueCat entitlement `pro_yearly`.
   * Enforced by Firestore security rules for `posts.linkUrl`.
   * Only writable via Admin SDK (webhook) — never trust the client.
   */
  isProYearly: boolean;
  /** Clerk/user ids this viewer has blocked (hidden from their feed). */
  blockedUsers: string[];
  /** RevenueCat / Stripe customer identifiers when linked */
  revenueCatAppUserId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Fields accepted when creating a user profile after Clerk sign-up. */
export type CreateUserInput = Omit<
  User,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'subscriptionTier'
  | 'isProYearly'
  | 'blockedUsers'
> & {
  subscriptionTier?: SubscriptionTier;
  isProYearly?: boolean;
  blockedUsers?: string[];
};

/** Partial update payload for profile / subscription sync. */
export type UpdateUserInput = Partial<
  Omit<User, 'id' | 'clerkId' | 'createdAt'>
>;
