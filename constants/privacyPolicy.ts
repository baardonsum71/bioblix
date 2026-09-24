/**
 * BioBlix privacy policy — shared by iOS, Android and web (/privacy).
 * Update `lastUpdated` when the text changes.
 */
export const privacyPolicyMeta = {
  lastUpdated: '18. september 2026',
  contactEmail: 'privacy@bioblix.app',
  controllerName: 'BioBlix',
} as const;

export type PrivacySection = {
  title: string;
  paragraphs: string[];
};

export const privacyPolicySections: PrivacySection[] = [
  {
    title: '1. Innledning',
    paragraphs: [
      'Denne personvernerklæringen gjelder for BioBlix-appen (iOS og Android) og BioBlix på web. Den forklarer hvilke personopplysninger vi behandler, hvorfor vi gjør det, og hvilke rettigheter du har.',
      'Ved å bruke BioBlix godtar du denne erklæringen. Hvis du ikke godtar den, ber vi deg slutte å bruke tjenesten.',
    ],
  },
  {
    title: '2. Behandlingsansvarlig',
    paragraphs: [
      'BioBlix er behandlingsansvarlig for personopplysninger som samles inn via appen og nettsiden.',
      'Spørsmål om personvern kan sendes til privacy@bioblix.app.',
    ],
  },
  {
    title: '3. Hvilke opplysninger vi behandler',
    paragraphs: [
      'Konto og autentisering: Når du logger inn (via Clerk), kan vi behandle identifikatorer som bruker-ID, e-postadresse, visningsnavn og profilbilde.',
      'Innhold du lager (UGC): Videoer, bilder, titler, beskrivelser og eventuelle Pro-lenker du publiserer, samt metadata som tidspunkt for publisering.',
      'Moderering og sikkerhet: Rapporter om innlegg, og lister over brukere du har blokkert.',
      'Abonnement og kjøp: Status for Pro Årlig (f.eks. isProYearly), håndtert via RevenueCat og plattformenes betalingssystemer (Apple, Google og/eller Stripe på web). Vi mottar normalt ikke fullt kortnummer.',
      'Teknisk informasjon: Enhets- og nettleserinformasjon som er nødvendig for å levere tjenesten (f.eks. plattform, feillogger i begrenset omfang).',
    ],
  },
  {
    title: '4. Formål og rettslig grunnlag',
    paragraphs: [
      'Levere BioBlix: vise feed, lagre innlegg, synce konto og abonnement (avtaleoppfyllelse).',
      'Sikkerhet og misbruk: rapportere/blokkere, hindre spam og ugyldige Pro-lenker (berettiget interesse / rettslig forpliktelse der det gjelder).',
      'Betaling og tilgangskontroll: verifisere Pro-abonnement før klikkbare lenker aktiveres (avtaleoppfyllelse).',
      'Kommunikasjon: svare på henvendelser om personvern eller support (berettiget interesse / samtykke der relevant).',
    ],
  },
  {
    title: '5. Deling med underleverandører',
    paragraphs: [
      'Vi bruker pålitelige leverandører for å drifte BioBlix. De behandler data på våre vegne etter avtale:',
      'Clerk — innlogging og brukeridentitet.',
      'Google Firebase (Firestore og Storage) — database og fillagring for innlegg og media.',
      'RevenueCat — abonnement og entitlement (Pro Årlig).',
      'Apple App Store / Google Play / Stripe — betalingsbehandling der det er aktuelt.',
      'Vercel — hosting av BioBlix web.',
      'Vi selger ikke personopplysningene dine til tredjeparter for markedsføring.',
    ],
  },
  {
    title: '6. Brukergenerert innhold og eksterne lenker',
    paragraphs: [
      'Innhold du publiserer kan være synlig for andre brukere. Du er ansvarlig for at innholdet er lovlig og at du har rettigheter til media og lenker du deler.',
      'Pro-lenker kan føre deg ut av BioBlix til eksterne nettsteder. BioBlix er ikke ansvarlig for innhold eller personvernpraksis på eksterne sider. Du får en advarsel før du forlater appen/web.',
      'Vi kan fjerne eller begrense innhold som bryter vilkår, lov eller sikkerhetsregler, inkludert etter rapportering.',
    ],
  },
  {
    title: '7. Lagringstid',
    paragraphs: [
      'Vi lagrer opplysninger så lenge det er nødvendig for å levere tjenesten, oppfylle avtaler (inkl. abonnement) og følge lovkrav.',
      'Når du sletter konto eller ber om sletting, fjerner eller anonymiserer vi data vi ikke lenger har rettslig grunn til å beholde, med forbehold om sikkerhetskopier og lovpålagt lagring.',
    ],
  },
  {
    title: '8. Overføring utenfor EØS',
    paragraphs: [
      'Noen underleverandører kan behandle data utenfor EØS (f.eks. USA). Der det skjer, bruker vi egnede mekanismer som EU-standardkontrakter (SCC) eller tilsvarende der leverandøren tilbyr det.',
    ],
  },
  {
    title: '9. Dine rettigheter',
    paragraphs: [
      'Etter personvernregelverket (inkl. GDPR) kan du ha rett til innsyn, retting, sletting, begrensning, dataportabilitet og å protestere mot viss behandling.',
      'Du kan også klage til Datatilsynet. For å utøve rettigheter, kontakt privacy@bioblix.app.',
    ],
  },
  {
    title: '10. Barn',
    paragraphs: [
      'BioBlix er ikke rettet mot barn under 13 år (eller høyere aldersgrense der lokal lov krever det). Vi ber ikke bevisst om personopplysninger fra barn under denne alderen. Oppdager vi slik behandling, sletter vi opplysningene.',
    ],
  },
  {
    title: '11. Informasjonskapsler (web)',
    paragraphs: [
      'På web kan innlogging og sikkerhet kreve nødvendige informasjonskapsler eller lokal lagring (f.eks. sesjon via Clerk). Vi bruker ikke markedsføringscookies uten samtykke der det kreves.',
    ],
  },
  {
    title: '12. Sikkerhet',
    paragraphs: [
      'Vi bruker tekniske og organisatoriske tiltak (tilgangskontroll, kryptert transport, regler i backend) for å beskytte data. Ingen tjeneste er 100 % sikker; si ifra ved mistanke om brudd.',
    ],
  },
  {
    title: '13. Endringer',
    paragraphs: [
      'Vi kan oppdatere denne erklæringen. Ny versjon publiseres i appen og på /privacy på web, med oppdatert dato. Vesentlige endringer kan varsles i tjenesten der det er praktisk.',
    ],
  },
];
