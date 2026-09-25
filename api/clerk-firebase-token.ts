import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Clerk JWT → Firebase custom token.
 * Client: Authorization: Bearer <clerkSessionJwt>
 * Then: signInWithCustomToken(firebaseAuth, token)
 *
 * Env: CLERK_SECRET_KEY, FIREBASE_SERVICE_ACCOUNT_JSON
 *
 * Heavy deps are loaded inside the handler so import failures become JSON 500s
 * instead of Vercel FUNCTION_INVOCATION_FAILED with an empty body.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Missing CLERK_SECRET_KEY' });
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return res
        .status(500)
        .json({ error: 'Missing FIREBASE_SERVICE_ACCOUNT_JSON' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    const jwt = authHeader.slice('Bearer '.length).trim();
    if (!jwt) {
      return res.status(401).json({ error: 'Empty Bearer token' });
    }

    const { verifyToken } = await import('@clerk/backend');
    const { getAuth } = await import('firebase-admin/auth');
    const { getAdminApp } = await import('../lib/server/firebaseAdmin');

    const payload = await verifyToken(jwt, { secretKey });
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid Clerk token (no sub)' });
    }

    const token = await getAuth(getAdminApp()).createCustomToken(userId);
    return res.status(200).json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token exchange failed';
    console.error('[clerk-firebase-token]', message);
    const status =
      /Missing |not valid JSON|double-encoded|missing project_id/i.test(message)
        ? 500
        : 401;
    return res.status(status).json({ error: message });
  }
}
