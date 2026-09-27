import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import type { Post } from '@/types';

type BioBlixPostCardProps = {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  /** When true, play muted looping video preview. */
  active?: boolean;
};

function CardVideo({ uri, active }: { uri: string; active: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  return (
    <VideoView
      player={player}
      style={styles.media}
      contentFit="contain"
      nativeControls={false}
      playsInline
    />
  );
}

/**
 * Same framing as the Blix feed item: full-width vertical frame.
 * Images use contain (full picture); videos use cover (fill frame).
 */
export function BioBlixPostCard({
  post,
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  active = true,
}: BioBlixPostCardProps) {
  const { width } = useWindowDimensions();
  // Cap height so long profiles stay scrollable, but keep feed-like proportions.
  const height = Math.min(width * (16 / 9), 640);

  return (
    <View style={[styles.card, { height, width: '100%' }]}>
      {post.mediaType === 'video' ? (
        <CardVideo uri={post.mediaUrl} active={active} />
      ) : (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          contentFit="contain"
        />
      )}

      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.content}>
        <BioBlixText variant="title" color={Colors.white} numberOfLines={2}>
          {post.title}
        </BioBlixText>
        {post.description ? (
          <BioBlixText
            variant="body"
            color={Colors.mist}
            numberOfLines={3}
          >
            {post.description}
          </BioBlixText>
        ) : null}
        {onEdit || onDelete ? (
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
                <BioBlixText variant="caption" color={Colors.lime}>
                  {editLabel}
                </BioBlixText>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
                <BioBlixText variant="caption" color={BioBlixPalette.magenta}>
                  {deleteLabel}
                </BioBlixText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BioBlixPalette.night,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  media: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.scrim,
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 4,
  },
});
