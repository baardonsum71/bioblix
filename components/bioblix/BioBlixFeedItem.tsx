import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';

import { BioBlixFeedOverlay } from '@/components/bioblix/BioBlixFeedOverlay';
import { BioBlixSafetyMenu } from '@/components/bioblix/BioBlixSafetyMenu';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import type { Post } from '@/types';

type BioBlixFeedItemProps = {
  post: Post;
  height: number;
  isActive: boolean;
  username: string;
  viewerUserId: string | null;
  onAuthorBlocked?: () => void;
  onDeleted?: () => void;
  onEdit?: () => void;
};

/** Web: raw <video> — expo-video VideoView ignores fill sizing in Safari. */
function FeedVideoWeb({ uri, isActive }: { uri: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.muted = false;
      void el.play().catch(() => {
        el.muted = true;
        void el.play().catch(() => undefined);
      });
    } else {
      el.pause();
      el.muted = true;
    }
  }, [isActive, uri]);

  return (
    <video
      ref={videoRef}
      src={uri}
      loop
      playsInline
      style={webVideoStyle}
    />
  );
}

function FeedVideoNative({
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
      contentFit="contain"
      nativeControls={false}
      allowsPictureInPicture={false}
      playsInline
    />
  );
}

function FeedVideo({ uri, isActive }: { uri: string; isActive: boolean }) {
  if (Platform.OS === 'web') {
    return <FeedVideoWeb uri={uri} isActive={isActive} />;
  }
  return <FeedVideoNative uri={uri} isActive={isActive} />;
}

export function BioBlixFeedItem({
  post,
  height,
  isActive,
  username,
  viewerUserId,
  onAuthorBlocked,
  onDeleted,
  onEdit,
}: BioBlixFeedItemProps) {
  const { t } = useI18n();
  const isOwner = Boolean(viewerUserId && viewerUserId === post.userId);

  return (
    <View style={[styles.item, { height }]}>
      {post.mediaType === 'video' ? (
        <FeedVideo uri={post.mediaUrl} isActive={isActive} />
      ) : (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          contentFit="contain"
        />
      )}

      <BioBlixSafetyMenu
        postId={post.id}
        authorUserId={post.userId}
        viewerUserId={viewerUserId}
        onBlocked={onAuthorBlocked}
        onDeleted={onDeleted}
        onEdit={onEdit}
      />

      {isOwner && onEdit ? (
        <Pressable
          style={styles.editBtn}
          onPress={onEdit}
          hitSlop={10}
          accessibilityLabel={t('social.edit')}
        >
          <BioBlixText variant="caption" color={Colors.white}>
            {t('social.edit')}
          </BioBlixText>
        </Pressable>
      ) : null}

      <BioBlixFeedOverlay
        post={post}
        title={post.title}
        description={post.description}
        username={username}
        userId={post.userId}
        tags={post.tags}
        linkUrl={post.linkUrl}
        viewerUserId={viewerUserId}
      />
    </View>
  );
}

const webVideoStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
  backgroundColor: '#050B12',
};

const styles = StyleSheet.create({
  item: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#050B12',
    overflow: 'hidden',
  },
  media: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  editBtn: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 20,
    backgroundColor: 'rgba(7,20,16,0.55)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(220,232,224,0.25)',
  },
});
