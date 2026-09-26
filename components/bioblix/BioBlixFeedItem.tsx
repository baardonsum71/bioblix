import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';

import { BioBlixFeedOverlay } from '@/components/bioblix/BioBlixFeedOverlay';
import { BioBlixSafetyMenu } from '@/components/bioblix/BioBlixSafetyMenu';
import type { Post } from '@/types';

type BioBlixFeedItemProps = {
  post: Post;
  height: number;
  isActive: boolean;
  username: string;
  viewerUserId: string | null;
  onAuthorBlocked?: () => void;
};

function FeedVideo({
  uri,
  isActive,
}: {
  uri: string;
  isActive: boolean;
}) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.muted = false;
      player.play();
    } else {
      player.pause();
      player.muted = true;
    }
  }, [isActive, player]);

  return (
    <VideoView
      player={player}
      style={styles.media}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
}

export function BioBlixFeedItem({
  post,
  height,
  isActive,
  username,
  viewerUserId,
  onAuthorBlocked,
}: BioBlixFeedItemProps) {
  return (
    <View style={[styles.item, { height }]}>
      {post.mediaType === 'video' ? (
        <FeedVideo uri={post.mediaUrl} isActive={isActive} />
      ) : (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          contentFit="cover"
        />
      )}

      <BioBlixSafetyMenu
        postId={post.id}
        authorUserId={post.userId}
        viewerUserId={viewerUserId}
        onBlocked={onAuthorBlocked}
      />

      <BioBlixFeedOverlay
        title={post.title}
        description={post.description}
        username={username}
        userId={post.userId}
        tags={post.tags}
        linkUrl={post.linkUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    backgroundColor: '#050B12',
    overflow: 'hidden',
  },
  media: {
    ...StyleSheet.absoluteFill,
  },
});
