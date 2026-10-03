import { createElement } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';
import { parseSpotifyUrl } from '@/lib/spotify/embed';

type Props = {
  /** Stored Spotify share URL (open.spotify.com/… or spotify:…). */
  url: string;
};

/**
 * Official Spotify embed player (web iframe).
 * Native falls back to opening the track in the Spotify app / browser.
 */
export function BioBlixSpotifyEmbed({ url }: Props) {
  const { t } = useI18n();
  const parsed = parseSpotifyUrl(url);
  if (!parsed) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrap} accessibilityLabel={t('profile.spotifyPlayer')}>
        {createElement('iframe', {
          src: parsed.embedUrl,
          width: '100%',
          height: 80,
          frameBorder: '0',
          allowFullScreen: true,
          allow:
            'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
          loading: 'lazy',
          title: t('profile.spotifyPlayer'),
          style: {
            borderRadius: 12,
            border: 'none',
            width: '100%',
            height: 80,
            display: 'block',
            backgroundColor: BioBlixPalette.nightElevated,
          },
        })}
      </View>
    );
  }

  return (
    <Pressable
      style={styles.nativeFallback}
      onPress={() => void Linking.openURL(parsed.pageUrl)}
    >
      <BioBlixText variant="label" color={BioBlixPalette.aurora}>
        {t('profile.spotifyOpen')}
      </BioBlixText>
      <BioBlixText variant="caption" color={BioBlixPalette.muted}>
        {t('profile.spotifyOpenHint')}
      </BioBlixText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
    marginBottom: 4,
  },
  nativeFallback: {
    width: '100%',
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(0,245,212,0.28)',
    backgroundColor: 'rgba(15,20,31,0.85)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
  },
});
