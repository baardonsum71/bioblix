import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixFeedItem } from '@/components/bioblix/BioBlixFeedItem';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Brand, Colors } from '@/constants/Colors';
import { useAppUserId } from '@/hooks/useAppUserId';
import { useBioBlixFeed } from '@/hooks/useBioBlixFeed';
import { useBioBlixFeedNavigation } from '@/hooks/useBioBlixFeedNavigation';
import { isWeb } from '@/lib/platform';
import { getUserById } from '@/services/users';
import type { Post } from '@/types';

function displayNameFor(
  userId: string,
  authors: Record<string, string | undefined>
): string {
  const name = authors[userId]?.trim();
  if (name) return name;
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 10)}…`;
}

export default function BioBlixFeed() {
  const { posts, loading, error, refresh, hideAuthor } = useBioBlixFeed(40);
  const viewerUserId = useAppUserId();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [authors, setAuthors] = useState<Record<string, string | undefined>>({});
  const listRef = useRef<FlatList<Post>>(null);

  const activePostId = posts[activeIndex]?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadAuthors() {
      const ids = [...new Set(posts.map((p) => p.userId))];
      if (ids.length === 0) return;

      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const user = await getUserById(id);
            return [id, user?.displayName ?? id] as const;
          } catch {
            return [id, id] as const;
          }
        })
      );

      if (!cancelled) {
        setAuthors((prev) => {
          const next = { ...prev };
          for (const [id, name] of entries) next[id] = name;
          return next;
        });
      }
    }

    void loadAuthors();
    return () => {
      cancelled = true;
    };
  }, [posts]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((token) => token.isViewable);
      if (first?.index == null) return;
      setActiveIndex(first.index);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 80,
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
    enabled: isWeb && viewportHeight > 0 && posts.length > 0,
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
      const index = Math.round(event.nativeEvent.contentOffset.y / viewportHeight);
      setActiveIndex(index);
    },
    [viewportHeight]
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <BioBlixText variant="title" style={styles.emptyTitle}>
            Kunne ikke laste BioBlix
          </BioBlixText>
          <BioBlixText variant="body" color={Colors.mistDim} style={styles.emptySub}>
            {error.message}
          </BioBlixText>
          <Pressable style={styles.retry} onPress={() => void refresh()}>
            <BioBlixText variant="label" color={Colors.ink}>
              Prøv igjen
            </BioBlixText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.center}>
        <BioBlixText variant="label" color={Colors.lime}>
          {Brand.name}
        </BioBlixText>
        <BioBlixText variant="title" style={styles.emptyTitle}>
          Ingen blix ennå
        </BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.emptySub}>
          Publiser det første produkt-blixet fra Publiser-fanen.
        </BioBlixText>
      </View>
    );
  }, [loading, error, refresh]);

  return (
    <View
      style={[styles.root, isWeb ? webRootStyle : null]}
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
              username={displayNameFor(item.userId, authors)}
              viewerUserId={viewerUserId}
              onAuthorBlocked={() => hideAuthor(item.userId)}
            />
          )}
          pagingEnabled={!isWeb}
          snapToInterval={viewportHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          scrollEnabled
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onMomentumScrollEnd}
          windowSize={isWeb ? 5 : 3}
          maxToRenderPerBatch={isWeb ? 3 : 2}
          initialNumToRender={1}
          removeClippedSubviews={!isWeb}
          ListEmptyComponent={listEmpty}
          refreshControl={
            isWeb ? undefined : (
              <RefreshControl
                refreshing={loading && posts.length > 0}
                onRefresh={() => void refresh()}
                tintColor={Colors.lime}
              />
            )
          }
          style={[styles.list, isWeb ? webListStyle : null]}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      )}

      {isWeb && posts.length > 1 ? (
        <BioBlixText variant="caption" color={Colors.mistDim} style={styles.webHint}>
          ↑ ↓ / J K eller musehjul for å bytte blix
        </BioBlixText>
      ) : null}
    </View>
  );
}

/** Desktop browser CSS — keep page scroll from fighting the snap feed. */
const webRootStyle = {
  height: '100vh',
  maxHeight: '100vh',
  overflow: 'hidden',
  touchAction: 'none',
  overscrollBehavior: 'none',
} as unknown as object;

const webListStyle = {
  touchAction: 'none',
  overscrollBehavior: 'none',
} as unknown as object;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.ink,
    gap: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySub: {
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 320,
  },
  retry: {
    backgroundColor: Colors.lime,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  webHint: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 5,
  },
});
