import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import {
  COIN_REDEEM,
  COIN_REWARDS,
  type CoinRedeemPlan,
} from '../../constants/coins';
import { getAdminDb } from './firebaseAdmin';

function isCoinProActive(coinProUntil: unknown, now = new Date()): boolean {
  if (!coinProUntil) return false;
  if (coinProUntil instanceof Timestamp) {
    return coinProUntil.toDate().getTime() > now.getTime();
  }
  if (
    typeof coinProUntil === 'object' &&
    coinProUntil !== null &&
    'toDate' in coinProUntil &&
    typeof (coinProUntil as { toDate: () => Date }).toDate === 'function'
  ) {
    return (coinProUntil as { toDate: () => Date }).toDate().getTime() > now.getTime();
  }
  if (coinProUntil instanceof Date) {
    return coinProUntil.getTime() > now.getTime();
  }
  if (typeof coinProUntil === 'string' || typeof coinProUntil === 'number') {
    const ms = new Date(coinProUntil).getTime();
    return Number.isFinite(ms) && ms > now.getTime();
  }
  return false;
}

export function hasActiveCoinPro(data: Record<string, unknown> | undefined): boolean {
  if (!data) return false;
  return isCoinProActive(data.coinProUntil);
}

/** Grant one-time signup bonus. Idempotent. */
export async function grantSignupCoins(userId: string): Promise<{
  awarded: boolean;
  coins: number;
}> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const ledgerRef = db.collection('coin_ledger').doc(`${userId}_signup`);

  return db.runTransaction(async (tx) => {
    const ledger = await tx.get(ledgerRef);
    const userSnap = await tx.get(userRef);
    const current = userSnap.exists
      ? Number(userSnap.data()?.coins ?? 0)
      : 0;

    if (ledger.exists || userSnap.data()?.coinsSignupBonusGranted === true) {
      return { awarded: false, coins: current };
    }

    const next = current + COIN_REWARDS.signup;
    tx.set(
      userRef,
      {
        coins: next,
        coinsSignupBonusGranted: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    tx.set(ledgerRef, {
      userId,
      type: 'signup',
      amount: COIN_REWARDS.signup,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { awarded: true, coins: next };
  });
}

/** Grant publish reward once per post. Verifies post ownership. */
export async function grantPublishCoins(
  userId: string,
  postId: string
): Promise<{ awarded: boolean; coins: number }> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const postRef = db.collection('posts').doc(postId);
  const ledgerRef = db
    .collection('coin_ledger')
    .doc(`${userId}_publish_${postId}`);

  return db.runTransaction(async (tx) => {
    const [ledger, postSnap, userSnap] = await Promise.all([
      tx.get(ledgerRef),
      tx.get(postRef),
      tx.get(userRef),
    ]);

    const current = userSnap.exists
      ? Number(userSnap.data()?.coins ?? 0)
      : 0;

    if (ledger.exists) {
      return { awarded: false, coins: current };
    }

    if (!postSnap.exists || postSnap.data()?.userId !== userId) {
      throw new Error('Post not found for this user');
    }

    const next = current + COIN_REWARDS.publishBlix;
    tx.set(
      userRef,
      {
        coins: next,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    tx.set(ledgerRef, {
      userId,
      type: 'publish',
      postId,
      amount: COIN_REWARDS.publishBlix,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { awarded: true, coins: next };
  });
}

/** Spend coins for time-limited Pro (store links). Extends existing coin Pro. */
export async function redeemCoinsForPro(
  userId: string,
  plan: CoinRedeemPlan
): Promise<{
  coins: number;
  coinProUntil: string;
  days: number;
  cost: number;
}> {
  const offer = COIN_REDEEM[plan];
  if (!offer) {
    throw new Error('Invalid redeem plan');
  }

  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  const ledgerRef = db
    .collection('coin_ledger')
    .doc(`${userId}_redeem_${plan}_${Date.now()}`);

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) {
      throw new Error('User profile missing');
    }

    const data = userSnap.data() ?? {};
    const current = Number(data.coins ?? 0);
    if (current < offer.cost) {
      throw new Error('Not enough coins');
    }

    const now = new Date();
    let base = now;
    if (isCoinProActive(data.coinProUntil, now)) {
      const until = data.coinProUntil as Timestamp | Date;
      base =
        until instanceof Timestamp
          ? until.toDate()
          : until instanceof Date
            ? until
            : now;
    }

    const until = new Date(base.getTime() + offer.days * 24 * 60 * 60 * 1000);
    const nextCoins = current - offer.cost;

    tx.update(userRef, {
      coins: nextCoins,
      coinProUntil: Timestamp.fromDate(until),
      // Display helper — RC mirror must not wipe coin Pro (see mirrorProYearly).
      subscriptionTier: 'pro',
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.set(ledgerRef, {
      userId,
      type: 'redeem',
      plan,
      amount: -offer.cost,
      days: offer.days,
      coinProUntil: Timestamp.fromDate(until),
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      coins: nextCoins,
      coinProUntil: until.toISOString(),
      days: offer.days,
      cost: offer.cost,
    };
  });
}
