export type MessageKey =
  | 'common.back'
  | 'common.cancel'
  | 'common.error'
  | 'common.loading'
  | 'common.notAllowed'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.email'
  | 'auth.password'
  | 'auth.nickname'
  | 'auth.firstName'
  | 'auth.lastName'
  | 'auth.birthDate'
  | 'auth.birthDateHint'
  | 'auth.country'
  | 'auth.countrySearch'
  | 'auth.countryRequired'
  | 'auth.createAccount'
  | 'auth.continue'
  | 'auth.completeContinue'
  | 'auth.startOver'
  | 'auth.codeFromEmail'
  | 'auth.verify'
  | 'auth.legalAccept'
  | 'auth.appleContinueHint'
  | 'account.title'
  | 'account.share'
  | 'account.followers'
  | 'account.following'
  | 'account.myBlix'
  | 'account.becomePro'
  | 'account.becomeProSub'
  | 'account.proActive'
  | 'account.proActiveSub'
  | 'account.country'
  | 'account.changeCountry'
  | 'account.privacy'
  | 'account.signOut'
  | 'account.avatarUpdated'
  | 'account.avatarPermission'
  | 'account.avatarUploadFail'
  | 'account.shared'
  | 'account.shareFail'
  | 'account.proAlready'
  | 'account.proActivated'
  | 'account.proActivatedBody'
  | 'account.payment'
  | 'account.paymentFail'
  | 'account.deleted'
  | 'account.deletedBody'
  | 'account.deleteFail'
  | 'account.plansPro'
  | 'upload.title'
  | 'upload.hint'
  | 'upload.pickMedia'
  | 'upload.publish'
  | 'upload.publishing'
  | 'upload.checkingContent'
  | 'upload.connectingFirebase'
  | 'upload.uploadingMedia'
  | 'upload.saving'
  | 'upload.live'
  | 'upload.liveBody'
  | 'upload.permission'
  | 'upload.permissionBody'
  | 'upload.missingUser'
  | 'upload.missingUserBody'
  | 'upload.missingTitle'
  | 'upload.missingTitleBody'
  | 'upload.proRequired'
  | 'upload.proRequiredBody'
  | 'upload.invalidLink'
  | 'upload.publishFail'
  | 'upload.nsfwTitle'
  | 'paywall.selectPlan'
  | 'paywall.monthly'
  | 'paywall.yearly'
  | 'paywall.cancel'
  | 'paywall.noPackages'
  | 'paywall.noPackage'
  | 'paywall.needsBrowser'
  | 'paywall.notConfigured'
  | 'tabs.blix'
  | 'tabs.publish'
  | 'tabs.account'
  | 'account.edit'
  | 'account.delete'
  | 'account.editDelete'
  | 'account.emptyPosts'
  | 'account.upgradePro'
  | 'account.refresh'
  | 'edit.title'
  | 'edit.save'
  | 'edit.saved'
  | 'edit.savedBody'
  | 'edit.saveFail'
  | 'edit.changeMedia'
  | 'edit.titleField'
  | 'edit.description'
  | 'edit.tags'
  | 'edit.addTag'
  | 'edit.link'
  | 'edit.proOnly'
  | 'social.comments'
  | 'social.noComments'
  | 'social.commentPlaceholder'
  | 'social.send'
  | 'social.signInRequired'
  | 'social.signInRequiredBody'
  | 'social.edit'
  | 'profile.noBlix'
  | 'profile.followersFollowing'
  | 'profile.follow'
  | 'profile.following'
  | 'profile.share'
  | 'profile.invalid'
  | 'profile.notFound'
  | 'profile.blixSection'
  | 'feed.empty'
  | 'feed.loadError'
  | 'feed.retry'
  | 'safety.editOrDelete'
  | 'safety.reportOrBlock'
  | 'safety.deleteTitle'
  | 'safety.deleteBody'
  | 'safety.delete'
  | 'safety.edit'
  | 'safety.report'
  | 'safety.block'
  | 'safety.blockTitle'
  | 'safety.blockBody'
  | 'safety.deleted'
  | 'safety.deletedBody'
  | 'safety.blocked'
  | 'safety.blockedBody'
  | 'safety.reported'
  | 'safety.reportedBody';

export type Dictionary = Record<MessageKey, string>;

export const en: Dictionary = {
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.error': 'Error',
  'common.loading': 'Loading…',
  'common.notAllowed': 'Not allowed',
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Create account',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.nickname': 'Nickname',
  'auth.firstName': 'First name',
  'auth.lastName': 'Last name',
  'auth.birthDate': 'Date of birth (must be {age}+)',
  'auth.birthDateHint': 'YYYY-MM-DD',
  'auth.country': 'Country',
  'auth.countrySearch': 'Search country…',
  'auth.countryRequired': 'Select the country you are from.',
  'auth.createAccount': 'Create account',
  'auth.continue': 'Continue',
  'auth.completeContinue': 'Complete and continue',
  'auth.startOver': 'Start over',
  'auth.codeFromEmail': 'Code from email',
  'auth.verify': 'Verify',
  'auth.legalAccept': 'I accept the privacy policy',
  'auth.appleContinueHint': 'Finish your Apple sign-in',
  'account.title': 'Account',
  'account.share': 'Share profile',
  'account.followers': 'Followers',
  'account.following': 'Following',
  'account.myBlix': 'My blix',
  'account.becomePro': 'Go Pro — pay here',
  'account.becomeProSub': '{prices} · clickable links',
  'account.proActive': 'Pro active',
  'account.proActiveSub': 'Clickable store links enabled',
  'account.country': 'Country',
  'account.changeCountry': 'Change country',
  'account.privacy': 'Privacy',
  'account.signOut': 'Sign out',
  'account.avatarUpdated': 'Photo updated.',
  'account.avatarPermission': 'Allow photo access for your profile picture.',
  'account.avatarUploadFail': 'Could not upload photo',
  'account.shared': 'Profile link shared or copied.',
  'account.shareFail': 'Could not share',
  'account.proAlready': 'You already have Pro with clickable links.',
  'account.proActivated': 'Pro Yearly active',
  'account.proActivatedBody':
    'You can now add clickable store links on your BioBlix posts.',
  'account.payment': 'Payment',
  'account.paymentFail': 'Could not open payment',
  'account.deleted': 'Deleted',
  'account.deletedBody': 'Blix removed.',
  'account.deleteFail': 'Could not delete',
  'account.plansPro': '{label} · {prices}',
  'upload.title': 'New blix',
  'upload.hint': 'Show your app or product in one short, sharp moment.',
  'upload.pickMedia': 'Choose photo or video',
  'upload.publish': 'Publish',
  'upload.publishing': 'Publishing…',
  'upload.checkingContent': 'Checking content…',
  'upload.connectingFirebase': 'Connecting to Firebase…',
  'upload.uploadingMedia': 'Uploading media…',
  'upload.saving': 'Saving blix…',
  'upload.live': 'Live on BioBlix',
  'upload.liveBody': 'Your blix is visible in the feed.',
  'upload.permission': 'Access in BioBlix',
  'upload.permissionBody':
    'Allow photo library access to add a product blix.',
  'upload.missingUser': 'Missing user',
  'upload.missingUserBody':
    'Set EXPO_PUBLIC_DEV_USER_ID in .env (or connect Clerk) before publishing.',
  'upload.missingTitle': 'Title missing',
  'upload.missingTitleBody': 'Give your blix a clear product title.',
  'upload.proRequired': 'Pro required',
  'upload.proRequiredBody':
    'Clickable links require Pro Yearly on BioBlix.',
  'upload.invalidLink': 'Invalid link',
  'upload.publishFail': 'Could not publish.',
  'upload.nsfwTitle': 'Not allowed',
  'paywall.selectPlan': 'Choose a Pro plan:',
  'paywall.monthly': '1 = Monthly ({price})',
  'paywall.yearly': '2 = Yearly ({price})',
  'paywall.cancel': 'Cancel = close',
  'paywall.noPackages':
    'No Pro packages found. Check Offerings in RevenueCat (Current offering + products).',
  'paywall.noPackage': 'No package available to purchase.',
  'paywall.needsBrowser': 'Payment requires a browser.',
  'paywall.notConfigured':
    'RevenueCat Web is not configured. Check EXPO_PUBLIC_REVENUECAT_WEB_API_KEY.',
  'tabs.blix': 'Blix',
  'tabs.publish': 'Publish',
  'tabs.account': 'Account',
  'account.edit': 'Edit',
  'account.delete': 'Delete',
  'account.editDelete': 'Edit · Delete',
  'account.emptyPosts': 'No blix yet. Publish from the Publish tab.',
  'account.upgradePro': 'Upgrade to Pro',
  'account.refresh': 'Refresh',
  'edit.title': 'Edit blix',
  'edit.save': 'Save',
  'edit.saved': 'Saved',
  'edit.savedBody': 'Your blix was updated.',
  'edit.saveFail': 'Could not save',
  'edit.changeMedia': 'Change photo or video',
  'edit.titleField': 'Title',
  'edit.description': 'Description',
  'edit.tags': 'Tags',
  'edit.addTag': 'Add tag',
  'edit.link': 'Link',
  'edit.proOnly': '(Pro)',
  'social.comments': 'Comments',
  'social.noComments': 'No comments yet.',
  'social.commentPlaceholder': 'Write a comment…',
  'social.send': 'Send',
  'social.signInRequired': 'Sign in',
  'social.signInRequiredBody': 'Sign in to like or comment.',
  'social.edit': 'Edit',
  'profile.noBlix': 'No blix yet.',
  'profile.followersFollowing': '{followers} followers · {following} following',
  'profile.follow': 'Follow',
  'profile.following': 'Following',
  'profile.share': 'Share profile',
  'profile.invalid': 'Invalid profile',
  'profile.notFound': 'User not found',
  'profile.blixSection': 'Blix ({count})',
  'feed.empty': 'No blix in the feed yet.',
  'feed.loadError': 'Could not load BioBlix',
  'feed.retry': 'Try again',
  'safety.editOrDelete': 'Edit or delete blix',
  'safety.reportOrBlock': 'More options',
  'safety.deleteTitle': 'Delete blix?',
  'safety.deleteBody': 'This blix will be permanently removed from the feed and profile.',
  'safety.delete': 'Delete',
  'safety.edit': 'Edit',
  'safety.report': 'Report post',
  'safety.block': 'Block user',
  'safety.blockTitle': 'Block user?',
  'safety.blockBody': 'Posts from this user will be hidden from your feed.',
  'safety.deleted': 'Deleted',
  'safety.deletedBody': 'Blix removed.',
  'safety.blocked': 'Blocked',
  'safety.blockedBody': 'This user is hidden from your feed.',
  'safety.reported': 'Thanks',
  'safety.reportedBody': 'Report sent. The BioBlix team will review it.',
};

export const nb: Dictionary = {
  'common.back': 'Tilbake',
  'common.cancel': 'Avbryt',
  'common.error': 'Feil',
  'common.loading': 'Laster…',
  'common.notAllowed': 'Ikke tillatt',
  'auth.signIn': 'Logg inn',
  'auth.signUp': 'Opprett konto',
  'auth.email': 'E-post',
  'auth.password': 'Passord',
  'auth.nickname': 'Kallenavn',
  'auth.firstName': 'Fornavn',
  'auth.lastName': 'Etternavn',
  'auth.birthDate': 'Fødselsdato (må være {age}+)',
  'auth.birthDateHint': 'ÅÅÅÅ-MM-DD',
  'auth.country': 'Land',
  'auth.countrySearch': 'Søk land…',
  'auth.countryRequired': 'Velg landet du kommer fra.',
  'auth.createAccount': 'Opprett konto',
  'auth.continue': 'Fortsett',
  'auth.completeContinue': 'Fullfør og fortsett',
  'auth.startOver': 'Start på nytt',
  'auth.codeFromEmail': 'Kode fra e-post',
  'auth.verify': 'Bekreft',
  'auth.legalAccept': 'Jeg godtar personvernerklæringen',
  'auth.appleContinueHint': 'Fullfør Apple-innlogging',
  'account.title': 'Konto',
  'account.share': 'Del profil',
  'account.followers': 'Følgere',
  'account.following': 'Følger',
  'account.myBlix': 'Mine blix',
  'account.becomePro': 'Bli Pro — betal her',
  'account.becomeProSub': '{prices} · klikkbare lenker',
  'account.proActive': 'Pro aktiv',
  'account.proActiveSub': 'Klikkbare butikklenker er på',
  'account.country': 'Land',
  'account.changeCountry': 'Bytt land',
  'account.privacy': 'Personvern',
  'account.signOut': 'Logg ut',
  'account.avatarUpdated': 'Bildet er oppdatert.',
  'account.avatarPermission': 'Gi tilgang til bilder for profilbilde.',
  'account.avatarUploadFail': 'Kunne ikke laste opp bilde',
  'account.shared': 'Profillenken er delt eller kopiert.',
  'account.shareFail': 'Kunne ikke dele',
  'account.proAlready': 'Du har allerede Pro med klikkbare lenker.',
  'account.proActivated': 'Pro Årlig aktiv',
  'account.proActivatedBody':
    'Du kan nå legge klikkbare butikklenker på BioBlix-innleggene dine.',
  'account.payment': 'Betaling',
  'account.paymentFail': 'Kunne ikke åpne betaling',
  'account.deleted': 'Slettet',
  'account.deletedBody': 'Blixet er fjernet.',
  'account.deleteFail': 'Kunne ikke slette',
  'account.plansPro': '{label} · {prices}',
  'upload.title': 'Nytt blix',
  'upload.hint':
    'Vis frem appen eller produktet ditt i ett kort, skarpt øyeblikk.',
  'upload.pickMedia': 'Velg bilde eller video',
  'upload.publish': 'Publiser',
  'upload.publishing': 'Publiserer…',
  'upload.checkingContent': 'Sjekker innhold…',
  'upload.connectingFirebase': 'Kobler til Firebase…',
  'upload.uploadingMedia': 'Laster opp media…',
  'upload.saving': 'Lagrer blix…',
  'upload.live': 'Live i BioBlix',
  'upload.liveBody': 'Blixet ditt er synlig i strømmen.',
  'upload.permission': 'Tilgang i BioBlix',
  'upload.permissionBody':
    'Gi tilgang til bildebiblioteket for å legge til et produkt-blix.',
  'upload.missingUser': 'Mangler bruker',
  'upload.missingUserBody':
    'Sett EXPO_PUBLIC_DEV_USER_ID i .env (eller koble Clerk) før du publiserer.',
  'upload.missingTitle': 'Tittel mangler',
  'upload.missingTitleBody': 'Gi blixet en tydelig produkttittel.',
  'upload.proRequired': 'Pro kreves',
  'upload.proRequiredBody':
    'Klikkbare lenker krever Pro Årlig i BioBlix.',
  'upload.invalidLink': 'Ugyldig lenke',
  'upload.publishFail': 'Kunne ikke publisere.',
  'upload.nsfwTitle': 'Ikke tillatt',
  'paywall.selectPlan': 'Velg Pro-plan:',
  'paywall.monthly': '1 = Månedlig ({price})',
  'paywall.yearly': '2 = Årlig ({price})',
  'paywall.cancel': 'Avbryt = lukk',
  'paywall.noPackages':
    'Ingen Pro-pakker funnet. Sjekk Offerings i RevenueCat (Current offering + produkter).',
  'paywall.noPackage': 'Fant ingen pakke å kjøpe.',
  'paywall.needsBrowser': 'Betaling krever nettleser.',
  'paywall.notConfigured':
    'RevenueCat Web er ikke konfigurert. Sjekk EXPO_PUBLIC_REVENUECAT_WEB_API_KEY.',
  'tabs.blix': 'Blix',
  'tabs.publish': 'Publiser',
  'tabs.account': 'Konto',
  'account.edit': 'Rediger',
  'account.delete': 'Slett',
  'account.editDelete': 'Rediger · Slett',
  'account.emptyPosts': 'Ingen blix ennå. Publiser fra Publiser-fanen.',
  'account.upgradePro': 'Oppgrader til Pro',
  'account.refresh': 'Oppdater',
  'edit.title': 'Rediger blix',
  'edit.save': 'Lagre',
  'edit.saved': 'Lagret',
  'edit.savedBody': 'Blixet er oppdatert.',
  'edit.saveFail': 'Kunne ikke lagre',
  'edit.changeMedia': 'Bytt bilde eller video',
  'edit.titleField': 'Tittel',
  'edit.description': 'Beskrivelse',
  'edit.tags': 'Tags',
  'edit.addTag': 'Legg til tag',
  'edit.link': 'Lenke',
  'edit.proOnly': '(Pro)',
  'social.comments': 'Kommentarer',
  'social.noComments': 'Ingen kommentarer ennå.',
  'social.commentPlaceholder': 'Skriv en kommentar…',
  'social.send': 'Send',
  'social.signInRequired': 'Logg inn',
  'social.signInRequiredBody': 'Logg inn for å like eller kommentere.',
  'social.edit': 'Rediger',
  'profile.noBlix': 'Ingen blix ennå.',
  'profile.followersFollowing': '{followers} følgere · {following} følger',
  'profile.follow': 'Følg',
  'profile.following': 'Følger',
  'profile.share': 'Del profil',
  'profile.invalid': 'Ugyldig profil',
  'profile.notFound': 'Fant ikke brukeren',
  'profile.blixSection': 'Blix ({count})',
  'feed.empty': 'Ingen blix i strømmen ennå.',
  'feed.loadError': 'Kunne ikke laste BioBlix',
  'feed.retry': 'Prøv igjen',
  'safety.editOrDelete': 'Rediger eller slett blix',
  'safety.reportOrBlock': 'Flere alternativer',
  'safety.deleteTitle': 'Slett blix?',
  'safety.deleteBody': 'Dette blixet fjernes permanent fra feed og profil.',
  'safety.delete': 'Slett',
  'safety.edit': 'Rediger',
  'safety.report': 'Rapporter innlegg',
  'safety.block': 'Blokker bruker',
  'safety.blockTitle': 'Blokker bruker?',
  'safety.blockBody': 'Innlegg fra denne brukeren skjules fra blix-strømmen din.',
  'safety.deleted': 'Slettet',
  'safety.deletedBody': 'Blixet er fjernet.',
  'safety.blocked': 'Blokkert',
  'safety.blockedBody': 'Brukeren er skjult fra feeden din.',
  'safety.reported': 'Takk',
  'safety.reportedBody': 'Rapporten er sendt. BioBlix-teamet vil se på innlegget.',
};
