import { useCallback, useEffect, useState } from 'react';

import type { Post } from '@/types';
import { useAppUserId } from '@/hooks/useAppUserId';
import { listFeedPosts } from '@/services/posts';
import { getBlockedUserIds } from '@/services/users';

export function useBioBlixFeed(pageSize = 20) {
  const viewerId = useAppUserId();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, blocked] = await Promise.all([
        listFeedPosts(pageSize),
        viewerId ? getBlockedUserIds(viewerId) : Promise.resolve([] as string[]),
      ]);
      setBlockedUsers(blocked);
      const blockedSet = new Set(blocked);
      setPosts(data.filter((post) => !blockedSet.has(post.userId)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load feed'));
    } finally {
      setLoading(false);
    }
  }, [pageSize, viewerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Optimistically hide an author after block without full reload. */
  const hideAuthor = useCallback((authorUserId: string) => {
    setBlockedUsers((prev) =>
      prev.includes(authorUserId) ? prev : [...prev, authorUserId]
    );
    setPosts((prev) => prev.filter((post) => post.userId !== authorUserId));
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return {
    posts,
    loading,
    error,
    refresh,
    hideAuthor,
    removePost,
    blockedUsers,
  };
}
