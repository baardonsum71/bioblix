import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { mirrorProYearlyToFirestore } from '../lib/server/mirrorProYearly';

/**
 * After a web purchase, client calls this to mirror RevenueCat → Firestore.
 * POST + Authorization: Bearer <Clerk session JWT>
 *
 * Env: CLERK_SECRET_KEY, REVENUECAT_SECRET_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON
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

    const result = await mirrorProYearlyToFirestore(userId);
    return res.status(200).json({
      ok: true,
      appUserId: userId,
      isProYearly: result.isProYearly,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pro sync failed';
    console.error('[sync-pro]', message);
    return res.status(500).json({ error: message });
  }
}
