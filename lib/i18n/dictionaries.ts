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
  | 'auth.createFreeProfile'
  | 'auth.freeStandardNote'
  | 'auth.reason.like'
  | 'auth.reason.comment'
  | 'auth.reason.follow'
  | 'auth.reason.publish'
  | 'auth.reason.live'
  | 'auth.reason.watchLive'
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
  | 'account.registrations'
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
  | 'upload.gateTitle'
  | 'upload.gateLiveTitle'
  | 'upload.afterFirstProTitle'
  | 'upload.afterFirstProBody'
  | 'upload.afterFirstProConfirm'
  | 'upload.afterFirstProCancel'
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
  | 'social.signInToLike'
  | 'social.signInToComment'
  | 'social.signInToFollow'
  | 'social.edit'
  | 'profile.noBlix'
  | 'profile.followersFollowing'
  | 'profile.follow'
  | 'profile.following'
  | 'profile.share'
  | 'profile.madeWith'
  | 'profile.madeWithShoppable'
  | 'profile.madeWithCta'
  | 'profile.pinnedLinks'
  | 'profile.tabLinks'
  | 'profile.tabBlix'
  | 'profile.invalid'
  | 'profile.notFound'
  | 'blix.notFound'
  | 'blix.shareThis'
  | 'blix.shared'
  | 'profile.blixSection'
  | 'profile.linksTitle'
  | 'profile.linksCount'
  | 'profile.linksEmpty'
  | 'profile.linksAdd'
  | 'profile.linksRemove'
  | 'profile.linksMax'
  | 'profile.linksTitleRequired'
  | 'profile.linksLabelPlaceholder'
  | 'profile.linksUrlPlaceholder'
  | 'profile.linksSaveFail'
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
  | 'coins.balance'
  | 'coins.earnHint'
  | 'coins.redeemMonth'
  | 'coins.redeemYear'
  | 'coins.notEnoughTitle'
  | 'coins.notEnoughBody'
  | 'coins.redeemedTitle'
  | 'coins.redeemedBody'
  | 'coins.redeemFail'
  | 'coins.signupBonusTitle'
  | 'coins.signupBonusBody'
  | 'coins.claimFailTitle'
  | 'coins.claimFailBody'
  | 'upload.liveBodyCoins'
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
  | 'auth.appleRedirectMissing'
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
  | 'share.blix'
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
  | 'auth.continueGoogle'
  | 'auth.googleFail'
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
  | 'landing.headline'
  | 'landing.headlineLine1'
  | 'landing.headlineHighlight'
  | 'landing.sub'
  | 'landing.domainPrefix'
  | 'landing.claimLabel'
  | 'landing.handlePlaceholder'
  | 'landing.handleShort'
  | 'landing.claimCta'
  | 'landing.continue'
  | 'landing.nameAvailable'
  | 'landing.nameTaken'
  | 'landing.claimMicro'
  | 'landing.howHeading'
  | 'signup.step1'
  | 'signup.step2'
  | 'signup.step3'
  | 'signup.progress'
  | 'onboarding.headline'
  | 'onboarding.sub'
  | 'onboarding.cta'
  | 'onboarding.pickOne'
  | 'onboarding.audience.influencer'
  | 'onboarding.audience.gamer'
  | 'onboarding.audience.student'
  | 'onboarding.audience.business'
  | 'auth.createFreeAccount'
  | 'auth.signUpHint'
  | 'auth.emailPlaceholder'
  | 'landing.step1Title'
  | 'landing.step1Body'
  | 'landing.step2Title'
  | 'landing.step2Body'
  | 'landing.step3Title'
  | 'landing.step3Body'
  | 'landing.inspiredHeading'
  | 'landing.inspiredSub'
  | 'landing.bottomHeadline'
  | 'landing.bottomCta'
  | 'landing.browseFeed'
  | 'landing.demoHandle'
  | 'landing.demoLine'
  | 'landing.demoShop'
  | 'landing.demoTapHint'
  | 'landing.personaHeading'
  | 'auth.neverPost'
  | 'landing.persona.influencer'
  | 'landing.persona.gamer'
  | 'landing.persona.business'
  | 'landing.persona.student'
  | 'landing.persona.influencerTitle'
  | 'landing.persona.gamerTitle'
  | 'landing.persona.businessTitle'
  | 'landing.persona.studentTitle'
  | 'landing.persona.influencerBody'
  | 'landing.persona.gamerBody'
  | 'landing.persona.businessBody'
  | 'landing.persona.studentBody'
  | 'landing.persona.influencerLinkA'
  | 'landing.persona.influencerLinkB'
  | 'landing.persona.gamerLinkA'
  | 'landing.persona.gamerLinkB'
  | 'landing.persona.businessLinkA'
  | 'landing.persona.businessLinkB'
  | 'landing.persona.studentLinkA'
  | 'landing.persona.studentLinkB'
  | 'landing.persona.influencerBlix'
  | 'landing.persona.gamerBlix'
  | 'landing.persona.businessBlix'
  | 'landing.persona.studentBlix'
  | 'landing.persona.influencerShop'
  | 'landing.persona.gamerShop'
  | 'landing.persona.businessShop'
  | 'landing.persona.studentShop'
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
  'auth.createFreeProfile': 'Create free profile',
  'auth.freeStandardNote':
    'Standard is free — publish blix and show up in the feed. Pro adds clickable store links.',
  'auth.reason.like': 'Create a free profile to like blix.',
  'auth.reason.comment': 'Create a free profile to comment.',
  'auth.reason.follow': 'Create a free profile to follow creators.',
  'auth.reason.publish':
    'Create a free profile to publish your product blix. Store links are optional with Pro.',
  'auth.reason.live': 'Create a free profile to go live on BioBlix.',
  'auth.reason.watchLive': 'Create a free profile to watch live.',
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
  'account.registrations': 'Registered users: {count}',
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
  'upload.gateTitle': 'Publish your product',
  'upload.gateLiveTitle': 'Go live',
  'upload.afterFirstProTitle': 'Add a store link?',
  'upload.afterFirstProBody':
    'Your blix is live. Upgrade to Pro for a clickable store link on every blix.',
  'upload.afterFirstProConfirm': 'See Pro',
  'upload.afterFirstProCancel': 'Not now',
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
  'social.signInRequired': 'Create free profile',
  'social.signInRequiredBody': 'Create a free profile to like or comment.',
  'social.signInToLike': 'Create a free profile to like this blix.',
  'social.signInToComment': 'Create a free profile to leave a comment.',
  'social.signInToFollow': 'Create a free profile to follow creators.',
  'social.edit': 'Edit',
  'profile.noBlix': 'No blix yet.',
  'profile.followersFollowing': '{followers} followers · {following} following',
  'profile.follow': 'Follow',
  'profile.following': 'Following',
  'profile.share': 'Share profile',
  'profile.madeWith': 'Made with BioBlix — create your free profile',
  'profile.madeWithShoppable': 'Want clickable photos too?',
  'profile.madeWithCta': 'Create your BioBlix — free',
  'profile.pinnedLinks': 'Pinned links',
  'profile.tabLinks': 'Links',
  'profile.tabBlix': 'Blix ({count})',
  'profile.invalid': 'Invalid profile',
  'profile.notFound': 'User not found',
  'blix.notFound': 'This blix was not found',
  'blix.shareThis': 'Share this blix',
  'blix.shared': 'Link copied / share sheet opened',
  'profile.blixSection': 'Blix ({count})',
  'profile.linksTitle': 'Links',
  'profile.linksCount': '{count}/{max}',
  'profile.linksEmpty': 'Add Instagram, TikTok, shop, or other links (up to 10).',
  'profile.linksAdd': 'Add link',
  'profile.linksRemove': 'Remove',
  'profile.linksMax': 'You can add up to {max} links.',
  'profile.linksTitleRequired': 'Enter a short label for the link.',
  'profile.linksLabelPlaceholder': 'Label (e.g. Instagram)',
  'profile.linksUrlPlaceholder': 'https://…',
  'profile.linksSaveFail': 'Could not save links.',
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
    'Create a free profile to publish blix. Pro is optional — add store links when you are ready.',
  'account.planStandard': 'Monthly · publish video/image without outbound link',
  'account.planProFeature': 'Clickable store links on every blix',
  'account.privacyPolicy': 'Privacy policy',
  'account.about': 'About {name}',
  'coins.balance': '{coins} coins',
  'coins.earnHint':
    '+{signup} for creating a profile · +{publish} per blix you publish. Redeem for Pro — no cash-out.',
  'coins.redeemMonth': '{cost} → 1 month Pro',
  'coins.redeemYear': '{cost} → 1 year Pro',
  'coins.notEnoughTitle': 'Not enough coins',
  'coins.notEnoughBody': 'You need {need} coins (you have {have}). Publish more blix to earn.',
  'coins.redeemedTitle': 'Pro unlocked with coins',
  'coins.redeemedBody': 'Spent {cost} coins · Pro store links for {days} days.',
  'coins.redeemFail': 'Could not redeem coins',
  'coins.signupBonusTitle': 'Welcome coins',
  'coins.signupBonusBody': '+{coins} coins for creating your BioBlix profile.',
  'coins.claimFailTitle': 'Could not claim coins',
  'coins.claimFailBody': 'Open Account again in a moment, or check that /api/coins is deployed.',
  'upload.liveBodyCoins':
    'Your blix is visible in the feed. +{coins} coins earned.',
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
    'Camera/mic blocked. On iPhone: open in Safari → allow camera & mic. If you tapped Don’t Allow before: Settings → Safari → Camera/Microphone → Allow, then reload.',
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
  'auth.googleFail': 'Google sign-in failed. Enable Google in Clerk SSO.',
  'auth.appleRedirectMissing':
    'Apple sign-in did not start. Refresh the page and try again (or use email).',
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
  'share.blix': '{title} — shared on BioBlix',
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
  'auth.continueGoogle': 'Continue with Google',
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
  'landing.headline': 'Share your everyday. Click the moments.',
  'landing.headlineLine1': 'Share your everyday.',
  'landing.headlineHighlight': 'Click the moments.',
  'landing.sub':
    'Gather your followers in one place. Post photos and videos with direct links to everything you do — completely free.',
  'landing.domainPrefix': '://bioblix.com',
  'landing.claimLabel': 'Claim your BioBlix name',
  'landing.handlePlaceholder': 'yourname',
  'landing.handleShort': 'Name must be at least 3 characters (a–z, 0–9, _).',
  'landing.claimCta': 'Claim your link',
  'landing.continue': 'Continue',
  'landing.nameAvailable': 'This name is available! 🎉',
  'landing.nameTaken': 'That name is taken — try another.',
  'landing.claimMicro': '⚡ Takes under 60 seconds. No credit card required.',
  'signup.step1': 'Claim name',
  'signup.step2': 'Create account',
  'signup.step3': 'Personalize',
  'signup.progress': 'Step {step} of {total}',
  'onboarding.headline': 'What will you use BioBlix for?',
  'onboarding.sub': 'Pick one or more — we’ll tailor your profile modules.',
  'onboarding.cta': 'Go to my profile 🚀',
  'onboarding.pickOne': 'Pick at least one option to continue.',
  'onboarding.audience.influencer': 'Influencer / Creator',
  'onboarding.audience.gamer': 'Gaming / Streaming',
  'onboarding.audience.student': 'Student / Personal',
  'onboarding.audience.business': 'Business / Brand',
  'auth.createFreeAccount': 'Create free account',
  'auth.signUpHint': 'Continue with Google or Apple — or email. Completely free.',
  'auth.emailPlaceholder': 'you@email.com',
  'landing.howHeading': 'How it works',
  'landing.step1Title': 'Claim your name',
  'landing.step1Body': 'Create your unique bioblix.com link in under a minute.',
  'landing.step2Title': 'Share your everyday',
  'landing.step2Body':
    'Upload photos and videos from your life, setup, or products.',
  'landing.step3Title': 'Make it clickable',
  'landing.step3Body':
    'Add links inside your posts and send followers exactly where you want.',
  'landing.inspiredHeading': 'Inspired? See how others use BioBlix',
  'landing.inspiredSub': 'Real profiles — everyday moments with links inside.',
  'landing.bottomHeadline': 'Ready to make your links come alive?',
  'landing.bottomCta': 'Get started free',
  'landing.browseFeed': 'Explore the live blix feed',
  'landing.demoHandle': 'yourname',
  'landing.demoLine': 'Example profile — clickable media + pinned links',
  'landing.demoShop': 'My shop',
  'landing.demoTapHint': 'Tap the photo → the link opens.',
  'landing.personaHeading': 'Tailored for you',
  'landing.persona.influencer': 'Influencers',
  'landing.persona.gamer': 'Gamers',
  'landing.persona.business': 'Business',
  'landing.persona.student': 'Students',
  'landing.persona.influencerTitle': '@nova.creates',
  'landing.persona.gamerTitle': '@pixel.raid',
  'landing.persona.businessTitle': '@north.cafe',
  'landing.persona.studentTitle': '@mila.studies',
  'landing.persona.influencerBody':
    'Turn followers into customers. Put discount codes and product links right inside your outfit photos.',
  'landing.persona.gamerBody':
    'Show off your setup. Link your gear, Discord, and go live-green when you stream on Twitch.',
  'landing.persona.businessBody':
    'Simplify selling. Put store, booking, or menu links straight into your photos.',
  'landing.persona.studentBody':
    'Gather everything you do. Share everyday glimpses, Spotify playlists, and projects with friends — free.',
  'landing.persona.influencerLinkA': 'Shop the look (−15%)',
  'landing.persona.influencerLinkB': 'Latest YouTube',
  'landing.persona.gamerLinkA': 'Twitch — LIVE',
  'landing.persona.gamerLinkB': 'Join Discord',
  'landing.persona.businessLinkA': 'Book a table',
  'landing.persona.businessLinkB': 'Menu & hours',
  'landing.persona.studentLinkA': 'Portfolio / LinkedIn',
  'landing.persona.studentLinkB': 'Study playlist',
  'landing.persona.influencerBlix': 'Blix: “New drop tomorrow — sneak peek 👀”',
  'landing.persona.gamerBlix': 'Blix: “Ranked grind starts in 10 — come watch”',
  'landing.persona.businessBlix': 'Blix: “Fresh cinnamon rolls just out of the oven”',
  'landing.persona.studentBlix': 'Blix: “Thesis draft done. Coffee reward unlocked.”',
  'landing.persona.influencerShop': 'Opening shop → sweater −15%',
  'landing.persona.gamerShop': 'Opening → keyboard in my setup',
  'landing.persona.businessShop': 'Opening → book a table',
  'landing.persona.studentShop': 'Opening → portfolio',
  'auth.neverPost': 'We never post anything without your permission.',
  'auth.sendNewCode': 'Send new code',
  'auth.stillMissing': 'Still missing: {fields}.',
  'auth.countryHint': 'Choose your country first — the form switches to your language.',
  'auth.verifyEmailTitle': 'Confirm email',
  'auth.codeSent': 'We sent a code to your email.',
  'auth.signInHint': 'Sign in with Apple or email — it only takes a moment.',
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
  'auth.createFreeProfile': 'Lag gratis profil',
  'auth.freeStandardNote':
    'Standard er gratis — publiser blix og bli synlig i strømmen. Pro gir klikkbare butikklenker.',
  'auth.reason.like': 'Lag en gratis profil for å like blix.',
  'auth.reason.comment': 'Lag en gratis profil for å kommentere.',
  'auth.reason.follow': 'Lag en gratis profil for å følge skapere.',
  'auth.reason.publish':
    'Lag en gratis profil for å publisere produkt-blix. Butikklenker er valgfritt med Pro.',
  'auth.reason.live': 'Lag en gratis profil for å gå live på BioBlix.',
  'auth.reason.watchLive': 'Lag en gratis profil for å se live.',
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
  'account.registrations': 'Registrerte brukere: {count}',
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
  'upload.gateTitle': 'Publiser produktet ditt',
  'upload.gateLiveTitle': 'Gå live',
  'upload.afterFirstProTitle': 'Legge til butikklenke?',
  'upload.afterFirstProBody':
    'Blixet ditt er live. Oppgrader til Pro for klikkbar butikklenke på hvert blix.',
  'upload.afterFirstProConfirm': 'Se Pro',
  'upload.afterFirstProCancel': 'Ikke nå',
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
  'social.signInRequired': 'Lag gratis profil',
  'social.signInRequiredBody': 'Lag en gratis profil for å like eller kommentere.',
  'social.signInToLike': 'Lag en gratis profil for å like dette blixet.',
  'social.signInToComment': 'Lag en gratis profil for å kommentere.',
  'social.signInToFollow': 'Lag en gratis profil for å følge skapere.',
  'social.edit': 'Rediger',
  'profile.noBlix': 'Ingen blix ennå.',
  'profile.followersFollowing': '{followers} følgere · {following} følger',
  'profile.follow': 'Følg',
  'profile.following': 'Følger',
  'profile.share': 'Del profil',
  'profile.madeWith': 'Laget med BioBlix — lag din egen gratis profil',
  'profile.madeWithShoppable': 'Vil du også ha klikkbare bilder?',
  'profile.madeWithCta': 'Lag din BioBlix — gratis',
  'profile.pinnedLinks': 'Festede lenker',
  'profile.tabLinks': 'Lenker',
  'profile.tabBlix': 'Blix ({count})',
  'profile.invalid': 'Ugyldig profil',
  'profile.notFound': 'Fant ikke brukeren',
  'blix.notFound': 'Denne blixen ble ikke funnet',
  'blix.shareThis': 'Del denne blixen',
  'blix.shared': 'Lenke kopiert / delingsark åpnet',
  'profile.blixSection': 'Blix ({count})',
  'profile.linksTitle': 'Lenker',
  'profile.linksCount': '{count}/{max}',
  'profile.linksEmpty': 'Legg til Instagram, TikTok, butikk eller andre lenker (opptil 10).',
  'profile.linksAdd': 'Legg til lenke',
  'profile.linksRemove': 'Fjern',
  'profile.linksMax': 'Du kan legge til opptil {max} lenker.',
  'profile.linksTitleRequired': 'Skriv en kort tekst for lenken.',
  'profile.linksLabelPlaceholder': 'Navn (f.eks. Instagram)',
  'profile.linksUrlPlaceholder': 'https://…',
  'profile.linksSaveFail': 'Kunne ikke lagre lenker.',
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
    'Lag en gratis profil for å publisere blix. Pro er valgfritt — legg til butikklenker når du er klar.',
  'account.planStandard': 'Månedlig · publiser video/bilde uten utgående lenke',
  'account.planProFeature': 'Klikkbare butikklenker på hvert blix',
  'account.privacyPolicy': 'Personvernerklæring',
  'account.about': 'Om {name}',
  'coins.balance': '{coins} coins',
  'coins.earnHint':
    '+{signup} for å lage profil · +{publish} per blix du publiserer. Bruk coins til Pro — ingen utbetaling.',
  'coins.redeemMonth': '{cost} → 1 mnd Pro',
  'coins.redeemYear': '{cost} → 1 år Pro',
  'coins.notEnoughTitle': 'Ikke nok coins',
  'coins.notEnoughBody':
    'Du trenger {need} coins (du har {have}). Publiser flere blix for å tjene.',
  'coins.redeemedTitle': 'Pro låst opp med coins',
  'coins.redeemedBody': 'Brukte {cost} coins · Pro-butikklenker i {days} dager.',
  'coins.redeemFail': 'Kunne ikke løse inn coins',
  'coins.signupBonusTitle': 'Velkomst-coins',
  'coins.signupBonusBody': '+{coins} coins for å lage BioBlix-profil.',
  'coins.claimFailTitle': 'Kunne ikke hente coins',
  'coins.claimFailBody':
    'Åpne Konto igjen om litt, eller sjekk at /api/coins er deployed.',
  'upload.liveBodyCoins':
    'Blixet ditt er synlig i strømmen. +{coins} coins tjent.',
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
    'Kamera/mic blokkert. På iPhone: åpne i Safari → tillat kamera og mic. Hvis du trykket Ikke tillat før: Innstillinger → Safari → Kamera/Mikrofon → Tillat, last siden på nytt.',
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
  'auth.googleFail': 'Google-innlogging feilet. Aktiver Google i Clerk SSO.',
  'auth.appleRedirectMissing':
    'Apple-innlogging startet ikke. Oppdater siden og prøv igjen (eller bruk e-post).',
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
  'share.blix': '{title} — delt på BioBlix',
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
  'auth.continueGoogle': 'Fortsett med Google',
  'auth.orEmail': 'eller e-post',
  'auth.continueConfirm': 'Ved å fortsette bekrefter du at du har lest vår personvernpolicy.',
  'auth.clerkMissing': 'Clerk mangler: {fields}',
  'auth.status': 'Status: {status}',
  'about.diffTitle': 'Det som skiller BioBlix',
  'about.diffFeed':
    'Vertikale produkt-blix laget for apper og fysiske varer — ikke generisk sosial scrolling.',
  'about.diffPro':
    'Pro Årlig låser opp klikkbare butikklenker, speilet sikkert via RevenueCat → Firestore.',
  'about.readPrivacy': 'Les personvernerklæringen',
  'auth.useLatestCode': 'Bruk nyeste kode, eller trykk «Send ny kode».',
  'brand.tagline': 'Vis frem apper og produkter i korte blix',
  'brand.shortDescription':
    'BioBlix er en vertikal showcase der skapere deler korte videoer og bilder av apper og produkter — med valgfri Pro-lenke rett til butikk eller landingsside.',
  'landing.headline': 'Del hverdagen din. Klikk på øyeblikkene.',
  'landing.headlineLine1': 'Del hverdagen din.',
  'landing.headlineHighlight': 'Klikk på øyeblikkene.',
  'landing.sub':
    'Samle følgerne dine på ett sted. Legg ut bilder og videoer med direkte linker til alt du gjør – helt gratis.',
  'landing.domainPrefix': '://bioblix.com',
  'landing.claimLabel': 'Sikre BioBlix-navnet ditt',
  'landing.handlePlaceholder': 'dittnavn',
  'landing.handleShort': 'Navnet må være minst 3 tegn (a–z, 0–9, _).',
  'landing.claimCta': 'Sikre din link',
  'landing.continue': 'Fortsett',
  'landing.nameAvailable': 'Dette navnet er ledig! 🎉',
  'landing.nameTaken': 'Navnet er opptatt — prøv et annet.',
  'landing.claimMicro': '⚡ Tar under 60 sekunder. Krever ikke kredittkort.',
  'signup.step1': 'Sikre navn',
  'signup.step2': 'Opprett konto',
  'signup.step3': 'Tilpass',
  'signup.progress': 'Steg {step} av {total}',
  'onboarding.headline': 'Hva skal du bruke BioBlix til?',
  'onboarding.sub': 'Velg én eller flere — vi tilpasser profilmodulene dine.',
  'onboarding.cta': 'Gå til min profil 🚀',
  'onboarding.pickOne': 'Velg minst ett alternativ for å fortsette.',
  'onboarding.audience.influencer': 'Influencer / Kreatør',
  'onboarding.audience.gamer': 'Gaming / Streaming',
  'onboarding.audience.student': 'Student / Personlig',
  'onboarding.audience.business': 'Bedrift / Merkevare',
  'auth.createFreeAccount': 'Opprett gratis konto',
  'auth.signUpHint': 'Fortsett med Google eller Apple — eller e-post. Helt gratis.',
  'auth.emailPlaceholder': 'eksempel@epost.no',
  'landing.howHeading': 'Slik fungerer det',
  'landing.step1Title': 'Sikre ditt navn',
  'landing.step1Body': 'Opprett din unike bioblix.com-link på under ett minutt.',
  'landing.step2Title': 'Del hverdagen',
  'landing.step2Body':
    'Last opp bilder og videoer fra opplevelsene dine, din setup eller dine produkter.',
  'landing.step3Title': 'Gjør det klikkbart',
  'landing.step3Body':
    'Legg linker direkte i innleggene dine, og send følgerne dine akkurat dit du vil.',
  'landing.inspiredHeading': 'Inspirert? Se hvordan andre bruker BioBlix',
  'landing.inspiredSub': 'Ekte profiler — hverdagsøyeblikk med linker inni.',
  'landing.bottomHeadline': 'Klar til å gjøre linkene dine levende?',
  'landing.bottomCta': 'Kom i gang gratis',
  'landing.browseFeed': 'Utforsk blix-feeden',
  'landing.demoHandle': 'dittnavn',
  'landing.demoLine': 'Eksempelprofil — klikkbar media + festede lenker',
  'landing.demoShop': 'Min butikk',
  'landing.demoTapHint': 'Trykk på bildet → linken åpnes.',
  'landing.personaHeading': 'Skreddersydd for deg',
  'landing.persona.influencer': 'Influencere',
  'landing.persona.gamer': 'Gamere',
  'landing.persona.business': 'Bedrifter',
  'landing.persona.student': 'Studenter',
  'landing.persona.influencerTitle': '@nova.creates',
  'landing.persona.gamerTitle': '@pixel.raid',
  'landing.persona.businessTitle': '@north.cafe',
  'landing.persona.studentTitle': '@mila.studies',
  'landing.persona.influencerBody':
    'Gjør følgere til kunder. Legg rabattkoder og produktlinker direkte i antrekk-bildene dine.',
  'landing.persona.gamerBody':
    'Vis frem din setup. Link til utstyret ditt, Discord-serveren og lys grønt når du er live på Twitch.',
  'landing.persona.businessBody':
    'Forenkle salget. Legg linker til nettbutikk, tidsbestilling eller meny rett i bildene dine.',
  'landing.persona.studentBody':
    'Samle alt du gjør. Del hverdagsglimt, Spotify-lister og prosjekter med venner.',
  'landing.persona.influencerLinkA': 'Shop the look (−15%)',
  'landing.persona.influencerLinkB': 'Siste YouTube',
  'landing.persona.gamerLinkA': 'Twitch — LIVE',
  'landing.persona.gamerLinkB': 'Bli med i Discord',
  'landing.persona.businessLinkA': 'Book bord',
  'landing.persona.businessLinkB': 'Meny & åpningstider',
  'landing.persona.studentLinkA': 'Portefølje / LinkedIn',
  'landing.persona.studentLinkB': 'Studie-spilleliste',
  'landing.persona.influencerBlix': 'Blix: «Ny drop i morgen — sneikpeek 👀»',
  'landing.persona.gamerBlix': 'Blix: «Ranked om 10 — bli med og se»',
  'landing.persona.businessBlix': 'Blix: «Ferske kanelboller rett fra ovnen»',
  'landing.persona.studentBlix': 'Blix: «Thesis-utkast ferdig. Kaffe belønning.»',
  'landing.persona.influencerShop': 'Åpner butikk → genser −15%',
  'landing.persona.gamerShop': 'Åpner → tastaturet i setupen',
  'landing.persona.businessShop': 'Åpner → book bord',
  'landing.persona.studentShop': 'Åpner → portefølje',
  'auth.neverPost': 'Vi poster aldri noe uten din tillatelse.',
  'auth.sendNewCode': 'Send ny kode',
  'auth.stillMissing': 'Mangler fortsatt: {fields}.',
  'auth.countryHint': 'Velg land først — skjemaet bytter til språket ditt.',
  'auth.verifyEmailTitle': 'Bekreft e-post',
  'auth.codeSent': 'Vi sendte en kode til e-posten din.',
  'auth.signInHint': 'Logg inn med Apple eller e-post — det tar bare et øyeblikk.',
};
