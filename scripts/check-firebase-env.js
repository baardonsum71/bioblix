/**
 * Fail the Vercel/web build early if Firebase public env is missing.
 * Preview deploys often forget Preview-scoped env vars.
 */
const required = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(
    '\n[bioblix] Missing Firebase env for web build:\n  - ' +
      missing.join('\n  - ') +
      '\n\nIn Vercel → Settings → Environment Variables, set each for Production AND Preview, then Redeploy with Clear cache.\n'
  );
  process.exit(1);
}

console.log('[bioblix] Firebase EXPO_PUBLIC_* env present for web build.');
