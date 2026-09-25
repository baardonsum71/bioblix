/**
 * Platform helpers for Expo Web (Vercel) vs native (EAS).
 * Prefer these over ad-hoc Platform.OS checks in feature code.
 */
import { Alert, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/** Alert that actually shows on web (RN Alert is often a no-op there). */
export function notify(title: string, message?: string): void {
  const text = message ? `${title}\n\n${message}` : title;
  if (isWeb && typeof window !== 'undefined') {
    window.alert(text);
    return;
  }
  Alert.alert(title, message);
}