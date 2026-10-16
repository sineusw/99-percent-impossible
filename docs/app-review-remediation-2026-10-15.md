# App Review remediation — completed October 16, 2026

Version 1.0, build **388277062691**, was successfully resubmitted on October 16, 2026 at 9:17 AM PDT. App Store Connect visibly confirmed **Waiting for Review** for both the submission and its selected build. Approval is pending. Manual release remains selected.

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

PR #31 was merged into #30 (983cf0cb73b8e6ae589689d9b380c285863cbede), then #30 into main (9855e03220b2efc73bb2c860a7d2fc126ff4ab73). The live privacy page serves the updated iOS description. Release simulator compile run 38827068720 succeeded.

## Signed binary and upload

Release source: 022ce7d80f37a569b15e60c17051aefb5a4d3738. Release run [38827706269](https://github.com/sineusw/99-percent-impossible/actions/runs/38827706269) succeeded. Apple Distribution certificate PXZ7735A4A and its matching store profile passed strict deep signature and export verification. Fastlane confirmed upload on October 16 at 00:11:26 UTC. Version 1.0, build 388277062691, bundle com.pettygamesstudios.ninetynineimpossible, team FHGP486J8U.

The downloaded exported IPA's index.html, ads.js, voice-payments.js, cast-runtime-v1.js, cosmetics.js, gameplay-input-fairness.js, and privacy.html exactly match verified source bytes. CapacitorApp.framework is embedded. IPA SHA-256: 166c3df4f041b685cc64b0da6a0f9f1f1f872e4e2fd0ddbfeecddbb32f1f4298.

Earlier pre-upload attempts encountered a full distribution-certificate quota and a certificate-extraction argument error. Targeted rotation covered only certificates proven to belong to this repository's discarded temporary CI keys. Unrelated active certificates were untouched. The extraction argument was corrected before the successful run. Do not revoke PXZ7735A4A while this submission is pending.

## App Store Connect resubmission

Apple confirmed build processing Complete. Export compliance was saved as None of the algorithms mentioned above: the bundled app implements no custom encryption, using OS-provided HTTPS and randomness. The processed build became Ready to Submit.

On October 16, build 388277062691 replaced old selected build 348825794361. Updated review notes describe current gameplay, neutral background cancellation, absence of native purchases/external checkout, retained entitlement tokens, current services, simulator verification, and genuine screenshots. Obsolete Stripe-offer and old-build claims were removed from the notes. Sign-in required remains unchecked. Existing private review recording was retained. The six current required iPhone screenshots and seven 13-inch iPad screenshots were rechecked before submission; the explicit large Face ID set and inherited sizes were previously audited.

Update Review successfully placed the new build in Ready for Review. A response to Apple's Guideline 2.3.3 message explained the genuine screenshot replacements, corrected device assignments, current binary changes, and completed simulator testing. Resubmit to App Review was then executed. Fresh visible Apple evidence confirmed:

- Submission: Waiting for Review.
- Item: iOS App 1.0, build 388277062691, Waiting for Review.
- Date Submitted: October 16, 2026 at 9:17 AM PDT.
- Submission ID: 3ff5a2a3-4e7c-47ab-ae0a-3215970bf2fa.

This confirms successful resubmission, not Apple approval or publication.

## References and remaining actions

- [PR #30](https://github.com/sineusw/99-percent-impossible/pull/30): existing production simulated-ad fix, reviewed, tested and merged.
- [PR #31](https://github.com/sineusw/99-percent-impossible/pull/31): native remediation, test and signing verification changes, merged through #30.
- Release commit: 022ce7d80f37a569b15e60c17051aefb5a4d3738.
- Native verification: [run 38825706268](https://github.com/sineusw/99-percent-impossible/actions/runs/38825706268), fourteen checks passed across two simulators.
- [App Store Connect submission](https://appstoreconnect.apple.com/apps/6809299092/distribution/reviewsubmissions/details/3ff5a2a3-4e7c-47ab-ae0a-3215970bf2fa).

No account-holder action was blocking this free-app submission. Wait for Apple's decision and address any new feedback. After approval, the existing manual-release setting requires publishing the version. Future paid features need a complete Apple-compliant purchase/restore implementation and the relevant account agreements before being exposed. No new binary is needed for this report-only update.
