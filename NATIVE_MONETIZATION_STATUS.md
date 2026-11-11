# Native monetization candidate — November 10, 2026

PR #33 remains draft and unmerged. App identity is unchanged: `com.pettygamesstudios.ninetynineimpossible`, App Store ID `6809299092`. It includes PR #32's gameplay/audio fixes and preserves the web Stripe checkout/API handlers.

## Completed account work

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
