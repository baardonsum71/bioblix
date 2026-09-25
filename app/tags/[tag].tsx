import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { BioBlixFeedItem } from '@/components/bioblix/BioBlixFeedItem';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixPalette, Colors } from '@/constants/bioblixTheme';
import { useAppUserId } from '@/hooks/useAppUserId';
import { normalizeTag } from '@/lib/validation/tags';
import { listPostsByTag } from '@/services/posts';
import { getTagById } from '@/services/tags';
import { getUserById } from '@/services/users';
import type { Post } from '@/types';

export default function TagFeedScreen() {
  const { tag: rawTag } = useLocalSearchParams<{ tag: string }>();
  const slug = normalizeTag(decodeURIComponent(rawTag ?? '')) ?? '';
  const viewerId = useAppUserId();
  const { height } = useWindowDimensions();
  const itemHeight = Math.max(height - 120, 480);

  const [posts, setPosts] = useState<Post[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [postCount, setPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!slug) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, tagDoc] = await Promise.all([
        listPostsByTag(slug, 40),
        getTagById(slug),
      ]);
      setPosts(data);
      setPostCount(tagDoc?.postCount ?? data.length);
      setActiveId(data[0]?.id ?? null);

      const ids = [...new Set(data.map((p) => p.userId))];
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const user = await getUserById(id);
            return [id, user?.displayName ?? id.slice(0, 8)] as const;
          } catch {
            return [id, id.slice(0, 8)] as const;
          }
        })
      );
      setUsernames(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente blix');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!slug) {
    return (
      <BioBlixScreenShell style={styles.shell}>
        <BioBlixText variant="body" color={Colors.mistDim}>
          Ugyldig tag.
        </BioBlixText>
      </BioBlixScreenShell>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <BioBlixText variant="title">#{slug}</BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {postCount != null
            ? `${postCount} ${postCount === 1 ? 'blix' : 'blix'}`
            : '…'}
        </BioBlixText>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.lime} style={styles.spinner} />
      ) : null}
      {error ? (
        <BioBlixText
          variant="caption"
          color={BioBlixPalette.danger}
          style={styles.error}
        >
          {error}
        </BioBlixText>
      ) : null}

      {!loading && posts.length === 0 ? (
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.empty}>
          Ingen blix med denne taggen ennå.
        </BioBlixText>
      ) : null}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onViewableItemsChanged={({ viewableItems }) => {
          const first = viewableItems[0]?.item as Post | undefined;
          if (first) setActiveId(first.id);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        renderItem={({ item }) => (
          <BioBlixFeedItem
            post={item}
            height={itemHeight}
            isActive={item.id === activeId}
            username={usernames[item.userId] ?? 'bruker'}
            viewerUserId={viewerId}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  shell: {
    padding: 24,
    paddingTop: 56,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
    backgroundColor: Colors.ink,
    zIndex: 2,
  },
  spinner: {
    margin: 24,
  },
  error: {
    marginHorizontal: 20,
  },
  empty: {
    margin: 20,
  },
});
