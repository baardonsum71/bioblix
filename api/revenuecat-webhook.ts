import type { VercelRequest, VercelResponse } from '@vercel/node';

import { mirrorProYearlyToFirestore } from '../lib/server/mirrorProYearly';

/**
 * RevenueCat → Firestore webhook.
 *
 * Setup:
 * 1. RevenueCat Dashboard → Integrations → Webhooks
 * 2. URL: https://<your-vercel-domain>/api/revenuecat-webhook
 * 3. Authorization header = value of REVENUECAT_WEBHOOK_AUTHORIZATION
 * 4. Vercel env: REVENUECAT_WEBHOOK_AUTHORIZATION, REVENUECAT_SECRET_API_KEY,
 *    FIREBASE_SERVICE_ACCOUNT_JSON
 */
type RevenueCatWebhookBody = {
  api_version?: string;
  event?: {
    id?: string;
    type?: string;
    app_user_id?: string;
    original_app_user_id?: string;
    aliases?: string[];
    entitlement_ids?: string[] | null;
  };
};

const RELEVANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'CANCELLATION',
  'UNCANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
  'TRANSFER',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_PAUSED',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

function assertAuthorized(req: VercelRequest): boolean {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION;
  if (!expected) return false;
  const header = req.headers.authorization;
  return header === expected || header === `Bearer ${expected}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!assertAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body as RevenueCatWebhookBody;
  const event = body.event;
  const appUserId = event?.app_user_id;

  if (!appUserId) {
    return res.status(400).json({ error: 'Missing event.app_user_id' });
  }

  if (event?.type && !RELEVANT_TYPES.has(event.type)) {
    return res.status(200).json({ ok: true, skipped: true, type: event.type });
  }

  try {
    const result = await mirrorProYearlyToFirestore(appUserId);
    return res.status(200).json({
      ok: true,
      appUserId,
      eventId: event?.id ?? null,
      eventType: event?.type ?? null,
      isProYearly: result.isProYearly,
    });
  } catch (error) {
    console.error('[revenuecat-webhook]', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    });
  }
}
