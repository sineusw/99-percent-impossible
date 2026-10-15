# App Review remediation — October 15, 2026

## Verified Apple rejection

Authenticated App Store Connect inspection confirmed version 1.0 remains Rejected with Unresolved Issues. Submission: 3ff5a2a3-4e7c-47ab-ae0a-3215970bf2fa.

Apple's September 21 message under Guideline 2.3.3 says: “The 6.5-inch iPhone and 13-inch iPad screenshots do not show the current version of the app in use.” Apple asks for new screenshots accurately reflecting the app on supported devices and points to View All Sizes in Media Manager.

Review device: iPad Air 11-inch (M3). Reviewed and currently selected build: 348825794361, version 1.0.

## Current media audit

English (U.S.): seven screenshots and zero previews in the medium Dynamic Island iPhone group. They visibly show the app menu, three modes, and three result screens. The large Face ID iPhone group (including 1242 × 2688) has zero custom screenshots and inherits the seven existing assets. These may have changed since rejection; device comparison is still required.

13-inch iPad: five screenshots, zero previews. Visible assets include colorful promotional city artwork, mock phone interfaces, and Perfect Timer/Reaction Test posters rather than the current app UI. Replace with genuine iPad captures, including menu, each mode, and results. Accepted portrait screenshot dimensions shown by Apple: 2048 × 2732 or 2064 × 2752. Do not stretch iPhone captures into iPad screenshots.

Eleven rejection attachment filenames are listed. Their original files were not downloaded or individually examined. No screenshots, previews, metadata, or review messages were changed in App Store Connect.

## Repository and fixes

Main confirmed at 9e0c2a3947e12ebd7839d39b29a21f842dfbb489.

PR #30 remains open: https://github.com/sineusw/99-percent-impossible/pull/30
Commit 30d2162f5de2cb56bcd3b5c9fa5998910afc22dc changes ads.js so simulated ads only run with explicit adtest=1; noads=1 still overrides it. Reviewed and behavior tested. Not merged.

Local branch fix/ios-review-purchase-gates is based on PR #30. Commit 9a3bc4f adds:
- voice-payments.js: reject native checkout, expose purchase availability, preserve saved entitlement tokens after transport failure.
- cast-runtime-v1.js: hide unavailable unowned premium voice offers; retain owned options supplied by the entitlement provider.
- cosmetics.js: hide unavailable unowned palette/bundle purchases; retain owned options.
- tests/review-gates.mjs: ad opt-in, native checkout blocking, offer visibility, saved-token preservation, and owned-option tests.
- tests/package.json: include review gates in the standard test command.

This does not implement StoreKit, native restoration, or offline entitlement verification. Retaining tokens does not prove customers can use or restore purchases on iOS; that remains a release gate. No entitlements are granted based solely on unverified tokens.

PR #20 is an OPEN DRAFT Android billing bridge, not an iOS StoreKit fix. Issue #14 remains open for lifetime Remove Ads. Neither proves iOS transaction/restore support. The selected build's Apple review notes explicitly describe optional Stripe checkout purchases; update those notes only once the selected binary actually reflects the remediation.

## Validation

npm test --prefix tests: PASS, exit 0. 28 gameplay checks, 12 audio checks, 15 review-gate checks; total 55. node --check passed for all three modified production JS files; git diff --check passed.

Tests use Happy DOM and mocked audio/services. They do not establish physical touch behavior, audible output, rendering, StoreKit behavior, or device performance. This Linux workspace has no xcodebuild or iOS simulator. No device testing or genuine replacement screenshot capture occurred.

## Build and submission

No new build uploaded. No submission sent. Current status remains Rejected.

The release workflow automatically runs on main JS changes and uploads to App Store Connect, skipping metadata and screenshots. Merging #30 would trigger that workflow. Its configured bundle ID matches com.pettygamesstudios.ninetynineimpossible and signing uses Apple Distribution, manual provisioning, app-store-connect export, and a run-ID/attempt build number. Actual current certificate validity, profile validity, archive signature, and upload processing have not been reverified. Historical workflow success is not App Review approval.

The updated license agreement's acceptance status was not verified. Account Holder must check and accept if still pending. No agreement was accepted here.

## Remaining gates

1. Approve pushing the locally prepared purchase-gating branch and opening a review PR. Automatic approval review blocked the attempted push because the user requested confirmation for consequential new changes. No workaround was attempted.
2. Obtain macOS/Xcode or device access, validate genuine gameplay and entitlements, and capture iPhone/iPad screenshots from the selected release binary.
3. Resolve native purchase/restore behavior without losing customer access. Verify existing tokens and paid-customer history before release.
4. Replace iPad promotional assets; verify the inherited 6.5-inch iPhone screenshots against the selected binary. Inspect original Apple attachments if needed.
5. Merge reviewed fixes only after release gates pass; account for the automatic build/upload trigger. Verify new binary processing/signature and select the correct build if code fixes are included.
6. Check agreements, disclosures, all required fields and matching review notes. Submit an accurate response and resubmit only after fixes are complete. Obtain required authorization for consequential actions.

The confirmed rejection is metadata-related. New screenshots can address that complaint without inherently requiring a binary; including the ad and purchase fixes requires a new binary.


## Simulator capture completion — later October 15

PR #31 was published with purchase gates, then extended with capture workflows. Both jobs in iOS Simulator Screenshots run 38816653276 completed successfully from commit 2e2b89f07c2e197905348915da8ba124e6be0b66. This supersedes the earlier lack of simulator access: GitHub-hosted macOS runners provided actual iOS simulator builds.

XCTest captured seven iPad Pro 13-inch (M4) screenshots at 2064 × 2752, plus seven iPhone 14 Plus screenshots at 1284 × 2778. Visual QA accepted all seven iPad images and six iPhone images; the phone reaction-result image still showed GO and was excluded. Result-existence assertions in the capture smoke tests should be strengthened to wait for a visible, hittable result control before future capture runs. A passing smoke test does not establish full reaction input correctness.

The delivered ZIP contains 13 unchanged original PNGs, source provenance, and limitations. It shows genuine menu, all three game modes, and real results. No fabricated scores, pixel edits, or stretched phone-to-tablet imagery were used. The simulator images come from the PR #31 release candidate; include those code changes in the final binary or verify asset parity before Apple submission.

All 55 DOM/audio/review checks also passed on both capture runners. Simulator UI smoke tests passed on both devices; audible output, actual purchase and restoration, sharing, background/resume, and full device coverage are not proven by these capture tests.

No fixes have been merged into main, no new signed binary uploaded, and no Apple screenshots, metadata, review reply, or submission changed. The earlier branch-push approval blocker was resolved by the user's explicit confirmation. Agreement and signing checks remain pending.
