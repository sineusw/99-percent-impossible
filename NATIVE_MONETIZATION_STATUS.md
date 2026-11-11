# Native monetization candidate — November 10, 2026

PR #33 incorporates PR #32's reviewed gameplay/audio changes without merging main. App identity remains `com.pettygamesstudios.ninetynineimpossible` / App Store `6809299092`.

## Implemented, pending native compilation and physical iPhone validation

- AdMob 7.2.0 SDK with official platform-specific test interstitials. No simulated countdown ads, including browser `adtest` mode. Native load timeout invalidates late requests. Dismiss/failure removes listeners and releases the retry boundary once. No timeout resumes gameplay under a presented ad. Verified Rage Pass suppresses interstitials even in test mode.
- Local Capacitor StoreKit 2 plugin: six configurable non-consumable products, Apple-verified current entitlements, purchase cancellation/pending handling, transaction updates, refund/revocation handling, and explicit `AppStore.sync()` restore. Native JS never trusts web entitlement tokens or calls Stripe. Apple localized prices are used. Offers remain hidden unless the complete configured catalog loads from Apple. A restore button is available in the colors menu when the bridge exists.
- iOS preparation configures `GADApplicationIdentifier` and `N99StoreKitProducts` on every generation. StoreKit 2 raises the generated iOS minimum to 15.0. Re-running preparation preserves the existing generated project.
- Existing Stripe API files and web checkout are preserved.

## Account discovery and configuration

`native-monetization.json` is the sole account configuration input. The existing real AdMob App ID/unit IDs and six Apple product IDs have **not** been recovered. Empty values are deliberate and must not be interpreted as account absence. No accounts or products were created.

With no actual app ID configured, development uses Google's official sample iOS App ID `ca-app-pub-3940256099942544~1458002511`. Runtime requests remain Google's test units even after the real app ID is populated. Production serving requires a separate reviewed change; merely filling production unit IDs does not enable it. Rewarded ads remain unimplemented pending account discovery and an agreed reward.

On this environment, AdMob redirected to Google sign-in and App Store Connect redirected to Apple login. No authenticated sessions or Apple API credentials were available locally. The GitHub integration cannot list Actions secrets (403). Historical October records describe no configured Apple IAP, but do not establish today's account state.

Populate `appleProducts` with exactly the existing logical keys `daisy`, `mick`, `cyberpunk`, `goldonly`, `synthwave`, `ragepass` and their verified Apple product identifiers. Check statuses, non-consumable type, agreements, prices, and sandbox availability in App Store Connect first. Creating missing products still requires the user's specified approval.

## Verification and remaining blockers

- 97 existing automated checks plus 24 new mocked-native checks pass; cast asset gate verifies 174 Daisy and 217 Mick phrases.
- `npm run ios:prepare` generates and syncs all three plugins; metadata contains both the AdMob app ID and the StoreKit mapping. This Linux executor lacks CocoaPods and Xcode; sync skips native compilation. It is not a successful iOS build.
- StoreKit native code must compile on a Mac and pass sandbox purchase/restore and physical iPhone QA. No real transaction, reinstall restoration, ad presentation, audio playback, TestFlight upload, or physical-device result is claimed.
- No main merge, production release, or App Review submission is authorized by these changes. Existing main release workflow uploads automatically; use a separate explicitly selected test build path.

## Native build follow-up

Mac simulator run 42934474366 reached compilation and found the AdMob 7.0.0 consent API incompatible with the resolved Google UMP framework. Upgraded within Capacitor 7 to AdMob 7.2.0, which uses the renamed consent APIs and pins Google Mobile Ads 12.12.0 / UMP 3.0.0. All 121 automated checks still pass. A new Mac build is required; no successful native compilation is claimed.
