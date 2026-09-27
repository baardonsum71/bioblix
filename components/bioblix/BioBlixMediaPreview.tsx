import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { BioBlixPalette } from '@/constants/bioblixTheme';
import type { MediaType } from '@/types';

type PreviewProps = {
  uri: string;
  mediaType: MediaType;
};

function ImagePreview({ uri }: { uri: string }) {
  return (
    <View style={styles.frame}>
      <Image source={{ uri }} style={styles.preview} contentFit="contain" />
    </View>
  );
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.frame}>
      <VideoView
        player={player}
        style={styles.preview}
        contentFit="cover"
        nativeControls={false}
        playsInline
      />
    </View>
  );
}

export function BioBlixMediaPreview({ uri, mediaType }: PreviewProps) {
  if (mediaType === 'image') {
    return <ImagePreview uri={uri} />;
  }
  return <VideoPreview uri={uri} />;
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 360,
    backgroundColor: BioBlixPalette.night,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
});
