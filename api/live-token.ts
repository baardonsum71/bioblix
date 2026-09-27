import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { FieldValue } from 'firebase-admin/firestore';

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

async function mintToken(params: {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
}): Promise<string> {
  const at = new AccessToken(liveKitApiKey(), liveKitApiSecret(), {
    identity: params.identity,
    name: params.name,
    ttl: '6h',
  });
  at.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: params.canPublish,
    canSubscribe: true,
    canPublishData: false,
  });
  return at.toJwt();
}

/**
 * Clerk JWT → LiveKit access token + Firestore live session.
 * Body: { action: 'start' | 'watch' | 'end', liveId?, title?, displayName? }
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
    const payload = await verifyToken(jwt, { secretKey });
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid Clerk token (no sub)' });
    }

    const body = (req.body ?? {}) as Body;
    const action = body.action;
    if (action !== 'start' && action !== 'watch' && action !== 'end') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const db = getAdminDb();
    const url = liveKitWsUrl();

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

      const client = roomClient();
      await client.createRoom({
        name: roomName,
        emptyTimeout: 60 * 10,
        maxParticipants: 500,
      });

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
