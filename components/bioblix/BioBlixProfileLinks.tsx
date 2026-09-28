import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { confirmAndOpenBioBlixLink } from '@/components/bioblix/bioBlixLinks';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii, BioBlixSpacing } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import { notify } from '@/lib/platform';
import {
  MAX_PROFILE_LINKS,
  newProfileLinkId,
  validateProfileLinkInput,
} from '@/lib/validation/profileLink';
import { updateUser } from '@/services/users';
import type { ProfileLink } from '@/types';

type BioBlixProfileLinksProps = {
  links: ProfileLink[];
  /** When set, owner can add/remove links (saved to Firestore). */
  editableUserId?: string | null;
  onSaved?: (links: ProfileLink[]) => void;
};

export function BioBlixProfileLinks({
  links,
  editableUserId,
  onSaved,
}: BioBlixProfileLinksProps) {
  const { t, locale } = useI18n();
  const editable = Boolean(editableUserId);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const persist = useCallback(
    async (next: ProfileLink[]) => {
      if (!editableUserId) return;
      setBusy(true);
      try {
        await updateUser(editableUserId, { profileLinks: next });
        onSaved?.(next);
      } catch (err) {
        notify(
          t('common.error'),
          err instanceof Error ? err.message : t('profile.linksSaveFail')
        );
      } finally {
        setBusy(false);
      }
    },
    [editableUserId, onSaved, t]
  );

  const onAdd = useCallback(async () => {
    if (!editableUserId) return;
    if (links.length >= MAX_PROFILE_LINKS) {
      setFormError(t('profile.linksMax', { max: MAX_PROFILE_LINKS }));
      return;
    }
    const result = validateProfileLinkInput(title, url);
    if (!result.ok) {
      setFormError(
        result.message === 'Enter a short label for the link.'
          ? t('profile.linksTitleRequired')
          : result.message
      );
      return;
    }
    setFormError(null);
    const next = [
      ...links,
      { id: newProfileLinkId(), title: result.link.title, url: result.link.url },
    ];
    await persist(next);
    setTitle('');
    setUrl('');
  }, [editableUserId, links, title, url, persist, t]);

  const onRemove = useCallback(
    async (id: string) => {
      await persist(links.filter((link) => link.id !== id));
    },
    [links, persist]
  );

  if (!editable && links.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <BioBlixText variant="label" color={Colors.mistDim}>
          {t('profile.linksTitle')}
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {t('profile.linksCount', {
            count: links.length,
            max: MAX_PROFILE_LINKS,
          })}
        </BioBlixText>
      </View>

      {links.length === 0 && editable ? (
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {t('profile.linksEmpty')}
        </BioBlixText>
      ) : null}

      {links.map((link) => (
        <View key={link.id} style={styles.linkRow}>
          <Pressable
            style={styles.linkMain}
            onPress={() => confirmAndOpenBioBlixLink(link.url, { locale })}
            accessibilityRole="link"
            accessibilityLabel={link.title}
          >
            <BioBlixText variant="label" color={Colors.lime} numberOfLines={1}>
              {link.title}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim} numberOfLines={1}>
              {link.url.replace(/^https:\/\//i, '')}
            </BioBlixText>
          </Pressable>
          {editable ? (
            <Pressable
              onPress={() => void onRemove(link.id)}
              disabled={busy}
              style={styles.removeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('profile.linksRemove')}
            >
              <BioBlixText variant="caption" color={BioBlixPalette.magenta}>
                {t('profile.linksRemove')}
              </BioBlixText>
            </Pressable>
          ) : null}
        </View>
      ))}

      {editable && links.length < MAX_PROFILE_LINKS ? (
        <View style={styles.form}>
          <TextInput
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              setFormError(null);
            }}
            placeholder={t('profile.linksLabelPlaceholder')}
            placeholderTextColor={Colors.mistDim}
            style={styles.input}
            maxLength={40}
            editable={!busy}
          />
          <TextInput
            value={url}
            onChangeText={(value) => {
              setUrl(value);
              setFormError(null);
            }}
            placeholder={t('profile.linksUrlPlaceholder')}
            placeholderTextColor={Colors.mistDim}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!busy}
          />
          {formError ? (
            <BioBlixText variant="caption" color={BioBlixPalette.danger}>
              {formError}
            </BioBlixText>
          ) : null}
          <Pressable
            style={[styles.addBtn, busy && styles.addBtnDisabled]}
            onPress={() => void onAdd()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.ink} />
            ) : (
              <BioBlixText variant="label" color={Colors.ink}>
                {t('profile.linksAdd')}
              </BioBlixText>
            )}
          </Pressable>
        </View>
      ) : null}

      {editable && links.length >= MAX_PROFILE_LINKS ? (
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {t('profile.linksMax', { max: MAX_PROFILE_LINKS })}
        </BioBlixText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: BioBlixSpacing.sm,
    marginBottom: BioBlixSpacing.md,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  linkMain: {
    flex: 1,
    gap: 2,
  },
  removeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  form: {
    gap: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.mist,
    backgroundColor: Colors.surface,
    fontSize: 15,
  },
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BioBlixRadii.md,
    backgroundColor: Colors.lime,
    paddingHorizontal: 14,
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
});
