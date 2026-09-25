import Constants from 'expo-constants';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

type FirebaseExtra = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const extra = (Constants.expoConfig?.extra?.firebase ?? {}) as FirebaseExtra;

/**
 * Prefer Metro-inlined EXPO_PUBLIC_*, fall back to app.config.js `extra.firebase`
 * (both are filled at build time from the same Vercel env).
 */
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.apiKey || '',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.authDomain || '',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.projectId || '',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    extra.storageBucket ||
    '',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    extra.messagingSenderId ||
    '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.appId || '',
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
      'Set them in Vercel for Production AND Preview, then Redeploy with Clear cache.'
  );
}

assertFirebaseConfig();

function createFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();

  if (!isFirebaseConfigured) {
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
