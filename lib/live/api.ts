import { apiUrl } from '@/lib/apiBase';

export type LiveTokenResponse = {
  liveId: string;
  roomName: string;
  token: string;
  url: string;
  title?: string;
};

type StartParams = {
  getClerkToken: () => Promise<string | null>;
  title: string;
  displayName?: string;
};

type WatchParams = {
  getClerkToken: () => Promise<string | null>;
  liveId: string;
  displayName?: string;
};

type EndParams = {
  getClerkToken: () => Promise<string | null>;
  liveId: string;
};

async function authHeaders(
  getClerkToken: () => Promise<string | null>
): Promise<HeadersInit> {
  const token = await getClerkToken();
  if (!token) throw new Error('Not signed in');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function startLiveSession(
  params: StartParams
): Promise<LiveTokenResponse> {
  const res = await fetch(apiUrl('/api/live-token'), {
    method: 'POST',
    headers: await authHeaders(params.getClerkToken),
    body: JSON.stringify({
      action: 'start',
      title: params.title,
      displayName: params.displayName,
    }),
  });
  const data = (await res.json()) as LiveTokenResponse & { error?: string };
  if (!res.ok) {
    if (res.status === 503) {
      throw new Error(
        data.error ||
          'LiveKit is not configured (set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET on Vercel)'
      );
    }
    throw new Error(data.error || 'Could not start live');
  }
  return data;
}

export async function watchLiveSession(
  params: WatchParams
): Promise<LiveTokenResponse> {
  const res = await fetch(apiUrl('/api/live-token'), {
    method: 'POST',
    headers: await authHeaders(params.getClerkToken),
    body: JSON.stringify({
      action: 'watch',
      liveId: params.liveId,
      displayName: params.displayName,
    }),
  });
  const data = (await res.json()) as LiveTokenResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || 'Could not join live');
  return data;
}

export async function endLiveSession(params: EndParams): Promise<void> {
  const res = await fetch(apiUrl('/api/live-token'), {
    method: 'POST',
    headers: await authHeaders(params.getClerkToken),
    body: JSON.stringify({
      action: 'end',
      liveId: params.liveId,
    }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Could not end live');
}

export function publicLiveKitUrl(): string {
  return (process.env.EXPO_PUBLIC_LIVEKIT_URL ?? '').trim().replace(/\/$/, '');
}

export function isLiveKitClientConfigured(): boolean {
  return Boolean(publicLiveKitUrl());
}
