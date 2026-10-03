import { Redirect, useLocalSearchParams, type Href } from 'expo-router';
import { Platform } from 'react-native';

import { sanitizeHandle } from '@/lib/validation/handle';

/**
 * /registrer?username=per → Clerk sign-up with handle prefilled.
 * Same funnel as static registrer.html + ?username= GET, inside Expo Router.
 */
export default function RegistrerRedirect() {
  const { username, nick } = useLocalSearchParams<{
    username?: string;
    nick?: string;
  }>();
  const raw =
    typeof username === 'string' ? username : typeof nick === 'string' ? nick : '';
  const handle = sanitizeHandle(raw);

  if (handle.length >= 3 && Platform.OS === 'web') {
    try {
      sessionStorage.setItem('bioblix_claim_nick', handle);
    } catch {
      /* ignore */
    }
  }

  const href =
    handle.length >= 3
      ? (`/(auth)/sign-in?reason=publish&username=${encodeURIComponent(handle)}&nick=${encodeURIComponent(handle)}` as Href)
      : ('/(auth)/sign-in?reason=publish' as Href);

  return <Redirect href={href} />;
}
