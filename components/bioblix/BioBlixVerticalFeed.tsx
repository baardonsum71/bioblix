import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { BioBlixLivePlayer } from '@/components/bioblix/BioBlixLivePlayer';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';
import { useBioBlixFeedNavigation } from '@/hooks/useBioBlixFeedNavigation';
import { useI18n } from '@/lib/i18n';
import { isWeb } from '@/lib/platform';
import type { LiveSession, Post } from '@/types';

type FeedRow =
  | { kind: 'live'; id: string; live: LiveSession }
  | { kind: 'post'; id: string; post: Post };

type BioBlixVerticalFeedProps = {
  posts: Post[];
  /** Active live sessions shown above posts. */
  lives?: LiveSession[];
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
  lives = [],
  usernameFor,
  viewerUserId,
  loading = false,
  emptyMessage,
  onAuthorBlocked,
  onDeleted,
  onEdit,
  requireFocus = true,
  showNavHint = true,
}: BioBlixVerticalFeedProps) {
  const { t } = useI18n();
  const empty = emptyMessage ?? t('feed.empty');
  const isFocused = useIsFocused();
  const active = requireFocus ? isFocused : true;
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<FeedRow>>(null);

  const rows = useMemo<FeedRow[]>(() => {
    const liveRows: FeedRow[] = lives.map((live) => ({
      kind: 'live',
      id: `live:${live.id}`,
      live,
    }));
    const postRows: FeedRow[] = posts.map((post) => ({
      kind: 'post',
      id: post.id,
      post,
    }));
    return [...liveRows, ...postRows];
  }, [lives, posts]);

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
      if (!viewportHeight || rows.length === 0) return;
      const clamped = Math.max(0, Math.min(rows.length - 1, index));
      setActiveIndex(clamped);
      listRef.current?.scrollToOffset({
        offset: clamped * viewportHeight,
        animated: true,
      });
    },
    [rows.length, viewportHeight]
  );

  useBioBlixFeedNavigation({
    enabled: active && isWeb && viewportHeight > 0 && rows.length > 0,
    itemCount: rows.length,
    activeIndex,
    onIndexChange: scrollToIndex,
  });

  const getItemLayout = useCallback(
    (_: ArrayLike<FeedRow> | null | undefined, index: number) => ({
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
      setActiveIndex(Math.max(0, Math.min(rows.length - 1, index)));
    },
    [viewportHeight, rows.length]
  );

  useEffect(() => {
    if (activeIndex >= rows.length && rows.length > 0) {
      setActiveIndex(rows.length - 1);
    }
  }, [rows.length, activeIndex]);

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
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isActive = index === activeIndex && active;
            if (item.kind === 'live') {
              return (
                <View style={{ height: viewportHeight, width: '100%' }}>
                  <BioBlixLivePlayer
                    live={item.live}
                    active={isActive}
                    height={viewportHeight}
                  />
                </View>
              );
            }
            return (
              <BioBlixFeedItem
                post={item.post}
                height={viewportHeight}
                isActive={isActive}
                username={usernameFor(item.post)}
                viewerUserId={viewerUserId}
                onAuthorBlocked={
                  onAuthorBlocked
                    ? () => onAuthorBlocked(item.post.userId)
                    : undefined
                }
                onDeleted={onDeleted ? () => onDeleted(item.post.id) : undefined}
                onEdit={onEdit ? () => onEdit(item.post) : undefined}
              />
            );
          }}
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
                  {empty}
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

      {showNavHint && active && rows.length > 1 ? (
        <BioBlixText
          variant="caption"
          color={Colors.mistDim}
          style={styles.webHint}
        >
          {isWeb ? t('feed.swipeHint') : t('feed.swipeHintShort')}
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
