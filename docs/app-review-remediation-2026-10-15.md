# App Review remediation — October 15, 2026

## Confirmed rejection

Apple's September 21 message under Guideline 2.3.3 says: “The 6.5-inch iPhone and 13-inch iPad screenshots do not show the current version of the app in use.” Submission: 3ff5a2a3-4e7c-47ab-ae0a-3215970bf2fa. Review device: iPad Air 11-inch (M3). Previously selected build: 348825794361, version 1.0.

The 13-inch iPad slots contained promotional city artwork and mock phone interfaces. The large Face ID iPhone group inherited existing screenshots. These assets required replacement. Review attachments were listed but their original files were not individually downloaded; the complete current rejection text and the live media manager identified the affected slots.

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

Initial capture run 38816653276 passed on both devices, source 2e2b89f07c2e197905348915da8ba124e6be0b66. Visual QA accepted seven iPad captures (2064 × 2752) and six iPhone captures (1284 × 2778); the phone reaction-result image still showed GO and was excluded. Stronger native assertions subsequently proved the iPad result/retry flows, menu, and offer gates, but exposed the real background timer bug in run 38820233810. A new run 38822231781 tests the lifecycle fix at 92af54c0abda40d51f5f49849c573520e35744f0.

English (U.S.) Apple metadata now contains six genuine captures in the required medium Dynamic Island iPhone slot (uniformly resized/cropped to 1179 × 2556), six original iPhone captures explicitly assigned to large Face ID, and seven original iPad captures in the 13-inch slot. Apple confirmed counts 6, 6, and 7 after processing. No app previews were present. No gameplay content was fabricated or materially altered. Old assignments were removed, with originals retained in Apple's Asset Library.

The tests do not prove audible output on physical hardware or live StoreKit purchases/restoration. Sharing payload and audio transport are covered by automated tests, not a physical-device share-sheet test.

## Account and release checks

Free Apps Agreement and Digital Services Act status are Active. Paid Apps Agreement is New and would need legal-entity updates before paid features; it does not block the current free app without IAP. Current price schedule is free. Privacy label is Published, Data Not Collected; policy URL and support URL respond successfully. No legal agreements or pricing were changed.

Version 1.0 still has the old build selected and is Rejected at this checkpoint. No merge, signed release upload, or resubmission has occurred yet. Manual release remains selected. Remaining work: pass the final native run, merge #31 into #30 and #30 into main, validate signing/upload and Apple processing, select the new build, update obsolete review notes, and resubmit. A successful workflow/upload is not App Review approval.
