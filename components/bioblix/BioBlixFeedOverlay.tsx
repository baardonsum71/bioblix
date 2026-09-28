import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  confirmAndOpenBioBlixLink,
  bioBlixLinkCtaLabel,
} from '@/components/bioblix/bioBlixLinks';
import { BioBlixTagChips } from '@/components/bioblix/BioBlixTagChips';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import {
  signInHref,
  type SignInReason,
} from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/dictionaries';
import { notify } from '@/lib/platform';
import { addComment, listComments, type PostComment } from '@/services/comments';
import { hasLikedPost, toggleLikePost } from '@/services/likes';
import type { Post } from '@/types';

type BioBlixFeedOverlayProps = {
  post: Post;
  title: string;
  description: string;
  username: string;
  userId?: string;
  tags?: string[];
  linkUrl?: string | null;
  viewerUserId: string | null;
};

const SIGN_IN_BODY: Record<'like' | 'comment', MessageKey> = {
  like: 'social.signInToLike',
  comment: 'social.signInToComment',
};

export function BioBlixFeedOverlay({
  post,
  title,
  description,
  username,
  userId,
  tags = [],
  linkUrl,
  viewerUserId,
}: BioBlixFeedOverlayProps) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const hasLink = Boolean(linkUrl?.trim());

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setCommentCount(post.commentCount ?? 0);
  }, [post.id, post.likeCount, post.commentCount]);

  useEffect(() => {
    let cancelled = false;
    if (!viewerUserId) {
      setLiked(false);
      return;
    }
    void hasLikedPost(post.id, viewerUserId)
      .then((v) => {
        if (!cancelled) setLiked(v);
      })
      .catch(() => {
        if (!cancelled) setLiked(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, viewerUserId]);

  const requireSignIn = useCallback(
    (reason: Extract<SignInReason, 'like' | 'comment'>) => {
      notify(t('auth.createFreeProfile'), t(SIGN_IN_BODY[reason]));
      router.push(signInHref(reason) as Href);
    },
    [router, t]
  );

  const onToggleLike = useCallback(async () => {
    if (!viewerUserId) {
      requireSignIn('like');
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(Math.max(0, prevCount + (prevLiked ? -1 : 1)));
    try {
      const result = await toggleLikePost(post.id, viewerUserId);
      setLiked(result.liked);
      setLikeCount(Math.max(0, prevCount + result.likeCountDelta));
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setLikeBusy(false);
    }
  }, [
    viewerUserId,
    likeBusy,
    liked,
    likeCount,
    post.id,
    requireSignIn,
    t,
  ]);

  const openComments = useCallback(async () => {
    setCommentsOpen(true);
    setCommentsLoading(true);
    try {
      setComments(await listComments(post.id));
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id]);

  const onSendComment = useCallback(async () => {
    if (!viewerUserId) {
      requireSignIn('comment');
      return;
    }
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const created = await addComment(post.id, viewerUserId, text);
      setComments((prev) => [created, ...prev]);
      setCommentCount((n) => n + 1);
      setDraft('');
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setSending(false);
    }
  }, [viewerUserId, draft, sending, post.id, requireSignIn, t]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.actions} pointerEvents="box-none">
        <Pressable style={styles.actionBtn} onPress={() => void onToggleLike()}>
          <BioBlixText variant="title" color={liked ? BioBlixPalette.magenta : Colors.white}>
            {liked ? '♥' : '♡'}
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.white}>
            {likeCount}
          </BioBlixText>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => void openComments()}>
          <BioBlixText variant="title" color={Colors.white}>
            💬
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.white}>
            {commentCount}
          </BioBlixText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Pressable
          onPress={() => {
            if (userId) {
              router.push(`/u/${encodeURIComponent(userId)}` as Href);
            }
          }}
          disabled={!userId}
        >
          <BioBlixText variant="caption" color={Colors.lime}>
            @{username}
          </BioBlixText>
        </Pressable>
        <BioBlixText variant="title" numberOfLines={2}>
          {title}
        </BioBlixText>
        {description ? (
          <BioBlixText variant="body" color={Colors.mist} numberOfLines={3}>
            {description}
          </BioBlixText>
        ) : null}

        {tags.length > 0 ? (
          <BioBlixTagChips
            tags={tags}
            compact
            onPressTag={(tag) =>
              router.push(`/tags/${encodeURIComponent(tag)}` as Href)
            }
          />
        ) : null}

        {hasLink ? (
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() =>
              confirmAndOpenBioBlixLink(linkUrl!.trim(), { locale })
            }
          >
            <BioBlixText variant="title" color={Colors.ink}>
              {bioBlixLinkCtaLabel(linkUrl!, locale)}
            </BioBlixText>
          </Pressable>
        ) : null}
      </View>

      <Modal
        visible={commentsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentsOpen(false)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <BioBlixText variant="title">{t('social.comments')}</BioBlixText>
            <Pressable onPress={() => setCommentsOpen(false)}>
              <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                {t('common.cancel')}
              </BioBlixText>
            </Pressable>
          </View>
          {commentsLoading ? (
            <ActivityIndicator color={Colors.lime} style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              contentContainerStyle={styles.commentList}
              ListEmptyComponent={
                <BioBlixText variant="body" color={Colors.mistDim}>
                  {t('social.noComments')}
                </BioBlixText>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <BioBlixText variant="caption" color={Colors.lime}>
                    @{item.userId.slice(0, 8)}
                  </BioBlixText>
                  <BioBlixText variant="body">{item.text}</BioBlixText>
                </View>
              )}
            />
          )}
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder={t('social.commentPlaceholder')}
              placeholderTextColor={BioBlixPalette.muted}
              value={draft}
              onChangeText={setDraft}
              maxLength={500}
            />
            <Pressable
              style={styles.sendBtn}
              onPress={() => void onSendComment()}
              disabled={sending}
            >
              <BioBlixText variant="label" color={Colors.ink}>
                {t('social.send')}
              </BioBlixText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.scrim,
  },
  actions: {
    position: 'absolute',
    right: 14,
    bottom: 140,
    gap: 16,
    alignItems: 'center',
    zIndex: 5,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 48,
    paddingRight: 72,
    gap: 8,
  },
  cta: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaPressed: {
    backgroundColor: Colors.limePressed,
    transform: [{ scale: 0.99 }],
  },
  sheet: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  commentList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  commentRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BioBlixPalette.hairline,
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: BioBlixPalette.hairline,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: BioBlixPalette.nightElevated,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: BioBlixPalette.fog,
  },
  sendBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
