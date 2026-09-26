import { useAuth } from '@clerk/expo';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
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

  const openMenu = () => {
    if (!viewerUserId) {
      notify(
        'Logg inn kreves',
        'Du må være innlogget for å slette, rapportere eller blokkere.'
      );
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
      const choice = window.prompt(
        'Skriv «rediger» eller «slett» (eller avbryt):',
        onEdit ? 'rediger' : 'slett'
      );
      const normalized = choice?.trim().toLowerCase() ?? '';
      if (!normalized) return;
      if (normalized.startsWith('redig') && onEdit) {
        onEdit();
        return;
      }
      if (normalized.startsWith('slett')) {
        const ok = await confirmAction(
          'Slett blix?',
          'Dette blixet fjernes permanent fra feed og profil.',
          { confirmLabel: 'Slett', destructive: true }
        );
        if (ok) await handleDelete();
      }
      return;
    }

    Alert.alert('Ditt blix', 'Hva vil du gjøre?', [
      ...(onEdit
        ? [{ text: 'Rediger', onPress: () => onEdit() }]
        : []),
      {
        text: 'Slett',
        style: 'destructive' as const,
        onPress: () => void confirmDeleteNative(),
      },
      { text: 'Avbryt', style: 'cancel' as const },
    ]);
  };

  const confirmDeleteNative = async () => {
    const ok = await confirmAction(
      'Slett blix?',
      'Dette blixet fjernes permanent fra feed og profil.',
      { confirmLabel: 'Slett', destructive: true }
    );
    if (ok) await handleDelete();
  };

  const openOtherPostMenu = async (viewerId: string) => {
    if (isWeb && typeof window !== 'undefined') {
      const choice = window.prompt(
        'Skriv «rapporter» eller «blokker» (eller avbryt):',
        'rapporter'
      );
      const normalized = choice?.trim().toLowerCase() ?? '';
      if (!normalized) return;
      if (normalized.startsWith('rappor')) {
        await handleReport(viewerId);
        return;
      }
      if (normalized.startsWith('blokk')) {
        const ok = await confirmAction(
          'Blokker bruker?',
          'Innlegg fra denne brukeren skjules fra blix-strømmen din.',
          { confirmLabel: 'Blokker', destructive: true }
        );
        if (ok) await handleBlock(viewerId);
      }
      return;
    }

    Alert.alert('Sikkerhet', 'Hva vil du gjøre med dette innlegget?', [
      {
        text: 'Rapporter innlegg',
        onPress: () => void handleReport(viewerId),
      },
      {
        text: 'Blokker bruker',
        style: 'destructive',
        onPress: () => void confirmBlockNative(viewerId),
      },
      { text: 'Avbryt', style: 'cancel' },
    ]);
  };

  const handleDelete = async () => {
    try {
      await syncFirebaseAuthFromClerk(() => getToken());
      await deletePost(postId);
      onDeleted?.();
      notify('Slettet', 'Blixet er fjernet.');
    } catch (error) {
      notify(
        'Kunne ikke slette',
        error instanceof Error ? error.message : 'Prøv igjen senere.'
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
      notify(
        'Takk',
        'Rapporten er sendt. BioBlix-teamet vil se på innlegget.'
      );
    } catch (error) {
      notify(
        'Kunne ikke rapportere',
        error instanceof Error ? error.message : 'Prøv igjen senere.'
      );
    }
  };

  const confirmBlockNative = async (viewerId: string) => {
    const ok = await confirmAction(
      'Blokker bruker?',
      'Innlegg fra denne brukeren skjules fra blix-strømmen din.',
      { confirmLabel: 'Blokker', destructive: true }
    );
    if (ok) await handleBlock(viewerId);
  };

  const handleBlock = async (viewerId: string) => {
    try {
      await blockUser(viewerId, authorUserId);
      onBlocked?.();
      notify('Blokkert', 'Brukeren er skjult fra feeden din.');
    } catch (error) {
      notify(
        'Kunne ikke blokkere',
        error instanceof Error ? error.message : 'Prøv igjen senere.'
      );
    }
  };

  return (
    <Pressable
      accessibilityLabel={
        viewerUserId === authorUserId
          ? 'Rediger eller slett blix'
          : 'Flere alternativer'
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
    minWidth: 40,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(7,20,16,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(220,232,224,0.25)',
  },
  pressed: {
    opacity: 0.75,
  },
  dots: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -4,
  },
});
