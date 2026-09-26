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

/** Confirm dialog that works on web (`window.confirm`) and native Alert. */
export function confirmAction(
  title: string,
  message: string,
  options?: {
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }
): Promise<boolean> {
  const confirmLabel = options?.confirmLabel ?? 'OK';
  const cancelLabel = options?.cancelLabel ?? 'Avbryt';

  if (isWeb && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: options?.destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}