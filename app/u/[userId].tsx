import { useLocalSearchParams } from 'expo-router';

import { BioBlixPublicProfile } from '@/components/bioblix/BioBlixPublicProfile';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { useI18n } from '@/lib/i18n';

/** /u/{userId} — public profile by Clerk user id. */
export default function PublicProfileScreen() {
  const { userId: rawId } = useLocalSearchParams<{ userId: string }>();
  const userId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const { t } = useI18n();

  if (!userId) {
    return (
      <BioBlixScreenShell style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BioBlixText>{t('profile.invalid')}</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  return <BioBlixPublicProfile userId={userId} />;
}
