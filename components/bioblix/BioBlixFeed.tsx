import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused } from 'expo-router';

import { BioBlixEditPostModal } from '@/components/bioblix/BioBlixEditPostModal';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixVerticalFeed } from '@/components/bioblix/BioBlixVerticalFeed';
import { Brand, Colors } from '@/constants/Colors';
import { useAppUserId } from '@/hooks/useAppUserId';
import { useBioBlixFeed } from '@/hooks/useBioBlixFeed';
import { useProYearlyEntitlement } from '@/hooks/useProYearlyEntitlement';
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
  const isFocused = useIsFocused();
  const { posts, loading, error, refresh, hideAuthor, removePost } =
    useBioBlixFeed(40);
  const viewerUserId = useAppUserId();
  const { isProYearly, isOwner } = useProYearlyEntitlement(viewerUserId);
  const [authors, setAuthors] = useState<Record<string, string | undefined>>(
    {}
  );
  const [editing, setEditing] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[] | null>(null);

  const displayPosts = localPosts ?? posts;

  useEffect(() => {
    setLocalPosts(null);
  }, [posts]);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthors() {
      const ids = [...new Set(displayPosts.map((p) => p.userId))];
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
  }, [displayPosts]);

  const empty = useMemo(() => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.center}>
          <BioBlixText variant="title" style={styles.emptyTitle}>
            Kunne ikke laste BioBlix
          </BioBlixText>
          <BioBlixText
            variant="body"
            color={Colors.mistDim}
            style={styles.emptySub}
          >
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
    return null;
  }, [loading, error, refresh]);

  const onSaved = useCallback((updated: Post) => {
    setLocalPosts((prev) => {
      const base = prev ?? posts;
      return base.map((p) => (p.id === updated.id ? updated : p));
    });
  }, [posts]);

  if (!isFocused && displayPosts.length === 0 && !loading) {
    return <View style={styles.root} />;
  }

  if (empty && displayPosts.length === 0) {
    return <View style={styles.root}>{empty}</View>;
  }

  if (!loading && !error && displayPosts.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <BioBlixText variant="label" color={Colors.lime}>
            {Brand.name}
          </BioBlixText>
          <BioBlixText variant="title" style={styles.emptyTitle}>
            Ingen blix ennå
          </BioBlixText>
          <BioBlixText
            variant="body"
            color={Colors.mistDim}
            style={styles.emptySub}
          >
            Publiser det første produkt-blixet fra Publiser-fanen.
          </BioBlixText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BioBlixVerticalFeed
        posts={displayPosts}
        loading={loading}
        viewerUserId={viewerUserId}
        usernameFor={(p) => displayNameFor(p.userId, authors)}
        onAuthorBlocked={hideAuthor}
        onDeleted={removePost}
        onEdit={(post) => setEditing(post)}
        requireFocus
      />
      <BioBlixEditPostModal
        post={editing}
        visible={Boolean(editing)}
        canUseLinks={Boolean(isProYearly || isOwner)}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
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
});
