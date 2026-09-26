import { Platform, Share } from 'react-native';

import { getApiBaseUrl } from '@/lib/apiBase';

/** Absolute public profile URL for sharing. */
export function profileShareUrl(userId: string): string {
  const base =
    getApiBaseUrl() ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const origin = base.replace(/\/$/, '') || 'https://bioblix-9ibo.vercel.app';
  return `${origin}/u/${encodeURIComponent(userId)}`;
}

export async function shareProfile(params: {
  userId: string;
  displayName: string;
}): Promise<void> {
  const url = profileShareUrl(params.userId);
  const message = `Sjekk ${params.displayName} på BioBlix`;

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title: 'BioBlix', text: message, url });
    return;
  }

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return;
  }

  await Share.share(
    Platform.OS === 'ios'
      ? { url, message: `${message}\n${url}` }
      : { message: `${message}\n${url}`, title: 'BioBlix' }
  );
}
