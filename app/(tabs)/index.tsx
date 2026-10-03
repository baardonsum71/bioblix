import { useAuth } from '@clerk/expo';
import { useState } from 'react';

import BioBlixFeed from '@/components/bioblix/BioBlixFeed';
import { BioBlixLandingHero } from '@/components/bioblix/BioBlixLandingHero';

export default function BioBlixFeedTab() {
  const { isLoaded, isSignedIn } = useAuth();
  const [browseAsGuest, setBrowseAsGuest] = useState(false);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn && !browseAsGuest) {
    return (
      <BioBlixLandingHero onBrowseFeed={() => setBrowseAsGuest(true)} />
    );
  }

  return <BioBlixFeed />;
}
