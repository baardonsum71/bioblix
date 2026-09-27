import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
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

async function signLiveKitJwt(claims: {
  identity: string;
  name?: string;
  video: Record<string, unknown>;
  ttl?: string;
}): Promise<string> {
  const apiKey = liveKitApiKey();
  const apiSecret = liveKitApiSecret();
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit API key/secret missing');
  }

  // Match livekit-server-sdk shape, but omit nbf (SDK setNotBefore(now) causes
  // clock-skew "invalid token"; nbf:0 is also rejected by some validators).
  const builder = new jose.SignJWT({
    ...(claims.name ? { name: claims.name } : {}),
    video: claims.video,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(apiKey)
    .setSubject(claims.identity)
    .setJti(claims.identity)
    .setExpirationTime(claims.ttl ?? '6h');

  const token = await builder.sign(new TextEncoder().encode(apiSecret));
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('LiveKit mint produced a non-JWT token');
  }
  return token;
}

async function mintParticipantToken(params: {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean;
}): Promise<string> {
  return signLiveKitJwt({
    identity: params.identity,
    name: params.name,
    video: {
      roomJoin: true,
      room: params.roomName,
      // Hosts may auto-create the room on first join.
      ...(params.canPublish ? { roomCreate: true } : {}),
      canPublish: params.canPublish,
      canSubscribe: true,
      canPublishData: false,
    },
  });
}

/** Probe that URL + key + secret belong to the same LiveKit project. */
async function assertLiveKitCredentials(): Promise<void> {
  const host = liveKitHttpHost();
  const apiKey = liveKitApiKey();
  const keyHint = apiKey.slice(0, 6);

  const token = await signLiveKitJwt({
    identity: 'bioblix_cred_check',
    video: { roomList: true },
    ttl: '2m',
  });

  const res = await fetch(`${host}/twirp/livekit.RoomService/ListRooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (res.ok) return;

  const body = await res.text().catch(() => '');
  throw new Error(
    `LiveKit rejected credentials (HTTP ${res.status}) for host ${host} / key ${keyHint}… — paste LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET from the same project Keys page (no quotes). ${body.slice(0, 120)}`
  );
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

    if (action === 'start' || action === 'watch') {
      await assertLiveKitCredentials();
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

      const token = await mintParticipantToken({
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
      const token = await mintParticipantToken({
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

    // Best-effort room delete via Twirp (jose token — no SDK AccessToken nbf).
    try {
      const delToken = await signLiveKitJwt({
        identity: 'bioblix_room_delete',
        video: { roomCreate: true },
        ttl: '2m',
      });
      await fetch(
        `${liveKitHttpHost()}/twirp/livekit.RoomService/DeleteRoom`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${delToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room: roomName }),
        }
      );
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
