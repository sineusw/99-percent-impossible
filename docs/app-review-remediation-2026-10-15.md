# App Review remediation — October 15, 2026

## Confirmed rejection

Apple's September 21 message under Guideline 2.3.3 says: “The 6.5-inch iPhone and 13-inch iPad screenshots do not show the current version of the app in use.” Submission: 3ff5a2a3-4e7c-47ab-ae0a-3215970bf2fa. Review device: iPad Air 11-inch (M3). Previously selected build: 348825794361, version 1.0.

The 13-inch iPad slots contained promotional city artwork and mock phone interfaces. The large Face ID iPhone group inherited existing screenshots. These assets required replacement. All eleven supporting rejection images were downloaded and visually inspected: six tall iPhone promotional/mock-interface images and five iPad promotional images. They do not match the current game controls or layout. The complete current rejection text, attachments, and live media manager identify the affected slots.

## Code changes

PR #30 disables simulated advertising outside explicit ?adtest=1 mode. PR #31 is based on #30 and adds:

- voice-payments.js: rejects native checkout, exposes purchase availability, and preserves saved entitlement tokens on transport failure.
- cast-runtime-v1.js and cosmetics.js: hide unowned paid offers when native purchases are unavailable, preserving provider-verified owned choices.
- gameplay-input-fairness.js and package.json: subscribe to native App appStateChange notifications through @capacitor/app 7.1.2. Actual simulator recording proved that WKWebView browser visibility events alone did not cancel an active timer after backgrounding. Native inactive notifications now invoke the existing neutral reset path, without counting a miss or clearing stored scores.
- privacy.html: describes iOS behavior separately from Android and website checkout, with the actual commentary/font services.
- tests/review-gates.mjs and tests/mobile-regression.mjs: regressions for ads, native paid-offer gates, entitlement token preservation, and native lifecycle cancellation across all three modes.
- tests/ios/ScreenshotCapture.swift and scripts/prepare-screenshot-tests.rb: real native XCTest capture and checks for menu, all three game/result/retry flows, background/resume, and hidden native paid offers.
- .github/workflows/ios-simulator-screenshots.yml and ios-menu-screenshots.yml: real simulator build/capture automation on iPhone 14 Plus and iPad Pro 13-inch M4.
- scripts/verify-ios-export.py and ios-app-store-release.yml: verify the actual exported IPA signature, distribution profile, team, bundle/version/build, expiration, and embedded signing-certificate match before upload.

No StoreKit purchasing or restoration is implemented. App Store Connect has no configured In-App Purchases, and the app is free. Existing saved tokens are retained; unverified tokens do not grant ownership. Issue #14 remains open. PR #20 is a draft Android billing bridge and does not supply iOS StoreKit support.

## Test and screenshot evidence

Local automated suite: 61 passing checks (34 gameplay, 12 audio, 15 review gates). Syntax and diff checks passed.

Initial capture run 38816653276 passed on both devices, source 2e2b89f07c2e197905348915da8ba124e6be0b66. Visual QA accepted seven iPad captures (2064 × 2752) and six iPhone captures (1284 × 2778); the phone reaction-result image still showed GO and was excluded. Stronger native assertions subsequently proved the iPad result/retry flows, menu, and offer gates, but exposed the real background timer bug in run 38820233810. Run 38822231781 exposed an integration mistake: this unbundled app uses Capacitor iOS's injected Plugins.App bridge, not a bundled registerPlugin API. The corrected app code is at ab7354752aea08b44aca41f78414c0f5c14562a2. All seven iPhone checks passed in run 38824049537. On iPad, the first semantic accessibility tap failed to open the menu mode before any backgrounding; later game flows passed. The harness now waits for the late-installed cast control and taps physical button centers. All seven iPad checks passed in run 38825706268 at 4335c642ef2f24edef3ff79c3e27eed6a62fe374. Both jobs in run 38825706268 ultimately passed all seven checks each, with zero failures. That revision changes only tests/documentation relative to the earlier passing iPhone app code.

English (U.S.) Apple metadata now contains six genuine captures in the required medium Dynamic Island iPhone slot (uniformly resized/cropped to 1179 × 2556), six original iPhone captures explicitly assigned to large Face ID, and seven original iPad captures in the 13-inch slot. Apple confirmed counts 6, 6, and 7 after processing. All other iPhone and iPad display groups were expanded and audited: they have no separate custom assets and inherit the current sets (the optional iPhone Duo slot is empty). English (U.S.) is the sole enabled localization in Media Manager. No app previews were present. No gameplay content was fabricated or materially altered. Old assignments were removed, with originals retained in Apple's Asset Library.

The tests do not prove audible output on physical hardware or live StoreKit purchases/restoration. Sharing payload and audio transport are covered by automated tests, not a physical-device share-sheet test.

## Account and release checks

Free Apps Agreement and Digital Services Act status are Active. Paid Apps Agreement is New and would need legal-entity updates before paid features; it does not block the current free app without IAP. Current price schedule is free. Privacy label is Published, Data Not Collected; policy URL and support URL respond successfully. No legal agreements or pricing were changed.

PR #31 was merged into #30 (983cf0cb73b8e6ae589689d9b380c285863cbede), then #30 into main (9855e03220b2efc73bb2c860a7d2fc126ff4ab73). The live privacy page now serves the iOS description. Release run 38827068836 stopped before archive/upload because Apple's three-distribution-certificate quota was full and none of the private keys was available on the fresh runner.

Historical run 36848855130 logs show certificate 8LDD86ULMQ was generated on October 1 in this repository's temporary CI keychain. That workflow retained only the IPA; it did not retain/export the private key. The retry adds only this proven CI-owned certificate to the existing stale-certificate rotation list. Other active certificates H8KPLMRHQH and T987323A82 are untouched. Revoking the superseded CI certificate may invalidate its unsubmitted October 1 build 368488551301; the new signed build will replace it. The currently selected September build remains selected until the new upload is processed.

Version 1.0 is still Rejected at this checkpoint. No new signed release upload or resubmission has occurred. Manual release remains selected. Remaining work: validate the retry's signing/upload and Apple processing, select the new build, update obsolete review notes, and resubmit. A successful workflow/upload is not App Review approval.


Signing retry run 38827334945 created certificate ZSZ95M9BQB and a matching profile, archived/exported successfully, and passed strict deep signature verification. The new certificate-extraction check then failed because its optional prefix argument needed the equals form (`--extract-certificates=PREFIX`). No IPA artifact or Apple upload occurred. The command was corrected, and that run's CI-only certificate was added to targeted rotation for the next fresh runner; unrelated certificates remain untouched.
