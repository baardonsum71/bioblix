/**
 * BioBlix privacy policy — shared by iOS, Android and web (/privacy).
 * Update dates when the text changes.
 */
export const privacyPolicyMeta = {
  lastUpdatedEn: '26 September 2026',
  lastUpdatedNb: '26. september 2026',
  contactEmail: 'privacy@bioblix.app',
  controllerName: 'BioBlix',
} as const;

export type PrivacySection = {
  title: string;
  paragraphs: string[];
};

export const privacyPolicySectionsNb: PrivacySection[] = [
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
      'Nakenhet og seksuelt innhold er ikke tillatt på BioBlix. Vi bruker automatisk og manuell moderering; innhold som bryter dette kan avvises ved opplasting eller fjernes senere.',
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
    title: '10. Barn og aldersgrense',
    paragraphs: [
      'BioBlix er bare for personer som er 16 år eller eldre. Vi ber ikke bevisst om personopplysninger fra personer under 16. Oppdager vi slik behandling, sletter vi opplysningene.',
      'Ved registrering ber vi om fødselsdato for å håndheve aldersgrensen.',
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

export const privacyPolicySectionsEn: PrivacySection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'This privacy policy applies to the BioBlix app (iOS and Android) and BioBlix on the web. It explains which personal data we process, why we do so, and what rights you have.',
      'By using BioBlix you accept this policy. If you do not accept it, please stop using the service.',
    ],
  },
  {
    title: '2. Data controller',
    paragraphs: [
      'BioBlix is the controller for personal data collected via the app and website.',
      'Privacy questions can be sent to privacy@bioblix.app.',
    ],
  },
  {
    title: '3. What data we process',
    paragraphs: [
      'Account and authentication: When you sign in (via Clerk), we may process identifiers such as user ID, email address, display name and profile image.',
      'Content you create (UGC): Videos, images, titles, descriptions and any Pro links you publish, plus metadata such as publish time.',
      'Moderation and safety: Reports about posts, and lists of users you have blocked.',
      'Subscriptions and purchases: Pro Yearly status (e.g. isProYearly), handled via RevenueCat and platform payment systems (Apple, Google and/or Stripe on web). We normally do not receive full card numbers.',
      'Technical information: Device and browser information needed to deliver the service (e.g. platform, limited error logs).',
    ],
  },
  {
    title: '4. Purposes and legal bases',
    paragraphs: [
      'Deliver BioBlix: show the feed, store posts, sync account and subscription (contract performance).',
      'Security and abuse: report/block, prevent spam and invalid Pro links (legitimate interest / legal obligation where applicable).',
      'Payment and access control: verify Pro subscription before clickable links are enabled (contract performance).',
      'Communication: respond to privacy or support requests (legitimate interest / consent where relevant).',
    ],
  },
  {
    title: '5. Sharing with processors',
    paragraphs: [
      'We use trusted providers to run BioBlix. They process data on our behalf under contract:',
      'Clerk — sign-in and user identity.',
      'Google Firebase (Firestore and Storage) — database and file storage for posts and media.',
      'RevenueCat — subscriptions and entitlement (Pro Yearly).',
      'Apple App Store / Google Play / Stripe — payment processing where applicable.',
      'Vercel — hosting of BioBlix web.',
      'We do not sell your personal data to third parties for marketing.',
    ],
  },
  {
    title: '6. User-generated content and external links',
    paragraphs: [
      'Content you publish may be visible to other users. You are responsible for ensuring the content is lawful and that you have rights to the media and links you share.',
      'Nudity and sexual content are not allowed on BioBlix. We use automatic and manual moderation; content that breaks this may be rejected at upload or removed later.',
      'Pro links may take you out of BioBlix to external websites. BioBlix is not responsible for content or privacy practices on external sites. You get a warning before leaving the app/web.',
      'We may remove or restrict content that breaks terms, law or safety rules, including after reports.',
    ],
  },
  {
    title: '7. Retention',
    paragraphs: [
      'We store data as long as needed to deliver the service, fulfil contracts (including subscriptions) and meet legal requirements.',
      'When you delete your account or request deletion, we remove or anonymise data we no longer have a legal basis to keep, subject to backups and legally required retention.',
    ],
  },
  {
    title: '8. Transfers outside the EEA',
    paragraphs: [
      'Some processors may process data outside the EEA (e.g. the USA). Where that happens, we use appropriate mechanisms such as EU standard contractual clauses (SCCs) or equivalent where the provider offers them.',
    ],
  },
  {
    title: '9. Your rights',
    paragraphs: [
      'Under privacy law (including GDPR) you may have rights of access, rectification, erasure, restriction, data portability and to object to certain processing.',
      'You may also complain to your supervisory authority. To exercise rights, contact privacy@bioblix.app.',
    ],
  },
  {
    title: '10. Children and age limit',
    paragraphs: [
      'BioBlix is only for people aged 16 or older. We do not knowingly collect personal data from people under 16. If we discover such processing, we delete the data.',
      'At registration we ask for a birth date to enforce the age limit.',
    ],
  },
  {
    title: '11. Cookies (web)',
    paragraphs: [
      'On the web, sign-in and security may require necessary cookies or local storage (e.g. session via Clerk). We do not use marketing cookies without consent where required.',
    ],
  },
  {
    title: '12. Security',
    paragraphs: [
      'We use technical and organisational measures (access control, encrypted transport, backend rules) to protect data. No service is 100% secure; tell us if you suspect a breach.',
    ],
  },
  {
    title: '13. Changes',
    paragraphs: [
      'We may update this policy. A new version is published in the app and at /privacy on the web, with an updated date. Material changes may be announced in the service where practical.',
    ],
  },
];

/** @deprecated Prefer locale-aware helpers below. */
export const privacyPolicySections = privacyPolicySectionsNb;

export function getPrivacyPolicy(locale: 'en' | 'nb'): {
  lastUpdated: string;
  sections: PrivacySection[];
} {
  if (locale === 'en') {
    return {
      lastUpdated: privacyPolicyMeta.lastUpdatedEn,
      sections: privacyPolicySectionsEn,
    };
  }
  return {
    lastUpdated: privacyPolicyMeta.lastUpdatedNb,
    sections: privacyPolicySectionsNb,
  };
}
