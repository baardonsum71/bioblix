import { useAuth } from '@clerk/expo';
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

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';
import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { notify } from '@/lib/platform';
import { validateProLinkUrl } from '@/lib/validation/proLink';
import {
  MAX_TAGS_PER_POST,
  parseTagInput,
} from '@/lib/validation/tags';
import { updatePost } from '@/services/posts';
import type { Post } from '@/types';

type BioBlixEditPostModalProps = {
  post: Post | null;
  visible: boolean;
  canUseLinks: boolean;
  onClose: () => void;
  onSaved: (post: Post) => void;
};

export function BioBlixEditPostModal({
  post,
  visible,
  canUseLinks,
  onClose,
  onSaved,
}: BioBlixEditPostModalProps) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!post || !visible) return;
    setTitle(post.title);
    setDescription(post.description);
    setLinkUrl(post.linkUrl ?? '');
    setTags(post.tags ?? []);
    setTagDraft('');
    setLinkError(null);
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

  const onSave = async () => {
    if (!post) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      notify('Mangler tittel', 'Gi blixet en tittel.');
      return;
    }
    if (linkError) {
      notify('Ugyldig lenke', linkError);
      return;
    }

    setSaving(true);
    try {
      await syncFirebaseAuthFromClerk(() => getToken());
      const nextLink =
        canUseLinks && linkUrl.trim() ? linkUrl.trim() : null;
      await updatePost(post.id, post.userId, {
        title: trimmedTitle,
        description: description.trim(),
        tags,
        linkUrl: nextLink,
      });
      onSaved({
        ...post,
        title: trimmedTitle,
        description: description.trim(),
        tags,
        linkUrl: nextLink,
      });
      notify('Lagret', 'Blixet er oppdatert.');
      onClose();
    } catch (err) {
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke lagre'
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
              Avbryt
            </BioBlixText>
          </Pressable>
          <BioBlixText variant="title">Rediger blix</BioBlixText>
          <Pressable onPress={() => void onSave()} hitSlop={12} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.lime} />
            ) : (
              <BioBlixText variant="label" color={Colors.lime}>
                Lagre
              </BioBlixText>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <BioBlixText variant="caption" color={Colors.mistDim}>
            Tittel
          </BioBlixText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={Colors.mistDim}
            placeholder="Tittel"
          />

          <BioBlixText variant="caption" color={Colors.mistDim}>
            Beskrivelse
          </BioBlixText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholderTextColor={Colors.mistDim}
            placeholder="Beskrivelse"
            multiline
          />

          <BioBlixText variant="caption" color={Colors.mistDim}>
            Tags
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
              placeholder="Legg til tag"
              autoCapitalize="none"
              returnKeyType="done"
            />
          ) : null}

          <BioBlixText variant="caption" color={Colors.mistDim}>
            Lenke {canUseLinks ? '' : '(Pro)'}
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
