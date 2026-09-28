import { apiUrl } from '@/lib/apiBase';
import type { CoinRedeemPlan } from '@/constants/coins';

type TokenGetter = () => Promise<string | null>;

async function coinsRequest(
  getClerkToken: TokenGetter,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const token = await getClerkToken();
  if (!token) throw new Error('Not signed in');

  const res = await fetch(apiUrl('/api/coins'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    coins?: number;
    awarded?: boolean;
    coinProUntil?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Coins request failed (${res.status})`);
  }

  return data;
}

export async function claimSignupCoins(
  getClerkToken: TokenGetter
): Promise<{ awarded: boolean; coins: number }> {
  const data = await coinsRequest(getClerkToken, { action: 'signup' });
  return {
    awarded: data.awarded === true,
    coins: typeof data.coins === 'number' ? data.coins : 0,
  };
}

export async function awardPublishCoins(
  getClerkToken: TokenGetter,
  postId: string
): Promise<{ awarded: boolean; coins: number }> {
  const data = await coinsRequest(getClerkToken, {
    action: 'publish',
    postId,
  });
  return {
    awarded: data.awarded === true,
    coins: typeof data.coins === 'number' ? data.coins : 0,
  };
}

export async function redeemCoins(
  getClerkToken: TokenGetter,
  plan: CoinRedeemPlan
): Promise<{ coins: number; coinProUntil?: string }> {
  const data = await coinsRequest(getClerkToken, {
    action: 'redeem',
    plan,
  });
  return {
    coins: typeof data.coins === 'number' ? data.coins : 0,
    coinProUntil:
      typeof data.coinProUntil === 'string' ? data.coinProUntil : undefined,
  };
}
