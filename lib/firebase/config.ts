import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Client Firebase config via Expo public env vars.
 * Available locally (`.env`) and on Vercel when EXPO_PUBLIC_* are set at build time.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== 'missing'
);

function assertFirebaseConfig(): void {
  if (isFirebaseConfigured) return;
  console.warn(
    '[firebase] Missing EXPO_PUBLIC_FIREBASE_* env vars. ' +
      'Copy .env.example → .env locally, and set the same keys in Vercel → Environment Variables, then Redeploy (Clear cache).'
  );
}

assertFirebaseConfig();

function createFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();

  if (!isFirebaseConfigured) {
    // Keep the web shell alive on Vercel before secrets are wired.
    // Real reads/writes will fail until env is set + redeployed.
    return initializeApp({
      apiKey: 'missing',
      authDomain: 'missing.firebaseapp.com',
      projectId: 'missing',
      storageBucket: 'missing.appspot.com',
      messagingSenderId: '0',
      appId: '1:0:web:0',
    });
  }

  return initializeApp(firebaseConfig);
}

const app: FirebaseApp = createFirebaseApp();

/**
 * Prefer memory cache + long polling on web to avoid sticky "client is offline"
 * after a failed first connection (common behind previews / proxies).
 */
function createDb(): Firestore {
  if (!isFirebaseConfigured) {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const db: Firestore = createDb();
export const storage: FirebaseStorage = getStorage(app);
export { app, firebaseConfig };
