import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { isOwnerEmail, normalizeEmail } from '../constants/owners';
import { getAdminDb } from '../lib/server/firebaseAdmin';

/**
 * Grant Pro to allowlisted owner emails.
 * POST + Authorization: Bearer <Clerk session JWT>
 *
 * Env: CLERK_SECRET_KEY, FIREBASE_SERVICE_ACCOUNT_JSON
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
      : {}) as { email?: string };
    const email = normalizeEmail(body.email);

    if (!isOwnerEmail(email)) {
      return res.status(200).json({ ok: true, owner: false, isProYearly: false });
    }

    const db = getAdminDb();
    const ref = db.collection('users').doc(userId);
    const snap = await ref.get();

    const patch = {
      email,
      clerkId: userId,
      subscriptionTier: 'pro',
      isProYearly: true,
      updatedAt: new Date(),
      ownerGrant: true,
    };

    if (snap.exists) {
      await ref.update(patch);
    } else {
      await ref.set({
        ...patch,
        displayName: email.split('@')[0] || 'Eier',
        imageUrl: null,
        blockedUsers: [],
        revenueCatAppUserId: null,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({ ok: true, owner: true, isProYearly: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Owner grant failed';
    console.error('[ensure-owner-pro]', message);
    return res.status(401).json({ error: message });
  }
}
