/** Closed-loop BioBlix coins — redeem for Pro only (no cash-out). */

export const COIN_REWARDS = {
  /** One-time when Firestore profile is first created. */
  signup: 50,
  /** Per published blix (idempotent per post id). */
  publishBlix: 20,
} as const;

export const COIN_REDEEM = {
  /** 600 coins → 30 days Pro (store links). */
  month: { cost: 600, days: 30 },
  /** 5000 coins → 365 days Pro. */
  year: { cost: 5000, days: 365 },
} as const;

export type CoinRedeemPlan = keyof typeof COIN_REDEEM;
