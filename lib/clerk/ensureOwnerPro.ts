import { apiUrl } from '@/lib/apiBase';
import { isOwnerEmail } from '@/constants/owners';

/**
 * Ask the server to mirror Pro for allowlisted owner emails.
 * No-op for non-owners (200 owner:false).
 */
export async function ensureOwnerProAccess(
  getClerkToken: () => Promise<string | null>,
  email: string | null | undefined
): Promise<{ owner: boolean; isProYearly: boolean }> {
  if (!isOwnerEmail(email)) {
    return { owner: false, isProYearly: false };
  }

  const token = await getClerkToken();
  if (!token) {
    throw new Error('Mangler Clerk-sesjon for eier-Pro');
  }

  const res = await fetch(apiUrl('/api/ensure-owner-pro'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email ?? '' }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Eier-Pro feilet (${res.status})`);
  }

  const data = (await res.json()) as {
    owner?: boolean;
    isProYearly?: boolean;
  };
  return {
    owner: data.owner === true,
    isProYearly: data.isProYearly === true,
  };
}
