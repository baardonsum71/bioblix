/**
 * LiveKit Cloud helpers for Vercel API routes.
 * Env: LIVEKIT_URL (wss://… or https://…), LIVEKIT_API_KEY, LIVEKIT_API_SECRET
 */
export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_URL?.trim() &&
      process.env.LIVEKIT_API_KEY?.trim() &&
      process.env.LIVEKIT_API_SECRET?.trim()
  );
}

/** HTTPS host for RoomServiceClient (strip trailing slash). */
export function liveKitHttpHost(): string {
  const raw = (process.env.LIVEKIT_URL ?? '').trim().replace(/\/$/, '');
  if (raw.startsWith('wss://')) return `https://${raw.slice('wss://'.length)}`;
  if (raw.startsWith('ws://')) return `http://${raw.slice('ws://'.length)}`;
  if (raw.startsWith('https://') || raw.startsWith('http://')) return raw;
  return `https://${raw}`;
}

/** WSS URL for browser Room.connect. */
export function liveKitWsUrl(): string {
  const raw = (process.env.LIVEKIT_URL ?? '').trim().replace(/\/$/, '');
  if (raw.startsWith('https://')) return `wss://${raw.slice('https://'.length)}`;
  if (raw.startsWith('http://')) return `ws://${raw.slice('http://'.length)}`;
  if (raw.startsWith('wss://') || raw.startsWith('ws://')) return raw;
  return `wss://${raw}`;
}

export function liveKitApiKey(): string {
  return process.env.LIVEKIT_API_KEY?.trim() ?? '';
}

export function liveKitApiSecret(): string {
  return process.env.LIVEKIT_API_SECRET?.trim() ?? '';
}
