import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';

import { BioBlixMediaPreview } from '@/components/bioblix/BioBlixMediaPreview';
import { BioBlixTagChips } from '@/components/bioblix/BioBlixTagChips';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Brand, Colors } from '@/constants/Colors';
import { useAppUserId } from '@/hooks/useAppUserId';
import { useProYearlyEntitlement } from '@/hooks/useProYearlyEntitlement';
import { presentProYearlyPaywall } from '@/lib/revenuecat/paywall';
import { validateProLinkUrl } from '@/lib/validation/proLink';
import {
  MAX_TAGS_PER_POST,
  normalizeTag,
  parseTagInput,
} from '@/lib/validation/tags';
import { createPost } from '@/services/posts';
import { listPopularTags } from '@/services/tags';
import { uploadPostMedia } from '@/services/storage';
import type { MediaType, Tag } from '@/types';

type PickedMedia = {
  uri: string;
  mediaType: MediaType;
  mimeType?: string;
};

export default function BioBlixUpload() {
  const userId = useAppUserId();
  const { isProYearly, loading: entitlementLoading, refresh } =
    useProYearlyEntitlement(userId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [popular, setPopular] = useState<Tag[]>([]);
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    void listPopularTags(12)
      .then(setPopular)
      .catch(() => setPopular([]));
  }, []);

  const popularCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of popular) map[t.name] = t.postCount;
    return map;
  }, [popular]);

  const onLinkChange = useCallback(
    (value: string) => {
      setLinkUrl(value);
      if (!value.trim()) {
        setLinkError(null);
        return;
      }
      if (!isProYearly) {
        setLinkError(null);
        return;
      }
      const result = validateProLinkUrl(value);
      setLinkError(result.ok ? null : result.message);
    },
    [isProYearly]
  );

  const commitTagDraft = useCallback(() => {
    if (!tagDraft.trim()) return;
    setTags((prev) => parseTagInput(tagDraft, prev));
    setTagDraft('');
  }, [tagDraft]);

  const addSuggestedTag = useCallback((slug: string) => {
    const normalized = normalizeTag(slug);
    if (!normalized) return;
    setTags((prev) => {
      if (prev.includes(normalized) || prev.length >= MAX_TAGS_PER_POST) {
        return prev;
      }
      return [...prev, normalized];
    });
  }, []);

  const removeTag = useCallback((slug: string) => {
    setTags((prev) => prev.filter((t) => t !== slug));
  }, []);

  const canPublish = useMemo(() => {
    return Boolean(
      userId &&
        media &&
        title.trim().length > 0 &&
        !publishing &&
        !linkError
    );
  }, [userId, media, title, publishing, linkError]);

  const pickMedia = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Tilgang i BioBlix',
        'Gi tilgang til bildebiblioteket for å legge til et produkt-blix.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.7,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      videoMaxDuration: 30,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const isVideo =
      asset.type === 'video' ||
      Boolean(asset.mimeType?.startsWith('video/')) ||
      Boolean(asset.uri.match(/\.(mp4|mov|m4v|webm)$/i));

    setMedia({
      uri: asset.uri,
      mediaType: isVideo ? 'video' : 'image',
      mimeType: asset.mimeType ?? undefined,
    });
  }, []);

  const onUpgradePress = useCallback(async () => {
    const entitled = await presentProYearlyPaywall();
    await refresh();
    if (entitled) {
      Alert.alert(
        'Pro Årlig aktiv',
        'Du kan nå legge klikkbare butikklenker på BioBlix-innleggene dine.'
      );
    }
  }, [refresh]);

  const onPublish = useCallback(async () => {
    if (!userId || !media) {
      Alert.alert(
        'Mangler bruker',
        'Sett EXPO_PUBLIC_DEV_USER_ID i .env (eller koble Clerk) før du publiserer.'
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Tittel mangler', 'Gi blixet en tydelig produkttittel.');
      return;
    }

    const trimmedLink = linkUrl.trim();
    if (trimmedLink && !isProYearly) {
      Alert.alert(
        'Pro kreves',
        'Klikkbare lenker krever Pro Årlig i BioBlix.'
      );
      return;
    }

    let safeLink: string | null = null;
    if (trimmedLink && isProYearly) {
      const validation = validateProLinkUrl(trimmedLink);
      if (!validation.ok) {
        setLinkError(validation.message);
        Alert.alert('Ugyldig lenke', validation.message);
        return;
      }
      safeLink = validation.url;
    }

    const finalTags = tagDraft.trim()
      ? parseTagInput(tagDraft, tags)
      : tags;

    setPublishing(true);
    try {
      const mediaUrl = await uploadPostMedia({
        userId,
        uri: media.uri,
        mediaType: media.mediaType,
        mimeType: media.mimeType,
      });

      await createPost({
        userId,
        mediaUrl,
        mediaType: media.mediaType,
        title: title.trim(),
        description: description.trim(),
        tags: finalTags,
        linkUrl: safeLink,
      });

      setTitle('');
      setDescription('');
      setLinkUrl('');
      setLinkError(null);
      setTagDraft('');
      setTags([]);
      setMedia(null);
      void listPopularTags(12).then(setPopular).catch(() => undefined);
      Alert.alert('Live i BioBlix', 'Blixet ditt er synlig i strømmen.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kunne ikke publisere.';
      Alert.alert('Feil', message);
    } finally {
      setPublishing(false);
    }
  }, [userId, media, title, description, linkUrl, isProYearly, tags, tagDraft]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <BioBlixText variant="label" color={Colors.lime}>
          {Brand.name}
        </BioBlixText>
        <BioBlixText variant="display">Nytt blix</BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.hint}>
          Vis frem appen eller produktet ditt i ett kort, skarpt øyeblikk.
        </BioBlixText>

        <Pressable style={styles.mediaButton} onPress={pickMedia}>
          {media ? (
            <BioBlixMediaPreview uri={media.uri} mediaType={media.mediaType} />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <BioBlixText variant="title" color={Colors.mist}>
                Velg bilde eller video
              </BioBlixText>
              <BioBlixText variant="caption" color={Colors.mistDim}>
                Fra kamerarullen · maks ~60 sek
              </BioBlixText>
            </View>
          )}
        </Pressable>

        {media ? (
          <Pressable onPress={pickMedia} style={styles.changeMedia}>
            <BioBlixText variant="caption" color={Colors.lime}>
              Bytt medie
            </BioBlixText>
          </Pressable>
        ) : null}

        <BioBlixText variant="label" color={Colors.mistDim}>
          Tittel
        </BioBlixText>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="F.eks. PocketBudget for iOS"
          placeholderTextColor={Colors.mistDim}
          maxLength={80}
        />

        <BioBlixText variant="label" color={Colors.mistDim}>
          Beskrivelse
        </BioBlixText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Hva løser produktet — på én setning?"
          placeholderTextColor={Colors.mistDim}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />

        <View style={styles.tagsHeader}>
          <BioBlixText variant="label" color={Colors.mistDim}>
            Tags (maks {MAX_TAGS_PER_POST})
          </BioBlixText>
          <Link href="/tags">
            <BioBlixText variant="caption" color={Colors.lime}>
              Alle tags
            </BioBlixText>
          </Link>
        </View>
        <TextInput
          style={styles.input}
          value={tagDraft}
          onChangeText={setTagDraft}
          placeholder="f.eks. app, ios, produktivitet"
          placeholderTextColor={Colors.mistDim}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={commitTagDraft}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <Pressable onPress={commitTagDraft} style={styles.addTagBtn}>
          <BioBlixText variant="caption" color={Colors.lime}>
            Legg til tag
          </BioBlixText>
        </Pressable>
        <BioBlixTagChips tags={tags} onRemoveTag={removeTag} />

        {popular.length > 0 ? (
          <>
            <BioBlixText variant="label" color={Colors.mistDim}>
              Populære
            </BioBlixText>
            <BioBlixTagChips
              tags={popular.map((t) => t.name).filter((n) => !tags.includes(n))}
              counts={popularCounts}
              onPressTag={addSuggestedTag}
              compact
            />
          </>
        ) : null}

        <BioBlixText variant="label" color={Colors.mistDim}>
          Butikklenke · Pro
        </BioBlixText>
        <TextInput
          style={[
            styles.input,
            !isProYearly && styles.inputDisabled,
            linkError ? styles.inputError : null,
          ]}
          value={linkUrl}
          onChangeText={onLinkChange}
          placeholder={
            isProYearly
              ? 'https://apps.apple.com/… (ikke bit.ly)'
              : 'Låst — krever Pro Årlig'
          }
          placeholderTextColor={Colors.mistDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          editable={isProYearly && !entitlementLoading}
        />
        {linkError ? (
          <BioBlixText
            variant="caption"
            color={Colors.danger}
            style={styles.linkError}
          >
            {linkError}
          </BioBlixText>
        ) : null}

        {!isProYearly && !entitlementLoading ? (
          <Pressable style={styles.upgradeButton} onPress={onUpgradePress}>
            <BioBlixText
              variant="caption"
              color={Colors.ink}
              style={styles.upgradeButtonText}
            >
              Oppgrader til Pro Årlig for å legge til klikkbare lenker på dine
              apper og produkter
            </BioBlixText>
          </Pressable>
        ) : null}

        {entitlementLoading ? (
          <ActivityIndicator
            style={styles.entitlementSpinner}
            color={Colors.lime}
          />
        ) : null}

        <Pressable
          style={[
            styles.publishButton,
            !canPublish && styles.publishButtonDisabled,
          ]}
          onPress={onPublish}
          disabled={!canPublish}
        >
          {publishing ? (
            <ActivityIndicator color={Colors.ink} />
          ) : (
            <BioBlixText variant="title" color={Colors.ink}>
              Publiser blix
            </BioBlixText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.ink },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 48,
    gap: 8,
  },
  hint: {
    marginBottom: 12,
    maxWidth: 420,
  },
  mediaButton: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  mediaPlaceholder: {
    aspectRatio: 9 / 16,
    maxHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  changeMedia: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addTagBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 4,
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
    marginBottom: 4,
  },
  inputDisabled: {
    backgroundColor: Colors.inkElevated,
    color: Colors.mistDim,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  linkError: {
    marginTop: 2,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 100,
  },
  upgradeButton: {
    marginTop: 8,
    backgroundColor: Colors.lime,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  upgradeButtonText: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    lineHeight: 20,
  },
  entitlementSpinner: {
    marginTop: 8,
  },
  publishButton: {
    marginTop: 20,
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.4,
  },
});
