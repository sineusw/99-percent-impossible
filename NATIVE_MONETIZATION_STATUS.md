# Native monetization candidate — November 10, 2026

PR #33 remains draft and unmerged. App identity is unchanged: `com.pettygamesstudios.ninetynineimpossible`, App Store ID `6809299092`. It includes PR #32's gameplay/audio fixes and preserves the web Stripe checkout/API handlers.

## Device enrollment and fresh commerce evidence — November 13, 2026

- Owner's first physical TestFlight screenshots showed old build `348825794361` and the public invitation error **This beta is not accepting any new testers right now**. Earlier API-level distribution claims did not establish usable enrollment.
- Fresh authenticated inspection [43371332163](https://github.com/sineusw/99-percent-impossible/actions/runs/43371332163) confirmed current build `433688263061` VALID/BETA_APPROVED, assigned to existing public group `116840b3-d97e-42e6-8723-2960f02459db`. Public link enabled, limit 10, tester count 0. The cap was not full.
- [43371710063](https://github.com/sineusw/99-percent-impossible/actions/runs/43371710063) checked the complete associated-group audience through supported app/group relations, found zero recipients, and successfully issued Apple's explicit build-beta notification/start-testing action for only `433688263061`. No enrolled testers existed to receive messages. The immediate build state still read BETA_APPROVED. **Actual public-link admission remains pending owner confirmation.** The owner was asked to reopen https://testflight.apple.com/join/4PTBzRTD . Do not describe device distribution as verified until it admits the tester and shows the exact build.
- Fresh commerce run [43369299296](https://github.com/sineusw/99-percent-impossible/actions/runs/43369299296): **iPhone 3/3 passed**, including individual palettes, Rage Pass and both voice purchases/restore; **iPad 2/3 passed**, failing because no completed Mick transaction appeared after its single tap. Earlier full iPad run passed all 11/11, while earlier full iPhone run passed 10/11. Native commerce results are inconsistent and remain a release gate pending physical validation/investigation; no universal pass is claimed.
- Device candidate app code remains `203a9d5`; subsequent commits changed QA diagnostics, release workflow defaults, Apple inspection/distribution helpers and evidence only. No production IAP submission, main merge or App Store update occurred.

## Consent integration and current device candidate

This section supersedes earlier statements that consent is unconfigured or all requests are hardcoded test-only.

- Production ad configuration now selects the verified iOS interstitial only when `N99_AD_MODE=production`; native QA defaults to official Google test ads. Web ads remain disabled. Build validation rejects sample/missing/mismatched production identifiers and supports explicit registered test-device IDs.
- Native UMP runs before Mobile Ads initialization/requests. Failed/unknown permission disables ads while returning to gameplay. Home exposes Ad Privacy / Privacy Choices; reopening choices refreshes permission. Native forms keep game input and protected speech paused until dismissal. All requests use `npa=true`; this candidate does not request ATT permission.
- Pinned AdMob 7.2.0's consent bridge is patched during iOS preparation to attach the root view controller before initializing Mobile Ads. The generated plist delays app measurement initialization and records the ad mode. The exported IPA gate checks the bundled mode, identifiers and absence of StoreKit fixtures.
- European message **99 Percent Impossible iOS European Privacy** is Published for only the existing iOS app, English, EEA/UK/Switzerland, Consent/Manage options/Do not consent enabled and Close disabled. Evidence: [c3631917-a186-4fe0-8f4b-b6cae25d5316](https://agent.tinyfish.ai/runs/c3631917-a186-4fe0-8f4b-b6cae25d5316).
- US message **99 Percent Impossible iOS US Privacy** is Published for the existing iOS app, English, all Google-supported applicable US states, with opt-out/privacy choices enabled. Evidence: [e775924e-4c7c-4607-8407-9fdef8e9fd93](https://agent.tinyfish.ai/runs/e775924e-4c7c-4607-8407-9fdef8e9fd93). No IDFA explainer or legal agreement acceptance was added.
- Updated policy is live at https://99-percent-impossible.vercel.app/privacy.html . Production deployment `dpl_GL8wiKf4zFqskhpei4YDzHjxjCJX`, website-only commit `84d675f`. Homepage and app-ads.txt remain byte-for-byte unchanged. Public App Store lookup confirms the developer URL matches this domain. The publisher file is accessible, but AdMob still reports no app-ads.txt request data; crawler/serving verification is not claimed.
- **144 automated checks** and 174 Daisy / 217 Mick phrase checks passed locally. Mobile Chromium checks passed for web/native-mocked menus, three-mode navigation, the privacy control, and deferred consent game/audio locks. These are not physical SDK tests.
- First new QA upload [43367592652](https://github.com/sineusw/99-percent-impossible/actions/runs/43367592652) succeeded as build `433675926521`. It is superseded by the audio-lock fix below.
- **Current device candidate: 1.0.1 / `433688263061`**, source app commit `203a9d5`, signed/uploaded in [43368826306](https://github.com/sineusw/99-percent-impossible/actions/runs/43368826306). Real App ID, all six Apple mappings, test-ad mode, consent measurement delay and no StoreKit fixture were verified in the actual export. Temporary CI signing certificate: `345ZT433F3`; do not rotate while processing or submission is pending.
- Apple beta preparation/distribution [43369491022](https://github.com/sineusw/99-percent-impossible/actions/runs/43369491022) approved/associated this exact build with the existing 10-tester group, automatic notifications disabled. Link: https://testflight.apple.com/join/4PTBzRTD . Owner confirmed an iPhone is available; device results are pending.
- Full native run [43367589558](https://github.com/sineusw/99-percent-impossible/actions/runs/43367589558), app source `314c0d8`: iPhone passed 10/11 cases, including individual palettes, Rage Pass, three games, background/resume, privacy control and restore control. Voice-purchase case failed waiting for Daisy OWNED after one purchase tap. Its exported hierarchy still showed Daisy locked. This is an unresolved release gate, not a passed commerce test. iPad passed all 11/11 cases, including voice purchases and restore (job 131695545567).
- Targeted commerce follow-up [43369299296](https://github.com/sineusw/99-percent-impossible/actions/runs/43369299296), source `4e32e37`, waits for and records the actual StoreKit transaction after a single voice-purchase tap before checking ownership. App implementation matches the device candidate; only QA diagnostics changed. Results pending.
- Prior CI certificates `5KD7Z889T9` and `42GA2RC27U` were rotated only after their repository-owned temporary keys had been discarded and their uploads were confirmed VALID/BETA_APPROVED. Unrelated developer certificates were preserved.
- Final read-only AdMob audit [666c07b3-a3cf-445b-950d-6e14e054e7bf](https://agent.tinyfish.ai/runs/666c07b3-a3cf-445b-950d-6e14e054e7bf) reconfirmed both messages Published, associated only with iOS, and the exact interstitial present. The message editor did not expose the saved policy URL for independent verification; its binding remains unconfirmed despite the public URL being live and supplied during setup. Verify the link from a device consent form before release. Message/impression counts were zero in the inspected account UI; no production serving is established.
- No main merge, App Store release, production IAP submission, physical purchase/ad pass, or production impression/revenue is claimed. Six products remain READY_TO_SUBMIT. Device checklist: `DEVICE_RELEASE_QA.md`. Rewarded ads remain excluded pending a defined owner-approved reward.

## Authenticated AdMob follow-up — November 12, 2026 (America/New_York)

This section supersedes the unknown-identifier entries in the historical matrix below.

- Saved TinyFish sign-in worked. Read-only inspection [4eb4c088-2dcf-4ac9-9b40-86167b0d8f42](https://agent.tinyfish.ai/runs/4eb4c088-2dcf-4ac9-9b40-86167b0d8f42) confirmed existing **iOS** app `99 Percent Impossible`, App Store ID `6809299092`, AdMob App ID `ca-app-pub-3321938987480073~9570950756`, status **Ready / ad serving enabled**. Policy center reported no current issues limiting serving.
- The existing iOS app had no ad units. The two pre-existing units belong to **Android**, and must not be reused for iOS.
- After confirming the full iOS list was empty, [6f41dbe5-2232-4733-aaa4-608539cfd350](https://agent.tinyfish.ai/runs/6f41dbe5-2232-4733-aaa4-608539cfd350) created exactly one standard iOS interstitial: **Between Games Interstitial iOS**, `ca-app-pub-3321938987480073/8711122623`. No app/account or rewarded unit was created. Android settings were preserved.
- Both confirmed iOS identifiers are recorded in `native-monetization.json`. Build metadata now uses the real App ID, and configuration checks reject malformed ad units or publisher mismatches. **`ads.js` still uses official Google test units; saving these identifiers does not activate production requests.**
- Detailed app-ads.txt view says **No ad requests with app-ads.txt yet**, with no data displayed. A generic setup prompt does not prove the publicly hosted file is absent; crawl/authorization verification remains open.
- Privacy inspection [acbfa4ca-f4fa-4319-8a2a-effd7c275eb6](https://agent.tinyfish.ai/runs/acbfa4ca-f4fa-4319-8a2a-effd7c275eb6) found no published European-regulations, US-state-regulations or IDFA-explainer messages for the iOS app. No privacy settings or legal agreements were changed. Production integration needs UMP consent handling and applicable privacy settings/disclosures before device validation.
- No real production impressions, physical-device ad result or revenue is verified. The existing TestFlight binary is unchanged. Release remains held; PR #33 remains draft/unmerged.

## Current verified status — November 12, 2026 (America/New_York)

This matrix supersedes historical pending/missing-metadata statements below. No production release gate is waived.

| Area | Verified evidence / current state |
|---|---|
| Main / PRs | main `8dd2a38`; PRs #32 and #33 remain draft and unmerged. |
| Apple account | Fresh read-only run [43356870890](https://github.com/sineusw/99-percent-impossible/actions/runs/43356870890): public iOS version 1.0 READY_FOR_SALE; candidate build 429458525751 VALID, not expired. Expanded inspection [43357126768](https://github.com/sineusw/99-percent-impossible/actions/runs/43357126768) confirms public version 1.0 uses build `388277062691`; the candidate is BETA_APPROVED with autoNotifyEnabled false and the group public link enabled. |
| Six purchases | All six existing non-consumables READY_TO_SUBMIT. Screenshot upload run [42950986865](https://github.com/sineusw/99-percent-impossible/actions/runs/42950986865) recorded COMPLETE for every review image. These are not approved production products. |
| Native commerce QA | [42949961187](https://github.com/sineusw/99-percent-impossible/actions/runs/42949961187): three StoreKit fixture tests passed on both iPhone and iPad simulators, covering voices/restore, individual palettes and Rage Pass. These do not prove Apple sandbox/device commerce. |
| TestFlight | Apple reported BETA_APPROVED in [43356953074](https://github.com/sineusw/99-percent-impossible/actions/runs/43356953074). [43357023311](https://github.com/sineusw/99-percent-impossible/actions/runs/43357023311) enabled the existing group for exact build 429458525751 with a 10-tester limit and automatic notifications disabled. Link: https://testflight.apple.com/join/4PTBzRTD . No email invitations sent. |
| Fresh local checks | All 121 automated checks plus 174 Daisy / 217 Mick shipped phrase checks passed. Chromium mobile smoke checks opened and exited all three modes without page exceptions. |
| AdMob | Existing production App ID and ad unit IDs remain unknown; configuration values are null, requests are test-only. No authenticated policy/impression verification is available in this session. |
| Device QA | Physical iPhone purchases, reinstall/restore, audible voice QA and native ad presentation remain unverified. |
| Release | Held: no main merge, App Store submission or production IAP submission performed. |

The uploaded candidate predates HEAD only in QA harness/workflow and status documentation; game/monetization implementation files are unchanged. Rewarded ads remain optional and excluded until an owner-approved reward exists. Use the TestFlight candidate for sandbox purchase/device testing; do not treat test ads as production impressions.

## Historical account work

- Existing Apple API credentials in GitHub worked. Read-only run [42943209386](https://github.com/sineusw/99-percent-impossible/actions/runs/42943209386) confirmed the existing app is READY_FOR_SALE, with no existing IAP products or TestFlight groups. No app or account was recreated.
- After the user's explicit authorization to complete all necessary fixes, run [42943469928](https://github.com/sineusw/99-percent-impossible/actions/runs/42943469928) created the six missing NON_CONSUMABLE products, English names/descriptions, and USD price schedules. Run 42943906941 configured availability matching the existing app's countries without expanding app distribution.
- All six products currently report **MISSING_METADATA**, not approved or submitted. No real purchase has been made. Review screenshots and sandbox/physical-device validation remain outstanding.

| Logical item | Apple Product ID suffix* | Apple resource ID | USD |
|---|---|---|---:|
| Daisy voice | daisy | 6833273777 | 1.99 |
| Mick voice | mick | 6833273722 | 1.99 |
| Cyberpunk | cyberpunk | 6833273815 | 1.99 |
| Gold Only | goldonly | 6833273980 | 1.99 |
| Synthwave | synthwave | 6833274009 | 1.99 |
| Rage Pass | ragepass | 6833274120 | 3.99 |

*All product IDs begin `com.pettygamesstudios.ninetynineimpossible.`. The exact mapping is configured in `native-monetization.json`.

## AdMob

The user's screenshot supplied publisher `pub-3321938987480073`. The website-only `app-ads.txt` patch at `0a1e102` was published with explicit approval to the App Store-listed developer domain and verified publicly. Production deployment: `dpl_AzsLWD82DJHVAam4z1h8AcwB6qm1`. Its homepage matches the previous deployed source byte-for-byte.

The actual AdMob iOS App ID and production interstitial/rewarded ad unit IDs still require authenticated AdMob access. A publisher ID cannot replace either. Do not invent these values or create a duplicate account/app.

AdMob 7.2.0 fixes the native consent API compilation error found with 7.0.0. Native requests always use Google's official test interstitial units, with Google's sample iOS App ID until the real app ID is recovered. There are no simulated countdown ads. Loading timeouts invalidate late requests; dismissal/failure cleans listeners and releases retry once; gameplay never resumes under a presented ad. Verified Rage Pass suppresses interstitials. Browser ads remain disabled. Rewarded ads remain unimplemented pending account discovery and a defined optional reward.

## StoreKit implementation

A local Capacitor StoreKit 2 plugin verifies transactions/current entitlements, handles cancellation/pending approval, transaction updates and revocations, and restores through `AppStore.sync()`. Native ownership never comes from web tokens or Stripe. All six products must load from Apple before native offers become purchasable; native prices come from Apple's localized display prices. Purchased voices, palettes and Rage Pass use the existing gameplay entitlement gates. The colors menu exposes an Apple restore control.

`npm run ios:prepare` configures generated metadata and an iOS 15 minimum consistently. Re-running it preserves the generated project. `tests/ios/Monetization.storekit` is an official StoreKit test fixture used only by the simulator UI test target; it is excluded from the shipped web bundle and release build. TestFlight uses Apple's actual sandbox, not this fixture.

## Validation and release gates

- 121 automated checks pass (97 existing, 24 mocked-native), plus 174 Daisy / 217 Mick shipped phrase checks.
- Mac run [42940014677](https://github.com/sineusw/99-percent-impossible/actions/runs/42940014677) compiled the app and both plugins. All seven iPad UI tests and six iPhone UI tests passed. The remaining iPhone test failed on its first menu tap before reaching gameplay; accessibility evidence showed the home screen remained visible. The harness now waits for stable menu geometry and records before/after captures, while still requiring exactly one tap.
- Updated native tests exercise official StoreKit purchases, ownership after app relaunch, explicit restoration, all three individual palettes, and Rage Pass. Their Mac results are pending; no successful native purchase test is claimed yet.
- TestFlight-only upload support uses marketing version 1.0.1 and does not submit to App Review or notify testers. No signed candidate has yet been uploaded by this work.
- No physical iPhone ad, audio, purchase, reinstall restoration, or gameplay result is claimed. No direct TestFlight link exists yet.
- No main merge, production app release, legal agreement acceptance, or production IAP submission has occurred. The main workflow still automatically uploads matching changes; do not merge an unfinished candidate.

TestFlight upload attempt 42945563842 stopped at the distribution certificate quota before archiving/uploading. Existing certificates H8KPLMRHQH and T987323A82 were not touched. PXZ7735A4A is proven by the October release record and workflow to belong to this repository's discarded temporary keychain; its app is now READY_FOR_SALE rather than awaiting review. Targeted rotation of that stale CI certificate is authorized by the user's instruction to complete the fixes. No unknown developer certificate is selected for revocation.

TestFlight-only run 42945852575 successfully signed, verified, and uploaded marketing version 1.0.1, build 429458525751 to Apple. Distribution is not enabled. Native StoreKit run 42944377864 encountered `SKInternalErrorDomain Code=3` saving configuration/deleting transactions on the default iOS 26.5 runtime. This matches Apple-confirmed FB22237318 (https://developer.apple.com/forums/thread/826971); purchase tests did not pass. The runner already has iOS 26.2, so subsequent commerce tests explicitly select that runtime rather than silently choosing the affected newest runtime. The seven non-commerce iPad checks passed, including background/resume after the stable menu tap change.

The actual IPA artifact (13823310709) was downloaded and inspected after upload: bundle/version/build are correct, all six real Apple product IDs and N99StoreKit registration are embedded, Google requests remain test-only, and no `.storekit` configuration is shipped. New CI certificate 5KD7Z889T9 signed this build; its private key belongs to that run's temporary keychain. Do not rotate it while this upload is processing. TestFlight preparation keeps beta submission and public-link enablement as separate explicit actions, with no invitations or auto-notifications.

A further test-harness audit found the local StoreKit catalog was not explicitly selected in the simulator app's launch scheme. The QA-only generation script now selects it and bundles it in the QA app/test targets; the separate release workflow does not run this script, and the already uploaded IPA remains free of the fixture. StoreKit setup now runs only in commerce cases, and XCTest cases have explicit 90/120-second limits. Native purchase verification remains pending until these corrected tests pass.
