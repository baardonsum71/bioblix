/**
 * Fail the Vercel/web build early if required public env is missing.
 * Preview deploys often forget Preview-scoped env vars.
 * EXPO_PUBLIC_* is inlined at Metro export time — Redeploy after changes.
 */
const required = [
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const missing = required.filter((key) => !process.env[key]?.trim());

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
if (clerkKey && !clerkKey.startsWith('pk_')) {
  console.error(
    '\n[bioblix] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_test_ or pk_live_ (got "' +
      clerkKey.slice(0, 12) +
      '…").\nDo not paste sk_… here — that belongs in CLERK_SECRET_KEY (server only).\n'
  );
  process.exit(1);
}

if (missing.length) {
  console.error(
    '\n[bioblix] Missing env for web build:\n  - ' +
      missing.join('\n  - ') +
      '\n\nIn Vercel → Settings → Environment Variables, set each for Production AND Preview (exact names), then Redeploy with Clear cache.\n'
  );
  process.exit(1);
}

console.log('[bioblix] Clerk + Firebase EXPO_PUBLIC_* env present for web build.');
console.log(
  '[bioblix] Clerk publishable key prefix:',
  clerkKey.slice(0, 7) + '…'
);
