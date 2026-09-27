/**
 * LiveKit Cloud helpers for Vercel API routes.
 * Env: LIVEKIT_URL (wss://… or https://…), LIVEKIT_API_KEY, LIVEKIT_API_SECRET
 */

/** Trim + strip wrapping quotes/newlines/BOM from dashboard paste. */
function cleanEnv(value: string | undefined): string {
  return (value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\r?\n/g, '')
    .replace(/\\n/g, '');
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

/** Catch swapped/mis-pasted LiveKit env before calling LiveKit. */
export function assertLiveKitEnvShape(): void {
  const key = liveKitApiKey();
  const secret = liveKitApiSecret();
  const url = liveKitWsUrl();

  if (!url.includes('.livekit.cloud') && !url.includes('localhost')) {
    throw new Error(
      `LIVEKIT_URL looks wrong (${url.slice(0, 48)}). Use the WebSocket URL from LiveKit → Settings → Keys.`
    );
  }
  if (!key.startsWith('API')) {
    throw new Error(
      `LIVEKIT_API_KEY should start with "API" (got "${key.slice(0, 8)}…"). You may have pasted the Secret into the Key field.`
    );
  }
  if (secret.startsWith('API')) {
    throw new Error(
      'LIVEKIT_API_SECRET looks like an API Key (starts with API). Swap Key and Secret in Vercel.'
    );
  }
  if (secret.startsWith('wss://') || secret.startsWith('https://')) {
    throw new Error(
      'LIVEKIT_API_SECRET looks like a URL. Paste the Secret from the Keys page, not the WebSocket URL.'
    );
  }
  if (secret.length < 16) {
    throw new Error(
      `LIVEKIT_API_SECRET is too short (${secret.length} chars) — it was probably truncated when pasting.`
    );
  }
  if (key === secret) {
    throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must not be the same value.');
  }
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
