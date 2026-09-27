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
  | 'safety.reportedBody'
  | 'upload.changeMedia'
  | 'upload.titleField'
  | 'upload.titlePlaceholder'
  | 'upload.description'
  | 'upload.descriptionPlaceholder'
  | 'upload.tags'
  | 'upload.allTags'
  | 'upload.tagsPlaceholder'
  | 'upload.addTag'
  | 'upload.popular'
  | 'upload.linkLocked'
  | 'upload.upgradeHint'
  | 'upload.firebaseAuth'
  | 'upload.firebaseAuthFail'
  | 'account.createProfileHint'
  | 'account.planStandard'
  | 'account.planProFeature'
  | 'account.privacyPolicy'
  | 'account.about'
  | 'link.leaveTitle'
  | 'link.leaveBody'
  | 'link.continue'
  | 'link.openApp'
  | 'link.buyHere'
  | 'link.seeProduct'
  | 'nav.privacy'
  | 'nav.about'
  | 'nav.tags'
  | 'nav.tag'
  | 'nav.profile'
  | 'nav.back'
  | 'tags.empty'
  | 'notFound.title'
  | 'notFound.body'
  | 'feed.swipeHint'
  | 'feed.swipeHintShort'
  | 'tags.invalid'
  | 'tags.noPosts'
  | 'tags.postCount'
  | 'live.badge'
  | 'live.goLive'
  | 'live.endLive'
  | 'live.title'
  | 'live.titlePlaceholder'
  | 'live.starting'
  | 'live.connecting'
  | 'live.webOnly'
  | 'live.webOnlyBody'
  | 'live.notConfigured'
  | 'live.startFail'
  | 'live.watchFail'
  | 'live.ended'
  | 'live.hosting'
  | 'live.watching'
  | 'live.nsfwEnded'
  | 'live.nsfwEndedBody'
  | 'live.cameraDenied'
  | 'live.openInSafari'
  | 'privacy.title'
  | 'privacy.updated'
  | 'privacy.intro'
  | 'account.public'
  | 'moderation.nsfw'
  | 'moderation.checkFail'
  | 'auth.acceptLegal'
  | 'auth.appleRetry'
  | 'auth.appleUpdateFail'
  | 'auth.sessionFail'
  | 'auth.appleFail'
  | 'auth.fillName'
  | 'auth.appleSessionMissing'
  | 'auth.appleSessionInvalid'
  | 'auth.nicknameShort'
  | 'auth.fillNames'
  | 'auth.fillEmailPassword'
  | 'auth.passwordShort'
  | 'auth.createFail'
  | 'auth.loginStopped'
  | 'auth.verifyIncomplete'
  | 'auth.enterCode'
  | 'auth.appleCompleteTitle'
  | 'auth.appleNameMissing'
  | 'auth.appleOneStep'
  | 'auth.pickNickname'
  | 'auth.clerkField'
  | 'auth.birthInvalid'
  | 'auth.ageTooYoung'
  | 'auth.birthRange'
  | 'auth.invalidCode'
  | 'share.checkOut'
  | 'paywall.openFail'
  | 'privacy.rights'
  | 'auth.showPassword'
  | 'auth.hidePassword'
  | 'auth.show'
  | 'auth.hide'
  | 'auth.termsAnd'
  | 'auth.clerkPasswordRequired'
  | 'auth.usernameRejected'
  | 'auth.clerkKeyMissing'
  | 'auth.notReady'
  | 'auth.acceptPrefix'
  | 'auth.continueApple'
  | 'auth.orEmail'
  | 'auth.continueConfirm'
  | 'auth.clerkMissing'
  | 'auth.status'
  | 'about.diffTitle'
  | 'about.diffFeed'
  | 'about.diffPro'
  | 'about.readPrivacy'
  | 'auth.useLatestCode'
  | 'brand.tagline'
  | 'brand.shortDescription'
  | 'auth.sendNewCode'
  | 'auth.stillMissing'
  | 'auth.countryHint'
  | 'auth.verifyEmailTitle'
  | 'auth.codeSent'
  | 'auth.signInHint'

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
  'upload.changeMedia': 'Change media',
  'upload.titleField': 'Title',
  'upload.titlePlaceholder': 'e.g. PocketBudget for iOS',
  'upload.description': 'Description',
  'upload.descriptionPlaceholder': 'What does the product solve — in one sentence?',
  'upload.tags': 'Tags (max {max})',
  'upload.allTags': 'All tags',
  'upload.tagsPlaceholder': 'e.g. app, ios, productivity',
  'upload.addTag': 'Add tag',
  'upload.popular': 'Popular',
  'upload.linkLocked': 'Locked — requires Pro Yearly',
  'upload.upgradeHint':
    'Upgrade to Pro Yearly to add clickable links on your blix.',
  'upload.firebaseAuth': 'Firebase sign-in',
  'upload.firebaseAuthFail':
    'Firebase sign-in failed. Sign out and back in, then try again.',
  'account.createProfileHint':
    'Create a profile to publish blix and sync Pro status.',
  'account.planStandard': 'Monthly · publish video/image without outbound link',
  'account.planProFeature': 'Clickable store links on every blix',
  'account.privacyPolicy': 'Privacy policy',
  'account.about': 'About {name}',
  'link.leaveTitle': 'You are leaving {name}',
  'link.leaveBody':
    '{name} is not responsible for content on external sites. Continue to {domain}?',
  'link.continue': 'Continue',
  'link.openApp': 'Open app',
  'link.buyHere': 'Buy here',
  'link.seeProduct': 'See product',
  'nav.privacy': 'Privacy',
  'nav.about': 'About BioBlix',
  'nav.tags': 'All tags',
  'nav.tag': 'Tag',
  'nav.profile': 'Profile',
  'nav.back': 'Back',
  'tags.empty': 'No tags yet. Add tags when you publish a blix.',
  'notFound.title': 'Off course',
  'notFound.body': 'Go back to the blix feed and keep exploring products.',
  'feed.swipeHint': 'Swipe or ↑ ↓ to change blix',
  'feed.swipeHintShort': 'Swipe to change blix',
  'tags.invalid': 'Invalid tag.',
  'tags.noPosts': 'No blix with this tag yet.',
  'tags.postCount': '{count} posts',
  'live.badge': 'LIVE',
  'live.goLive': 'Go live',
  'live.endLive': 'End live',
  'live.title': 'Live title',
  'live.titlePlaceholder': 'What are you showcasing?',
  'live.starting': 'Starting live…',
  'live.connecting': 'Connecting…',
  'live.webOnly': 'Live on web',
  'live.webOnlyBody': 'Go live from BioBlix in the browser for now. Native broadcast is coming later.',
  'live.notConfigured':
    'LiveKit is not set up. Add LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET in Vercel, then redeploy.',
  'live.startFail': 'Could not start live.',
  'live.watchFail': 'Could not join live.',
  'live.ended': 'This live has ended.',
  'live.hosting': 'You are live',
  'live.watching': 'Watching live',
  'live.nsfwEnded': 'Live ended',
  'live.nsfwEndedBody': 'Nudity or sexual content is not allowed. Your live was stopped.',
  'live.cameraDenied':
    'Camera or microphone access was denied. Allow camera and mic for BioBlix, then try again.',
  'live.openInSafari':
    'Go live needs Safari (or Chrome). Open this page in Safari — in-app browsers block the camera.',
  'privacy.title': 'Privacy policy',
  'privacy.updated': 'Last updated: {date}',
  'privacy.intro':
    'Applies to BioBlix on iOS, Android and web. Contact: {email}',
  'account.public': 'Public',
  'moderation.nsfw': 'Nudity or sexual content is not allowed on BioBlix.',
  'moderation.checkFail': 'Could not check media for content.',
  'auth.acceptLegal': 'You must accept the terms and privacy policy first.',
  'auth.appleRetry': ' Start over and try Apple again (or sign in with email).',
  'auth.appleUpdateFail': 'Could not update Apple profile.',
  'auth.sessionFail': 'Could not complete session.',
  'auth.appleFail': 'Apple sign-in failed. Check that Apple is enabled in Clerk.',
  'auth.fillName': 'Enter first and last name to finish Apple sign-in.',
  'auth.appleSessionMissing': 'Apple session is missing. Tap “Start over” and try again.',
  'auth.appleSessionInvalid': 'Apple session is invalid ({status}). Tap “Start over” and try again.',
  'auth.nicknameShort': 'Nickname must be at least 3 characters (no spaces).',
  'auth.fillNames': 'Enter first and last name.',
  'auth.fillEmailPassword': 'Enter email and password.',
  'auth.passwordShort': 'Password must be at least 8 characters.',
  'auth.createFail': 'Could not create account.',
  'auth.loginStopped': 'Sign-in stopped (status: {status}). Try Start over.',
  'auth.verifyIncomplete': 'Verification not complete (status: {status}). Send a new code.',
  'auth.enterCode': 'Enter the code from your email.',
  'auth.appleCompleteTitle': 'Finish Apple account',
  'auth.appleNameMissing': 'Apple did not share a name. Enter first and last name to continue.',
  'auth.appleOneStep': 'One step left to activate your Apple account. Tap Finish.',
  'auth.pickNickname': 'Choose a nickname and enter your name to get started.',
  'auth.clerkField': 'Clerk does not accept the “{param}” field. Enable it under User & authentication → Email/Username/Name, or try again.',
  'auth.birthInvalid': 'Enter birth date as YYYY-MM-DD (e.g. 2005-03-15).',
  'auth.ageTooYoung': 'BioBlix is only for people aged {age} or older.',
  'auth.birthRange': 'Invalid birth date.',
  'auth.invalidCode': 'Invalid code. Try again.',
  'share.checkOut': 'Check out {name} on BioBlix',
  'paywall.openFail': 'Could not open payment. Try again.',
  'privacy.rights': 'All rights reserved.',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
  'auth.show': 'Show',
  'auth.hide': 'Hide',
  'auth.termsAnd': 'and the terms of use',
  'auth.clerkPasswordRequired': 'Clerk requires a password after Apple. Turn off Password as required, or use email.',
  'auth.usernameRejected': 'Username rejected. Keep Username off in Clerk.',
  'auth.clerkKeyMissing': 'Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env (and CLERK_SECRET_KEY on the server).',
  'auth.notReady': 'Auth not ready',
  'auth.acceptPrefix': 'I accept the',
  'auth.continueApple': 'Continue with Apple',
  'auth.orEmail': 'or email',
  'auth.continueConfirm': 'By continuing you confirm that you have read our privacy policy.',
  'auth.clerkMissing': 'Clerk missing: {fields}',
  'auth.status': 'Status: {status}',
  'about.diffTitle': 'What makes BioBlix different',
  'about.diffFeed': 'Vertical product blix made for apps and physical goods — not generic social scrolling.',
  'about.diffPro': 'Pro Yearly unlocks clickable store links, mirrored securely via RevenueCat → Firestore.',
  'about.readPrivacy': 'Read the privacy policy',
  'auth.useLatestCode': 'Use the latest code, or tap “Send new code”.',
  'brand.tagline': 'Showcase apps and products in short blix',
  'brand.shortDescription':
    'BioBlix is a vertical showcase where creators share short videos and images of their apps and products — with an optional Pro link straight to a store or landing page.',
  'auth.sendNewCode': 'Send new code',
  'auth.stillMissing': 'Still missing: {fields}.',
  'auth.countryHint': 'Choose your country first — the form switches to your language.',
  'auth.verifyEmailTitle': 'Confirm email',
  'auth.codeSent': 'We sent a code to your email.',
  'auth.signInHint': 'Sign in with email and password.',
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
  'upload.changeMedia': 'Bytt medie',
  'upload.titleField': 'Tittel',
  'upload.titlePlaceholder': 'F.eks. PocketBudget for iOS',
  'upload.description': 'Beskrivelse',
  'upload.descriptionPlaceholder': 'Hva løser produktet — på én setning?',
  'upload.tags': 'Tags (maks {max})',
  'upload.allTags': 'Alle tags',
  'upload.tagsPlaceholder': 'f.eks. app, ios, produktivitet',
  'upload.addTag': 'Legg til tag',
  'upload.popular': 'Populære',
  'upload.linkLocked': 'Låst — krever Pro Årlig',
  'upload.upgradeHint':
    'Oppgrader til Pro Årlig for å legge til klikkbare lenker på dine blix.',
  'upload.firebaseAuth': 'Firebase-innlogging',
  'upload.firebaseAuthFail':
    'Firebase-innlogging feilet. Logg ut og inn igjen, så prøv på nytt.',
  'account.createProfileHint':
    'Opprett profil for å publisere blix og synce Pro-status.',
  'account.planStandard': 'Månedlig · publiser video/bilde uten utgående lenke',
  'account.planProFeature': 'Klikkbare butikklenker på hvert blix',
  'account.privacyPolicy': 'Personvernerklæring',
  'account.about': 'Om {name}',
  'link.leaveTitle': 'Du forlater nå {name}',
  'link.leaveBody':
    '{name} er ikke ansvarlig for innholdet på eksterne nettsteder. Vil du fortsette til {domain}?',
  'link.continue': 'Fortsett',
  'link.openApp': 'Åpne appen',
  'link.buyHere': 'Kjøp her',
  'link.seeProduct': 'Se produktet',
  'nav.privacy': 'Personvern',
  'nav.about': 'Om BioBlix',
  'nav.tags': 'Alle tags',
  'nav.tag': 'Tag',
  'nav.profile': 'Profil',
  'nav.back': 'Tilbake',
  'tags.empty': 'Ingen tags ennå. Legg til tags når du publiserer et blix.',
  'notFound.title': 'Ute av kurs',
  'notFound.body': 'Gå tilbake til blix-strømmen og fortsett å utforske produkter.',
  'feed.swipeHint': 'Sveip eller ↑ ↓ for å bytte blix',
  'feed.swipeHintShort': 'Sveip for å bytte blix',
  'tags.invalid': 'Ugyldig tag.',
  'tags.noPosts': 'Ingen blix med denne taggen ennå.',
  'tags.postCount': '{count} innlegg',
  'live.badge': 'LIVE',
  'live.goLive': 'Gå live',
  'live.endLive': 'Avslutt live',
  'live.title': 'Live-tittel',
  'live.titlePlaceholder': 'Hva viser du frem?',
  'live.starting': 'Starter live…',
  'live.connecting': 'Kobler til…',
  'live.webOnly': 'Live på web',
  'live.webOnlyBody': 'Gå live fra BioBlix i nettleseren foreløpig. Native sending kommer senere.',
  'live.notConfigured':
    'LiveKit er ikke satt opp. Legg til LIVEKIT_URL, LIVEKIT_API_KEY og LIVEKIT_API_SECRET i Vercel, og redeploy.',
  'live.startFail': 'Kunne ikke starte live.',
  'live.watchFail': 'Kunne ikke bli med i live.',
  'live.ended': 'Denne live-sendingen er avsluttet.',
  'live.hosting': 'Du er live',
  'live.watching': 'Ser live',
  'live.nsfwEnded': 'Live avsluttet',
  'live.nsfwEndedBody': 'Nakenhet eller seksuelt innhold er ikke tillatt. Live-sendingen ble stoppet.',
  'live.cameraDenied':
    'Kamera eller mikrofon ble nektet. Tillat kamera og mic for BioBlix, og prøv igjen.',
  'live.openInSafari':
    'Gå live krever Safari (eller Chrome). Åpne siden i Safari — innebygde nettlesere blokkerer kamera.',
  'privacy.title': 'Personvernerklæring',
  'privacy.updated': 'Sist oppdatert: {date}',
  'privacy.intro':
    'Gjelder BioBlix på iOS, Android og web. Kontakt: {email}',
  'account.public': 'Offentlig',
  'moderation.nsfw': 'Nakenhet eller seksuelt innhold er ikke tillatt på BioBlix.',
  'moderation.checkFail': 'Kunne ikke sjekke media for innhold.',
  'auth.acceptLegal': 'Du må godta vilkår og personvernerklæring først.',
  'auth.appleRetry': ' Start på nytt og prøv Apple igjen (eller logg inn med e-post).',
  'auth.appleUpdateFail': 'Kunne ikke oppdatere Apple-profil.',
  'auth.sessionFail': 'Kunne ikke fullføre sesjon.',
  'auth.appleFail': 'Apple-innlogging feilet. Sjekk at Apple er på i Clerk.',
  'auth.fillName': 'Fyll inn fornavn og etternavn for å fullføre Apple-innlogging.',
  'auth.appleSessionMissing': 'Apple-sesjonen mangler. Trykk «Start på nytt» og prøv igjen.',
  'auth.appleSessionInvalid': 'Apple-sesjonen er ugyldig ({status}). Trykk «Start på nytt» og prøv igjen.',
  'auth.nicknameShort': 'Kallenavn må være minst 3 tegn (uten mellomrom).',
  'auth.fillNames': 'Fyll inn fornavn og etternavn.',
  'auth.fillEmailPassword': 'Skriv inn e-post og passord.',
  'auth.passwordShort': 'Passord må være minst 8 tegn.',
  'auth.createFail': 'Kunne ikke opprette konto.',
  'auth.loginStopped': 'Innlogging stoppet (status: {status}). Prøv Start på nytt.',
  'auth.verifyIncomplete': 'Bekreftelse ikke fullført (status: {status}). Send ny kode.',
  'auth.enterCode': 'Skriv inn koden fra e-posten.',
  'auth.appleCompleteTitle': 'Fullfør Apple-konto',
  'auth.appleNameMissing': 'Apple delte ikke navn. Fyll inn fornavn og etternavn for å fortsette.',
  'auth.appleOneStep': 'Ett steg igjen for å aktivere Apple-kontoen. Trykk Fullfør.',
  'auth.pickNickname': 'Velg kallenavn og fyll inn navn for å komme i gang.',
  'auth.clerkField': 'Clerk godtar ikke feltet «{param}». Slå det på under User & authentication → Email/Username/Name, eller prøv igjen.',
  'auth.birthInvalid': 'Oppgi fødselsdato som ÅÅÅÅ-MM-DD (f.eks. 2005-03-15).',
  'auth.ageTooYoung': 'BioBlix er bare for personer som er {age} år eller eldre.',
  'auth.birthRange': 'Ugyldig fødselsdato.',
  'auth.invalidCode': 'Ugyldig kode. Prøv igjen.',
  'share.checkOut': 'Sjekk {name} på BioBlix',
  'paywall.openFail': 'Kunne ikke åpne betaling. Prøv igjen.',
  'privacy.rights': 'Alle rettigheter forbeholdt.',
  'auth.showPassword': 'Vis passord',
  'auth.hidePassword': 'Skjul passord',
  'auth.show': 'Vis',
  'auth.hide': 'Skjul',
  'auth.termsAnd': 'og vilkårene for bruk',
  'auth.clerkPasswordRequired': 'Clerk krever passord etter Apple. Slå av Passord som påkrevd, eller bruk e-post.',
  'auth.usernameRejected': 'Brukernavn avvist. Hold Username av i Clerk.',
  'auth.clerkKeyMissing': 'Sett EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY i .env (og CLERK_SECRET_KEY på serveren).',
  'auth.notReady': 'Auth ikke klar',
  'auth.acceptPrefix': 'Jeg godtar',
  'auth.continueApple': 'Fortsett med Apple',
  'auth.orEmail': 'eller e-post',
  'auth.continueConfirm': 'Ved å fortsette bekrefter du at du har lest vår personvernpolicy.',
  'auth.clerkMissing': 'Clerk mangler: {fields}',
  'auth.status': 'Status: {status}',
  'about.diffTitle': 'What makes BioBlix different',
  'about.diffFeed': 'Vertical product blix made for apps and physical goods — not generic social scrolling.',
  'about.diffPro': 'Pro Yearly unlocks clickable store links, mirrored securely via RevenueCat → Firestore.',
  'about.readPrivacy': 'Read the privacy policy',
  'auth.useLatestCode': 'Use the latest code, or tap “Send new code”.',
  'brand.tagline': 'Showcase apps and products in short blix',
  'brand.shortDescription':
    'BioBlix is a vertical showcase where creators share short videos and images of their apps and products — with an optional Pro link straight to a store or landing page.',
  'auth.sendNewCode': 'Send new code',
  'auth.stillMissing': 'Still missing: {fields}.',
  'auth.countryHint': 'Choose your country first — the form switches to your language.',
  'auth.verifyEmailTitle': 'Confirm email',
  'auth.codeSent': 'We sent a code to your email.',
  'auth.signInHint': 'Sign in with email and password.',
};
