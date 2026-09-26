import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused } from 'expo-router';

import { BioBlixFeedItem } from '@/components/bioblix/BioBlixFeedItem';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';
import { useBioBlixFeedNavigation } from '@/hooks/useBioBlixFeedNavigation';
import { isWeb } from '@/lib/platform';
import type { Post } from '@/types';

type BioBlixVerticalFeedProps = {
  posts: Post[];
  usernameFor: (post: Post) => string;
  viewerUserId: string | null;
  loading?: boolean;
  emptyMessage?: string;
  onAuthorBlocked?: (authorUserId: string) => void;
  onDeleted?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  /** When false, skip focus gate (embedded on Konto). */
  requireFocus?: boolean;
  showNavHint?: boolean;
};

/**
 * Full-bleed vertical snap feed (Blix / Mine blix).
 * Touch-friendly on mobile web; wheel/keys on desktop.
 */
export function BioBlixVerticalFeed({
  posts,
  usernameFor,
  viewerUserId,
  loading = false,
  emptyMessage = 'Ingen blix ennå.',
  onAuthorBlocked,
  onDeleted,
  onEdit,
  requireFocus = true,
  showNavHint = true,
}: BioBlixVerticalFeedProps) {
  const isFocused = useIsFocused();
  const active = requireFocus ? isFocused : true;
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Post>>(null);

  const activePostId = posts[activeIndex]?.id ?? null;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((token) => token.isViewable);
      if (first?.index == null) return;
      setActiveIndex(first.index);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
    minimumViewTime: 60,
  }).current;

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!viewportHeight || posts.length === 0) return;
      const clamped = Math.max(0, Math.min(posts.length - 1, index));
      setActiveIndex(clamped);
      listRef.current?.scrollToOffset({
        offset: clamped * viewportHeight,
        animated: true,
      });
    },
    [posts.length, viewportHeight]
  );

  useBioBlixFeedNavigation({
    enabled: active && isWeb && viewportHeight > 0 && posts.length > 0,
    itemCount: posts.length,
    activeIndex,
    onIndexChange: scrollToIndex,
  });

  const getItemLayout = useCallback(
    (_: ArrayLike<Post> | null | undefined, index: number) => ({
      length: viewportHeight,
      offset: viewportHeight * index,
      index,
    }),
    [viewportHeight]
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!viewportHeight) return;
      const index = Math.round(
        event.nativeEvent.contentOffset.y / viewportHeight
      );
      setActiveIndex(Math.max(0, Math.min(posts.length - 1, index)));
    },
    [viewportHeight, posts.length]
  );

  useEffect(() => {
    if (activeIndex >= posts.length && posts.length > 0) {
      setActiveIndex(posts.length - 1);
    }
  }, [posts.length, activeIndex]);

  return (
    <View
      style={[styles.root, isWeb && active ? webRootStyle : null]}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.height);
        if (next > 0 && next !== viewportHeight) {
          setViewportHeight(next);
        }
      }}
    >
      {viewportHeight > 0 ? (
        <FlatList
          ref={listRef}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <BioBlixFeedItem
              post={item}
              height={viewportHeight}
              isActive={item.id === activePostId && index === activeIndex}
              username={usernameFor(item)}
              viewerUserId={viewerUserId}
              onAuthorBlocked={
                onAuthorBlocked
                  ? () => onAuthorBlocked(item.userId)
                  : undefined
              }
              onDeleted={onDeleted ? () => onDeleted(item.id) : undefined}
              onEdit={onEdit ? () => onEdit(item) : undefined}
            />
          )}
          pagingEnabled
          snapToInterval={viewportHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          scrollEnabled={active}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onMomentumScrollEnd}
          windowSize={isWeb ? 5 : 3}
          maxToRenderPerBatch={isWeb ? 3 : 2}
          initialNumToRender={1}
          removeClippedSubviews={!isWeb}
          ListEmptyComponent={
            <View style={[styles.center, { height: viewportHeight }]}>
              {loading ? (
                <ActivityIndicator color={Colors.lime} size="large" />
              ) : (
                <BioBlixText
                  variant="body"
                  color={Colors.mistDim}
                  style={styles.empty}
                >
                  {emptyMessage}
                </BioBlixText>
              )}
            </View>
          }
          style={[styles.list, isWeb && active ? webListStyle : null]}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      )}

      {showNavHint && active && posts.length > 1 ? (
        <BioBlixText
          variant="caption"
          color={Colors.mistDim}
          style={styles.webHint}
        >
          {isWeb
            ? 'Sveip eller ↑ ↓ for å bytte blix'
            : 'Sveip for å bytte blix'}
        </BioBlixText>
      ) : null}
    </View>
  );
}

/** Allow vertical touch pan — `none` blocks iPhone Safari scrolling. */
const webRootStyle = {
  flex: 1,
  height: '100%',
  maxHeight: '100%',
  overflow: 'hidden',
  touchAction: 'pan-y',
  overscrollBehavior: 'none',
} as unknown as object;

const webListStyle = {
  flex: 1,
  touchAction: 'pan-y',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'none',
} as unknown as object;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
    minHeight: 280,
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.ink,
  },
  empty: {
    textAlign: 'center',
    maxWidth: 280,
  },
  webHint: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 5,
    backgroundColor: 'rgba(5,11,18,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
