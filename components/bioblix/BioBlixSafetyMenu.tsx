import { useAuth } from '@clerk/expo';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { useI18n } from '@/lib/i18n';
import { confirmAction, isWeb, notify } from '@/lib/platform';
import { createReport } from '@/services/reports';
import { deletePost } from '@/services/posts';
import { blockUser } from '@/services/users';

type BioBlixSafetyMenuProps = {
  postId: string;
  authorUserId: string;
  viewerUserId: string | null;
  onBlocked?: () => void;
  onDeleted?: () => void;
  onEdit?: () => void;
};

export function BioBlixSafetyMenu({
  postId,
  authorUserId,
  viewerUserId,
  onBlocked,
  onDeleted,
  onEdit,
}: BioBlixSafetyMenuProps) {
  const { getToken } = useAuth();
  const { t, locale } = useI18n();

  const openMenu = () => {
    if (!viewerUserId) {
      notify(t('social.signInRequired'), t('social.signInRequiredBody'));
      return;
    }

    if (viewerUserId === authorUserId) {
      void openOwnPostMenu();
      return;
    }

    void openOtherPostMenu(viewerUserId);
  };

  const openOwnPostMenu = async () => {
    if (isWeb && typeof window !== 'undefined') {
      const hint =
        locale === 'nb'
          ? 'Skriv «rediger» eller «slett» (eller avbryt):'
          : 'Type “edit” or “delete” (or cancel):';
      const choice = window.prompt(hint, onEdit ? (locale === 'nb' ? 'rediger' : 'edit') : (locale === 'nb' ? 'slett' : 'delete'));
      const normalized = choice?.trim().toLowerCase() ?? '';
      if (!normalized) return;
      if ((normalized.startsWith('redig') || normalized.startsWith('edit')) && onEdit) {
        onEdit();
        return;
      }
      if (normalized.startsWith('slett') || normalized.startsWith('del')) {
        const ok = await confirmAction(
          t('safety.deleteTitle'),
          t('safety.deleteBody'),
          { confirmLabel: t('safety.delete'), destructive: true }
        );
        if (ok) await handleDelete();
      }
      return;
    }

    Alert.alert(t('tabs.blix'), undefined, [
      ...(onEdit
        ? [{ text: t('safety.edit'), onPress: () => onEdit() }]
        : []),
      {
        text: t('safety.delete'),
        style: 'destructive' as const,
        onPress: () => void confirmDeleteNative(),
      },
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);
  };

  const confirmDeleteNative = async () => {
    const ok = await confirmAction(
      t('safety.deleteTitle'),
      t('safety.deleteBody'),
      { confirmLabel: t('safety.delete'), destructive: true }
    );
    if (ok) await handleDelete();
  };

  const openOtherPostMenu = async (viewerId: string) => {
    if (isWeb && typeof window !== 'undefined') {
      const hint =
        locale === 'nb'
          ? 'Skriv «rapporter» eller «blokker» (eller avbryt):'
          : 'Type “report” or “block” (or cancel):';
      const choice = window.prompt(hint, locale === 'nb' ? 'rapporter' : 'report');
      const normalized = choice?.trim().toLowerCase() ?? '';
      if (!normalized) return;
      if (normalized.startsWith('rappor') || normalized.startsWith('report')) {
        await handleReport(viewerId);
        return;
      }
      if (normalized.startsWith('blokk') || normalized.startsWith('block')) {
        const ok = await confirmAction(
          t('safety.blockTitle'),
          t('safety.blockBody'),
          { confirmLabel: t('safety.block'), destructive: true }
        );
        if (ok) await handleBlock(viewerId);
      }
      return;
    }

    Alert.alert(t('safety.reportOrBlock'), undefined, [
      {
        text: t('safety.report'),
        onPress: () => void handleReport(viewerId),
      },
      {
        text: t('safety.block'),
        style: 'destructive',
        onPress: () => void confirmBlockNative(viewerId),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleDelete = async () => {
    try {
      await syncFirebaseAuthFromClerk(() => getToken());
      await deletePost(postId);
      onDeleted?.();
      notify(t('safety.deleted'), t('safety.deletedBody'));
    } catch (error) {
      notify(
        t('common.error'),
        error instanceof Error ? error.message : t('common.error')
      );
    }
  };

  const handleReport = async (reporterId: string) => {
    try {
      await createReport({
        postId,
        reportedUserId: authorUserId,
        reporterId,
      });
      notify(t('safety.reported'), t('safety.reportedBody'));
    } catch (error) {
      notify(
        t('common.error'),
        error instanceof Error ? error.message : t('common.error')
      );
    }
  };

  const confirmBlockNative = async (viewerId: string) => {
    const ok = await confirmAction(
      t('safety.blockTitle'),
      t('safety.blockBody'),
      { confirmLabel: t('safety.block'), destructive: true }
    );
    if (ok) await handleBlock(viewerId);
  };

  const handleBlock = async (viewerId: string) => {
    try {
      await blockUser(viewerId, authorUserId);
      onBlocked?.();
      notify(t('safety.blocked'), t('safety.blockedBody'));
    } catch (error) {
      notify(
        t('common.error'),
        error instanceof Error ? error.message : t('common.error')
      );
    }
  };

  return (
    <Pressable
      accessibilityLabel={
        viewerUserId === authorUserId
          ? t('safety.editOrDelete')
          : t('safety.reportOrBlock')
      }
      accessibilityRole="button"
      hitSlop={12}
      onPress={openMenu}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.dots}>···</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7,20,16,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,232,224,0.25)',
  },
  pressed: {
    opacity: 0.75,
  },
  dots: {
    color: '#F4F7F5',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
