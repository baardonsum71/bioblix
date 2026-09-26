import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createR2PresignedPut, isR2Configured } from '../lib/server/r2';

type Body = {
  kind?: 'post' | 'avatar';
  contentType?: string;
  extension?: string;
};

function sanitizeExt(raw: string | undefined, contentType: string): string {
  const fromType = contentType.split('/')[1]?.split(';')[0]?.trim();
  const ext = (raw || fromType || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!ext || ext.length > 8) return 'bin';
  return ext;
}

/**
 * Clerk JWT → R2 presigned PUT URL.
 * Body: { kind: 'post' | 'avatar', contentType, extension? }
 * Env: CLERK_SECRET_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *      R2_BUCKET_NAME, R2_PUBLIC_BASE_URL
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isR2Configured()) {
      return res.status(503).json({ error: 'R2 is not configured' });
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
    const payload = await verifyToken(jwt, { secretKey });
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid Clerk token (no sub)' });
    }

    const body = (req.body ?? {}) as Body;
    const contentType =
      typeof body.contentType === 'string' && body.contentType.includes('/')
        ? body.contentType
        : 'application/octet-stream';

    if (
      !contentType.startsWith('image/') &&
      !contentType.startsWith('video/')
    ) {
      return res.status(400).json({ error: 'Only image/* or video/* allowed' });
    }

    const kind = body.kind === 'avatar' ? 'avatar' : 'post';
    if (kind === 'avatar' && !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Avatar must be an image' });
    }

    const ext = sanitizeExt(body.extension, contentType);
    const key =
      kind === 'avatar'
        ? `avatars/${userId}/${Date.now()}.${ext}`
        : `posts/${userId}/${Date.now()}.${ext}`;

    const signed = await createR2PresignedPut({ key, contentType });
    return res.status(200).json(signed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Presign failed';
    console.error('[r2-presign]', message);
    return res.status(401).json({ error: message });
  }
}
