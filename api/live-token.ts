import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RoomServiceClient } from 'livekit-server-sdk';
import { FieldValue } from 'firebase-admin/firestore';
import * as jose from 'jose';

import { COLLECTIONS } from '../lib/firebase/collections';
import { getAdminDb } from '../lib/server/firebaseAdmin';
import {
  isLiveKitConfigured,
  liveKitApiKey,
  liveKitApiSecret,
  liveKitHttpHost,
  liveKitWsUrl,
} from '../lib/server/livekit';

type Action = 'start' | 'watch' | 'end';

type Body = {
  action?: Action;
  liveId?: string;
  title?: string;
  displayName?: string;
};

function roomClient(): RoomServiceClient {
  return new RoomServiceClient(
    liveKitHttpHost(),
    liveKitApiKey(),
    liveKitApiSecret()
  );
}

/**
 * Mint LiveKit JWT with jose directly.
 * Avoid AccessToken.toJwt()'s setNotBefore(now) — clock skew → "invalid token".
 */
async function mintToken(params: {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
}): Promise<string> {
  const apiKey = liveKitApiKey();
  const apiSecret = liveKitApiSecret();
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit API key/secret missing');
  }

  const token = await new jose.SignJWT({
    name: params.name,
    video: {
      roomJoin: true,
      room: params.roomName,
      canPublish: params.canPublish,
      canSubscribe: true,
      canPublishData: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(apiKey)
    .setSubject(params.identity)
    .setExpirationTime('6h')
    .setNotBefore(0)
    .sign(new TextEncoder().encode(apiSecret));

  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('LiveKit mint produced a non-JWT token');
  }
  return token;
}

/**
 * Clerk JWT → LiveKit access token + Firestore live session.
 * Body: { action: 'start' | 'watch' | 'end', liveId?, title?, displayName? }
 *
 * Rooms are auto-created on first join (no RoomService createRoom) to avoid
 * SDK AccessToken nbf clock-skew failures.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isLiveKitConfigured()) {
      return res.status(503).json({
        error:
          'LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET on the server.',
      });
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
    let userId: string;
    try {
      const payload = await verifyToken(jwt, { secretKey });
      if (!payload.sub) {
        return res.status(401).json({ error: 'Invalid Clerk token (no sub)' });
      }
      userId = payload.sub;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Clerk auth failed';
      return res.status(401).json({ error: `Clerk: ${message}` });
    }

    const body = (req.body ?? {}) as Body;
    const action = body.action;
    if (action !== 'start' && action !== 'watch' && action !== 'end') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const db = getAdminDb();
    const url = liveKitWsUrl();
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      return res.status(500).json({
        error: `LIVEKIT_URL must be a wss:// URL (got ${url.slice(0, 32)})`,
      });
    }

    if (action === 'start') {
      const title =
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim().slice(0, 80)
          : 'Live';
      const displayName =
        typeof body.displayName === 'string' && body.displayName.trim()
          ? body.displayName.trim().slice(0, 60)
          : userId.slice(0, 12);

      const liveRef = db.collection(COLLECTIONS.lives).doc();
      const liveId = liveRef.id;
      const roomName = liveId;

      await liveRef.set({
        hostUserId: userId,
        hostDisplayName: displayName,
        title,
        roomName,
        status: 'live',
        startedAt: FieldValue.serverTimestamp(),
        endedAt: null,
      });

      const token = await mintToken({
        identity: userId,
        name: displayName,
        roomName,
        canPublish: true,
      });

      return res.status(200).json({
        liveId,
        roomName,
        token,
        url,
        title,
      });
    }

    const liveId =
      typeof body.liveId === 'string' ? body.liveId.trim() : '';
    if (!liveId) {
      return res.status(400).json({ error: 'Missing liveId' });
    }

    const liveRef = db.collection(COLLECTIONS.lives).doc(liveId);
    const snap = await liveRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Live not found' });
    }
    const data = snap.data()!;
    const roomName =
      typeof data.roomName === 'string' ? data.roomName : liveId;

    if (action === 'watch') {
      if (data.status !== 'live') {
        return res.status(410).json({ error: 'Live has ended' });
      }
      const displayName =
        typeof body.displayName === 'string' && body.displayName.trim()
          ? body.displayName.trim().slice(0, 60)
          : `viewer_${userId.slice(0, 8)}`;
      const token = await mintToken({
        identity: `viewer_${userId}`,
        name: displayName,
        roomName,
        canPublish: false,
      });
      return res.status(200).json({ liveId, roomName, token, url });
    }

    // end
    if (data.hostUserId !== userId) {
      return res.status(403).json({ error: 'Only the host can end this live' });
    }

    await liveRef.update({
      status: 'ended',
      endedAt: FieldValue.serverTimestamp(),
    });

    try {
      await roomClient().deleteRoom(roomName);
    } catch (err) {
      console.warn('[live-token] deleteRoom failed', err);
    }

    return res.status(200).json({ ok: true, liveId });
  } catch (err) {
    console.error('[live-token]', err);
    const message = err instanceof Error ? err.message : 'Live token failed';
    return res.status(500).json({ error: message });
  }
}
