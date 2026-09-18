import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

/**
 * Firebase Admin for trusted server writes (webhooks).
 * Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full service-account JSON string.
 */
export function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  const serviceAccount = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  app = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });

  return app;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
