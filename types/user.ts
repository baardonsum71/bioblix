import type { Timestamp } from 'firebase/firestore';

/** Subscription plans tied to RevenueCat (and Stripe on web). */
export type SubscriptionTier = 'standard' | 'pro';

/** Social / external link on a user profile (max 10 per user). */
export interface ProfileLink {
  id: string;
  /** Short label, e.g. "Instagram" or "Shop". */
  title: string;
  /** Full https URL. */
  url: string;
}

export const MAX_PROFILE_LINKS = 10;

/** Onboarding audience tags — tailor modules on the profile. */
export type BioBlixAudience =
  | 'influencer'
  | 'gamer'
  | 'student'
  | 'business';

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
  /** ISO date YYYY-MM-DD when known (required for new sign-ups, 16+). */
  birthDate: string | null;
  /** ISO 3166-1 alpha-2 (Russia excluded). Drives locale + billing currency. */
  countryCode: string | null;
  /** Standard: post media only. Pro: media + clickable linkUrl on posts. */
  subscriptionTier: SubscriptionTier;
  /**
   * Server-mirrored Pro Yearly flag from RevenueCat entitlement `pro_yearly`.
   * Enforced by Firestore security rules for `posts.linkUrl` (with coinProUntil).
   * Only writable via Admin SDK (webhook) — never trust the client.
   */
  isProYearly: boolean;
  /** Closed-loop coins balance (Admin SDK only). */
  coins: number;
  /** One-time signup bonus already granted. */
  coinsSignupBonusGranted: boolean;
  /**
   * Pro from coin redeem until this time (Admin SDK only).
   * Gives store-link access independent of RevenueCat.
   */
  coinProUntil: Timestamp | null;
  /** Clerk/user ids this viewer has blocked (hidden from their feed). */
  blockedUsers: string[];
  /** Up to 10 public profile links (socials, shop, etc.). Free for all users. */
  profileLinks: ProfileLink[];
  /**
   * Optional Spotify share URL (track/album/playlist/…).
   * Rendered as an official Spotify embed — no audio hosted on BioBlix.
   */
  spotifyUrl: string | null;
  /** Selected in onboarding — one or more audiences. */
  audiences: BioBlixAudience[];
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
  | 'coins'
  | 'coinsSignupBonusGranted'
  | 'coinProUntil'
  | 'blockedUsers'
  | 'profileLinks'
  | 'spotifyUrl'
  | 'audiences'
> & {
  subscriptionTier?: SubscriptionTier;
  isProYearly?: boolean;
  blockedUsers?: string[];
  profileLinks?: ProfileLink[];
  spotifyUrl?: string | null;
  audiences?: BioBlixAudience[];
};

/** Partial update payload for profile / subscription sync. */
export type UpdateUserInput = Partial<
  Omit<User, 'id' | 'clerkId' | 'createdAt'>
>;
