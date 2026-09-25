import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

type ServiceAccountFields = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function parseServiceAccountJson(raw: string): ServiceAccountFields {
  let text = raw.trim();
  // Vercel sometimes wraps the whole JSON in extra quotes.
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  // Double-encoded: env value is a JSON string containing JSON.
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON looks double-encoded but inner JSON is invalid'
      );
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object');
  }

  const sa = parsed as Partial<ServiceAccountFields>;
  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON missing project_id, client_email, or private_key'
    );
  }

  return {
    project_id: sa.project_id,
    client_email: sa.client_email,
    private_key: sa.private_key.replace(/\\n/g, '\n'),
  };
}

/**
 * Firebase Admin for trusted server writes (webhooks / custom tokens).
 * Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full service-account JSON string.
 */
export function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  const serviceAccount = parseServiceAccountJson(raw);

  app = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });

  return app;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
