import type { Href } from 'expo-router';

import type { MessageKey } from '@/lib/i18n/dictionaries';

/** Why the guest is sent to create a free profile. */
export type SignInReason =
  | 'like'
  | 'comment'
  | 'follow'
  | 'publish'
  | 'live'
  | 'watchLive';

const REASON_BODY: Record<SignInReason, MessageKey> = {
  like: 'auth.reason.like',
  comment: 'auth.reason.comment',
  follow: 'auth.reason.follow',
  publish: 'auth.reason.publish',
  live: 'auth.reason.live',
  watchLive: 'auth.reason.watchLive',
};

export function isSignInReason(value: unknown): value is SignInReason {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(REASON_BODY, value)
  );
}

export function signInReasonBodyKey(reason: SignInReason): MessageKey {
  return REASON_BODY[reason];
}

export function signInHref(reason?: SignInReason): Href {
  if (!reason) return '/(auth)/sign-in' as Href;
  return `/(auth)/sign-in?reason=${reason}` as Href;
}
