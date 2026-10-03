import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

import { sanitizeHandle } from '@/lib/validation/handle';

/**
 * Legacy-style entry: /profil?user=per → /per (vanity profile).
 * Mirrors profile.html?user= from the static HTML sketch.
 */
export default function ProfilQueryRedirect() {
  const { user } = useLocalSearchParams<{ user?: string }>();
  const handle = sanitizeHandle(typeof user === 'string' ? user : '');
  if (handle.length >= 3) {
    return <Redirect href={`/${encodeURIComponent(handle)}` as Href} />;
  }
  return <Redirect href="/" />;
}
