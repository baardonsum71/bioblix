import { useAuth } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BioBlixMediaPreview } from '@/components/bioblix/BioBlixMediaPreview';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';
import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { useI18n } from '@/lib/i18n';
import {
  NSFW_REJECT_CODE,
  assertMediaAllowed,
} from '@/lib/moderation/nsfw';
import { notify } from '@/lib/platform';
import { validateProLinkUrl } from '@/lib/validation/proLink';
import {
  MAX_TAGS_PER_POST,
  parseTagInput,
} from '@/lib/validation/tags';
import { updatePost } from '@/services/posts';
import { uploadPostMedia } from '@/services/storage';
import type { MediaType, Post } from '@/types';

type BioBlixEditPostModalProps = {
  post: Post | null;
  visible: boolean;
  canUseLinks: boolean;
  onClose: () => void;
  onSaved: (post: Post) => void;
};

type PickedMedia = {
  uri: string;
  mediaType: MediaType;
  mimeType?: string;
};

export function BioBlixEditPostModal({
  post,
  visible,
  canUseLinks,
  onClose,
  onSaved,
}: BioBlixEditPostModalProps) {
  const { getToken, userId } = useAuth();
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<PickedMedia | null>(null);

  useEffect(() => {
    if (!post || !visible) return;
    setTitle(post.title);
    setDescription(post.description);
    setLinkUrl(post.linkUrl ?? '');
    setTags(post.tags ?? []);
    setTagDraft('');
    setLinkError(null);
    setMedia({
      uri: post.mediaUrl,
      mediaType: post.mediaType,
    });
  }, [post, visible]);

  const onLinkChange = (value: string) => {
    setLinkUrl(value);
    if (!value.trim() || !canUseLinks) {
      setLinkError(null);
      return;
    }
    const result = validateProLinkUrl(value);
    setLinkError(result.ok ? null : result.message);
  };

  const commitTagDraft = () => {
    if (!tagDraft.trim()) return;
    setTags((prev) => parseTagInput(tagDraft, prev));
    setTagDraft('');
  };

  const removeTag = (slug: string) => {
    setTags((prev) => prev.filter((t) => t !== slug));
  };

  const onPickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify(t('upload.permission'), t('upload.permissionBody'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.7,
      videoMaxDuration: 30,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const isVideo =
      asset.type === 'video' ||
      Boolean(asset.mimeType?.startsWith('video/')) ||
      Boolean(asset.uri.match(/\.(mp4|mov|m4v|webm)$/i));
    const mediaType: MediaType = isVideo ? 'video' : 'image';
    try {
      await assertMediaAllowed(asset.uri, mediaType);
    } catch (err) {
      notify(
        t('common.notAllowed'),
        err instanceof Error && err.message === NSFW_REJECT_CODE
          ? t('moderation.nsfw')
          : err instanceof Error && err.message === 'MODERATION_CHECK_FAIL'
            ? t('moderation.checkFail')
            : err instanceof Error
              ? err.message
              : t('moderation.nsfw')
      );
      return;
    }
    setMedia({
      uri: asset.uri,
      mediaType,
      mimeType: asset.mimeType ?? undefined,
    });
  };

  const onSave = async () => {
    if (!post || !media) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      notify(t('upload.missingTitle'), t('upload.missingTitleBody'));
      return;
    }
    if (linkError) {
      notify(t('upload.invalidLink'), linkError);
      return;
    }

    setSaving(true);
    try {
      await syncFirebaseAuthFromClerk(() => getToken());
      let mediaUrl = post.mediaUrl;
      let mediaType = post.mediaType;
      const mediaChanged = media.uri !== post.mediaUrl;
      if (mediaChanged) {
        await assertMediaAllowed(media.uri, media.mediaType);
        mediaUrl = await uploadPostMedia({
          userId: userId ?? post.userId,
          uri: media.uri,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          getClerkToken: () => getToken(),
        });
        mediaType = media.mediaType;
      }
      const nextLink =
        canUseLinks && linkUrl.trim() ? linkUrl.trim() : null;
      await updatePost(post.id, post.userId, {
        title: trimmedTitle,
        description: description.trim(),
        tags,
        linkUrl: nextLink,
        mediaUrl,
        mediaType,
      });
      onSaved({
        ...post,
        title: trimmedTitle,
        description: description.trim(),
        tags,
        linkUrl: nextLink,
        mediaUrl,
        mediaType,
      });
      notify(t('edit.saved'), t('edit.savedBody'));
      onClose();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('edit.saveFail')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible && Boolean(post)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <BioBlixText variant="label" color={Colors.mistDim}>
              {t('common.cancel')}
            </BioBlixText>
          </Pressable>
          <BioBlixText variant="title">{t('edit.title')}</BioBlixText>
          <Pressable onPress={() => void onSave()} hitSlop={12} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.lime} />
            ) : (
              <BioBlixText variant="label" color={Colors.lime}>
                {t('edit.save')}
              </BioBlixText>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {media ? (
            <BioBlixMediaPreview uri={media.uri} mediaType={media.mediaType} />
          ) : null}
          <Pressable style={styles.changeMedia} onPress={() => void onPickMedia()}>
            <BioBlixText variant="caption" color={Colors.lime}>
              {t('edit.changeMedia')}
            </BioBlixText>
          </Pressable>

          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('edit.titleField')}
          </BioBlixText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={Colors.mistDim}
            placeholder={t('edit.titleField')}
          />

          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('edit.description')}
          </BioBlixText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholderTextColor={Colors.mistDim}
            placeholder={t('edit.description')}
            multiline
          />

          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('edit.tags')}
          </BioBlixText>
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => removeTag(tag)}
                style={styles.tagChip}
              >
                <BioBlixText variant="caption" color={Colors.lime}>
                  #{tag} ×
                </BioBlixText>
              </Pressable>
            ))}
          </View>
          {tags.length < MAX_TAGS_PER_POST ? (
            <TextInput
              value={tagDraft}
              onChangeText={setTagDraft}
              onSubmitEditing={commitTagDraft}
              onBlur={commitTagDraft}
              style={styles.input}
              placeholderTextColor={Colors.mistDim}
              placeholder={t('edit.addTag')}
              autoCapitalize="none"
              returnKeyType="done"
            />
          ) : null}

          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('edit.link')} {canUseLinks ? '' : t('edit.proOnly')}
          </BioBlixText>
          <TextInput
            value={linkUrl}
            onChangeText={onLinkChange}
            editable={canUseLinks}
            style={[
              styles.input,
              !canUseLinks && styles.inputDisabled,
              linkError ? styles.inputError : null,
            ]}
            placeholderTextColor={Colors.mistDim}
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {linkError ? (
            <BioBlixText variant="caption" color={Colors.danger}>
              {linkError}
            </BioBlixText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceMuted,
  },
  content: {
    padding: 20,
    gap: 8,
    paddingBottom: 40,
  },
  changeMedia: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.white,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: Colors.inkElevated,
    color: Colors.mistDim,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
