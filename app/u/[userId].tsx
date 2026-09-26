import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { Colors } from '@/constants/Colors';
import { notify } from '@/lib/platform';
import { shareProfile } from '@/lib/shareProfile';
import {
  countFollowers,
  countFollowing,
  followUser,
  isFollowing,
  unfollowUser,
} from '@/services/follows';
import { listPostsByUser } from '@/services/posts';
import { getUserById } from '@/services/users';
import type { Post, User } from '@/types';

export default function PublicProfileScreen() {
  const { userId: rawId } = useLocalSearchParams<{ userId: string }>();
  const userId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const { userId: viewerId, isSignedIn } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followingThem, setFollowingThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [user, userPosts, fol, fing] = await Promise.all([
        getUserById(userId),
        listPostsByUser(userId, 30),
        countFollowers(userId),
        countFollowing(userId),
      ]);
      setProfile(user);
      setPosts(userPosts);
      setFollowers(fol);
      setFollowing(fing);
      if (isSignedIn && viewerId && viewerId !== userId) {
        setFollowingThem(await isFollowing(viewerId, userId));
      } else {
        setFollowingThem(false);
      }
    } catch (err) {
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke laste profil'
      );
    } finally {
      setLoading(false);
    }
  }, [userId, isSignedIn, viewerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggleFollow = async () => {
    if (!isSignedIn || !viewerId) {
      notify('Logg inn', 'Du må være innlogget for å følge andre.');
      router.push('/(auth)/sign-in' as Href);
      return;
    }
    if (viewerId === userId) return;
    setBusy(true);
    try {
      if (followingThem) {
        await unfollowUser(viewerId, userId);
        setFollowingThem(false);
        setFollowers((n) => Math.max(0, n - 1));
      } else {
        await followUser(viewerId, userId);
        setFollowingThem(true);
        setFollowers((n) => n + 1);
      }
    } catch (err) {
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke oppdatere følge'
      );
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    if (!profile) return;
    try {
      await shareProfile({
        userId: profile.id,
        displayName: profile.displayName,
      });
      notify('Delt', 'Profillenken er klar (delt eller kopiert).');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke dele profil'
      );
    }
  };

  if (!userId) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>Ugyldig profil</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  if (loading) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <ActivityIndicator color={Colors.lime} />
      </BioBlixScreenShell>
    );
  }

  if (!profile) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>Fant ikke brukeren</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  const isSelf = Boolean(viewerId && viewerId === userId);

  return (
    <BioBlixScreenShell style={styles.shell}>
      <View style={styles.header}>
        {profile.imageUrl ? (
          <Image
            source={{ uri: profile.imageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <BioBlixText variant="title" color={Colors.mistDim}>
              {profile.displayName.slice(0, 1).toUpperCase()}
            </BioBlixText>
          </View>
        )}
        <View style={styles.headerText}>
          <BioBlixText variant="title">{profile.displayName}</BioBlixText>
          <BioBlixText variant="caption" color={Colors.mistDim}>
            {followers} følgere · {following} følger
          </BioBlixText>
        </View>
      </View>

      <View style={styles.actions}>
        {!isSelf ? (
          <Pressable
            style={[styles.btn, followingThem && styles.btnGhost]}
            onPress={() => void onToggleFollow()}
            disabled={busy}
          >
            <BioBlixText
              variant="label"
              color={followingThem ? Colors.lime : Colors.ink}
            >
              {followingThem ? 'Følger' : 'Følg'}
            </BioBlixText>
          </Pressable>
        ) : null}
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => void onShare()}>
          <BioBlixText variant="label" color={Colors.lime}>
            Del profil
          </BioBlixText>
        </Pressable>
      </View>

      <BioBlixText variant="label" color={Colors.mistDim} style={styles.section}>
        Blix ({posts.length})
      </BioBlixText>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <BioBlixText variant="body" color={Colors.mistDim}>
            Ingen blix ennå.
          </BioBlixText>
        }
        renderItem={({ item }) => (
          <View style={styles.postRow}>
            <Image
              source={{ uri: item.mediaUrl }}
              style={styles.thumb}
              contentFit="cover"
            />
            <View style={styles.postMeta}>
              <BioBlixText variant="body" numberOfLines={2}>
                {item.title}
              </BioBlixText>
              <BioBlixText variant="caption" color={Colors.mistDim} numberOfLines={1}>
                {item.description || item.mediaType}
              </BioBlixText>
            </View>
          </View>
        )}
      />
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: Colors.lime,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.lime,
  },
  section: {
    marginBottom: 10,
  },
  list: {
    paddingBottom: 40,
    gap: 10,
  },
  postRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  thumb: {
    width: 72,
    height: 72,
  },
  postMeta: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    gap: 4,
    justifyContent: 'center',
  },
});
