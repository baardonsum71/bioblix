/**
 * Platform helpers for Expo Web (Vercel) vs native (EAS).
 * Prefer these over ad-hoc Platform.OS checks in feature code.
 */
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
