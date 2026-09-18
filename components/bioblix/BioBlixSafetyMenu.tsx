import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/Colors';
import { createReport } from '@/services/reports';
import { blockUser } from '@/services/users';

type BioBlixSafetyMenuProps = {
  postId: string;
  authorUserId: string;
  viewerUserId: string | null;
  onBlocked?: () => void;
};

export function BioBlixSafetyMenu({
  postId,
  authorUserId,
  viewerUserId,
  onBlocked,
}: BioBlixSafetyMenuProps) {
  const openMenu = () => {
    if (!viewerUserId) {
      Alert.alert(
        'Logg inn kreves',
        'Du må være innlogget for å rapportere eller blokkere i BioBlix.'
      );
      return;
    }

    if (viewerUserId === authorUserId) {
      Alert.alert('Ditt innlegg', 'Du kan ikke rapportere eller blokkere deg selv.');
      return;
    }

    Alert.alert('Sikkerhet', 'Hva vil du gjøre med dette innlegget?', [
      {
        text: 'Rapporter innlegg',
        onPress: () => void handleReport(viewerUserId),
      },
      {
        text: 'Blokker bruker',
        style: 'destructive',
        onPress: () => confirmBlock(viewerUserId),
      },
      { text: 'Avbryt', style: 'cancel' },
    ]);
  };

  const handleReport = async (reporterId: string) => {
    try {
      await createReport({
        postId,
        reportedUserId: authorUserId,
        reporterId,
      });
      Alert.alert(
        'Takk',
        'Rapporten er sendt. BioBlix-teamet vil se på innlegget.'
      );
    } catch (error) {
      Alert.alert(
        'Kunne ikke rapportere',
        error instanceof Error ? error.message : 'Prøv igjen senere.'
      );
    }
  };

  const confirmBlock = (viewerId: string) => {
    Alert.alert(
      'Blokker bruker?',
      'Innlegg fra denne brukeren skjules fra blix-strømmen din.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Blokker',
          style: 'destructive',
          onPress: () => void handleBlock(viewerId),
        },
      ]
    );
  };

  const handleBlock = async (viewerId: string) => {
    try {
      await blockUser(viewerId, authorUserId);
      onBlocked?.();
      Alert.alert('Blokkert', 'Brukeren er skjult fra feeden din.');
    } catch (error) {
      Alert.alert(
        'Kunne ikke blokkere',
        error instanceof Error ? error.message : 'Prøv igjen senere.'
      );
    }
  };

  return (
    <Pressable
      accessibilityLabel="Flere alternativer"
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
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -4,
  },
});
