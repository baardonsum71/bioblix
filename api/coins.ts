import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import type { CoinRedeemPlan } from '../constants/coins';
import {
  grantPublishCoins,
  grantSignupCoins,
  redeemCoinsForPro,
} from '../lib/server/coins';

type CoinsBody = {
  action?: string;
  postId?: string;
  plan?: string;
};

/**
 * Closed-loop coins (no cash-out).
 * POST + Authorization: Bearer <Clerk JWT>
 * body.action: signup | publish | redeem
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Missing CLERK_SECRET_KEY' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }

  const jwt = authHeader.slice('Bearer '.length).trim();
  if (!jwt) {
    return res.status(401).json({ error: 'Empty Bearer token' });
  }

  try {
    const payload = await verifyToken(jwt, { secretKey });
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid Clerk token (no sub)' });
    }

    const body = (typeof req.body === 'object' && req.body !== null
      ? req.body
      : {}) as CoinsBody;
    const action = body.action;

    if (action === 'signup') {
      const result = await grantSignupCoins(userId);
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === 'publish') {
      const postId = typeof body.postId === 'string' ? body.postId.trim() : '';
      if (!postId) {
        return res.status(400).json({ error: 'Missing postId' });
      }
      const result = await grantPublishCoins(userId, postId);
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === 'redeem') {
      const plan = body.plan;
      if (plan !== 'month' && plan !== 'year') {
        return res.status(400).json({ error: 'plan must be month or year' });
      }
      const result = await redeemCoinsForPro(userId, plan as CoinRedeemPlan);
      return res.status(200).json({ ok: true, ...result });
    }

    return res.status(400).json({
      error: 'action must be signup | publish | redeem',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Coins action failed';
    const status =
      message === 'Not enough coins' ||
      message === 'Post not found for this user' ||
      message === 'User profile missing' ||
      message === 'Invalid redeem plan'
        ? 400
        : 500;
    console.error('[coins]', message);
    return res.status(status).json({ error: message });
  }
}
