import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

import type { MediaType } from '@/types';

type PreviewProps = {
  uri: string;
  mediaType: MediaType;
};

function ImagePreview({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={styles.preview} contentFit="cover" />;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.preview}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export function BioBlixMediaPreview({ uri, mediaType }: PreviewProps) {
  if (mediaType === 'image') {
    return <ImagePreview uri={uri} />;
  }
  return <VideoPreview uri={uri} />;
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 360,
  },
});
