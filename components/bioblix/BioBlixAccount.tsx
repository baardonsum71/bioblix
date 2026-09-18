import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Brand, Colors } from '@/constants/Colors';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export default function BioBlixAccount() {
  return (
    <View style={styles.container}>
      <BioBlixText variant="label" color={Colors.lime}>
        {Brand.name}
      </BioBlixText>
      <BioBlixText variant="display">Din konto</BioBlixText>
      <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
        Administrer profilen din og abonnement. Standard lar deg publisere blix.
        Pro Årlig låser opp klikkbare produktlenker.
      </BioBlixText>

      <View style={styles.planCard}>
        <BioBlixText variant="title">{SUBSCRIPTION_PLANS.standard.label}</BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          Månedlig · publiser video/bilde uten utgående lenke
        </BioBlixText>
      </View>

      <View style={[styles.planCard, styles.planPro]}>
        <BioBlixText variant="title" color={Colors.ink}>
          {SUBSCRIPTION_PLANS.pro.label} Årlig
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.inkElevated}>
          Entitlement {SUBSCRIPTION_PLANS.pro.entitlementId} · klikkbare
          butikklenker på hvert blix
        </BioBlixText>
      </View>

      <Link href="/modal" style={styles.aboutLink}>
        <BioBlixText variant="label" color={Colors.lime}>
          Om {Brand.name}
        </BioBlixText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
    padding: 24,
    paddingTop: 56,
    gap: 12,
  },
  lead: {
    marginBottom: 8,
    maxWidth: 420,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  planPro: {
    backgroundColor: Colors.lime,
    borderColor: Colors.limePressed,
  },
  aboutLink: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
});
