/**
 * LiveKit Cloud helpers for Vercel API routes.
 * Env: LIVEKIT_URL (wss://… or https://…), LIVEKIT_API_KEY, LIVEKIT_API_SECRET
 */

/** Trim + strip wrapping quotes/newlines from dashboard paste. */
function cleanEnv(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\r?\n/g, '');
}

export function isLiveKitConfigured(): boolean {
  return Boolean(
    cleanEnv(process.env.LIVEKIT_URL) &&
      cleanEnv(process.env.LIVEKIT_API_KEY) &&
      cleanEnv(process.env.LIVEKIT_API_SECRET)
  );
}

/** HTTPS host for RoomServiceClient (strip trailing slash). */
export function liveKitHttpHost(): string {
  const raw = cleanEnv(process.env.LIVEKIT_URL).replace(/\/$/, '');
  if (raw.startsWith('wss://')) return `https://${raw.slice('wss://'.length)}`;
  if (raw.startsWith('ws://')) return `http://${raw.slice('ws://'.length)}`;
  if (raw.startsWith('https://') || raw.startsWith('http://')) return raw;
  return `https://${raw}`;
}

/** WSS URL for browser Room.connect. */
export function liveKitWsUrl(): string {
  const raw = cleanEnv(process.env.LIVEKIT_URL).replace(/\/$/, '');
  if (raw.startsWith('https://')) return `wss://${raw.slice('https://'.length)}`;
  if (raw.startsWith('http://')) return `ws://${raw.slice('http://'.length)}`;
  if (raw.startsWith('wss://') || raw.startsWith('ws://')) return raw;
  return `wss://${raw}`;
}

export function liveKitApiKey(): string {
  return cleanEnv(process.env.LIVEKIT_API_KEY);
}

export function liveKitApiSecret(): string {
  return cleanEnv(process.env.LIVEKIT_API_SECRET);
}

/** Safe diagnostics for errors (never includes secret). */
export function liveKitDiag(): { host: string; keyPrefix: string; wsUrl: string } {
  const key = liveKitApiKey();
  return {
    host: liveKitHttpHost(),
    wsUrl: liveKitWsUrl(),
    keyPrefix: key ? `${key.slice(0, 6)}…` : '(empty)',
  };
}
