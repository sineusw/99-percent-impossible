# Release audit — November 9, 2026

## Follow-up update

The user subsequently approved both the code update and a verified live website deployment. Native store submission still remains pending. Additional regressions proved that mute could not cancel protected interruption speech or a pending welcome; a first gesture while muted could force a welcome; queued welcomes ignored a later mute; and already-playing outcome audio was not stopped by the sound control. These paths now respect mute immediately, including cancellation of pending voice requests through the existing transport. Unmute also primes gameplay audio in the same gesture. Six new audio-control checks pass, bringing the suite to 97 checks. The sections below preserve the initial audit record; the accompanying updated handoff records the final deployed commit and URL.

Status: fixes prepared locally for device QA. No merge, push, deployment, binary upload, submission, or publication performed.

## Baseline and historical issues

Audited main at `8dd2a38d351b1b910b57e717407a28e653a4dae2`, including runtime and legacy scripts, API handlers, tests, packaging, and workflows. Reviewed PRs #15, #17, #18, #19, #20, and #31. #15/#17/#18/#19 are merged. #31 merged through #30. #20 remains a draft Android branch at `65be31b6e80c83b89a9288c8cf7b8870e1a7f0ce`; its native billing plugin, JS adapter, and generated MainActivity registration script were inspected without enabling purchases or importing the draft.

Authenticated Vercel inspection identifies production deployment `dpl_CqfkyAiEpzueZJBsHsj9Y3Z3ivXj`, READY, targeting main at the baseline SHA. All 34 fetched production entry/script/style/SFX resources matched that commit byte-for-byte. No stale production version was found. Cache headers include no-store.

Existing tests already cover Reaction strict-mode initialization, suspicious scores below 100ms, the legitimate 100ms boundary, share eligibility from explicit metadata, single-touch scoring, retry, and neutral native/browser background cancellation. Browser inspection confirms default GO is green and TOO EARLY is red. Native purchase offers remain deliberately hidden; the web selector still offers Petty, Daisy, and Mick.

## Confirmed defects and repairs

1. **Perfect Stop used the latest rendered marker position rather than the press timestamp.** A deterministic full-stack test reproduced incorrect scores with animation frames both before and after a queued press. Rendering and scoring now share a reflected motion trajectory with the existing speed, bounds, and adaptive tiers. The input path passes the physical timestamp through the PB wrapper. Repeated terminal calls are guarded. Reflection now preserves travel through a boundary rather than discarding frame overshoot.
2. **A queued pre-GO press could become a suspicious 0ms result.** Reaction normalizes the timestamp before deciding whether a press was early. A timestamp before GO now produces TOO EARLY, even when the event handler runs after GO.
3. **Saved premium character selection was overwritten during asynchronous ownership verification.** Keep the saved preference while using Petty until verification succeeds. No unverified unlock is granted.
4. **Gameplay outcome pools had no gesture playback initialization.** `prime()` previously only called `load()` and was not connected to gestures. Each reused element now plays actual silent PCM during a gesture, then restores its outcome source; successful priming is not repeated. A pending priming callback cannot pause a real result. START/ticks/GO stay silent; fail/win/perfect remain the only audible gameplay outcomes. No AudioContext was added. This repairs the initialization path; audible iPhone/Android success is still unverified.
5. **45 Daisy phrase hashes had no shipped MP3.** Phrase edits in historical commit `0b59c8d` changed text after asset generation. A generated availability index now excludes only unshipped variants while retaining the full source library for future generation. Every category retains playable lines: 174 Daisy and 217 Mick phrases. No old wording was restored and no paid audio generation was invoked. The staging/test gate verifies the index against actual asset files.
6. **Exhausting a small commentary pool permitted immediate repeats.** The fallback now excludes the most recently chosen line when another line is available.
7. **Speech protection recognized only Petty interruption text.** The priority guard now uses the selected character's interruption library. Tests cover all three characters and ad priority.

Root `package-lock.json` now supports reproducible `npm ci`. The test-only Happy DOM dependency was updated from 20.14.5 to 21.0.4; both dependency audits report zero vulnerabilities. Affected script cache keys were updated.

Apple's documentation explains why the initialization clip contains real silence rather than relying only on JavaScript volume: [iOS-specific media considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html).

## Verification completed

- `npm ci` and `npm ci --prefix tests` succeed.
- `npm test`: 91 passing checks: 34 gameplay, 12 voice transport, 15 review gates, 30 release regressions; cast availability verification also passes.
- Timer visibility at 0.499/0.500 seconds, exact 1.000 scoring, 380ms near-miss lock/release, Stop advance/hold/reset, queued timestamps, ownership restoration, asset paths, muted SFX, and commentary priorities are covered.
- `npm run stage:web` succeeds; all 31 staged script/style entry assets match source. API and test folders are excluded.
- Syntax checks pass for all 49 JavaScript modules, JSON, Python, Ruby, and shell. `git diff --check` passes.
- Browser smoke checks: home/navigation, all three challenges and results, retry, Timer hidden phase, green GO, red TOO EARLY, earned sharing placement, and web cast menu. Layout inspected at 390×844, 360×640, and 820×1180. These are desktop-browser viewports, not physical devices or a WebKit/Android compatibility certification.
- Local browser uses a static server without Vercel API handlers. Petty API returns 501 there; paid voice generation and audible commentary were not validated by that browser check. API transport tests mock the provider and audio tests mock playback permission.

## Remaining release gates

1. **Physical-device sound and input:** iPhone Safari, Android Chrome, installed iOS, and the intended Android internal-test build. Verify first gesture, delayed near-miss outcomes, repeated retries, mute/unmute, all available cast previews/commentary, switching without overlap, interruptions, background/resume, and native sharing. The 45 excluded Daisy variants need generated MP3s before they can return to rotation.
2. **Native builds:** local `xcodebuild` is unavailable because only Command Line Tools are installed. No new IPA/AAB was compiled, signed, or compared with installed code. Native iOS must be built from the eventual approved candidate and run through the existing simulator XCTest suite plus physical-device QA. Android billing/SoundPool work belongs to draft #20; it is not part of current main and has not passed this audit's device gates.
3. **Current Apple status:** the available App Store Connect page requires authentication. Current approval/submitted-build state cannot be confirmed. The repository records version 1.0 build **388277062691**, release source `022ce7d80f37a569b15e60c17051aefb5a4d3738`, resubmitted October 16, Waiting for Review, with manual release. That is historical evidence, not today's status. New fixes are absent from that recorded binary.
4. **Payments:** preserve disabled native purchases. No StoreKit implementation exists on main; web Stripe checkout/restore was not transacted. Confirm the intended monetization separately before enabling native purchases. Do not import draft #20 merely to make its plugin exist on main.
5. **Approval:** do not merge or push this branch as a release action before device verification and user approval. Vercel Git integration creates deployments on pushes, and the existing main release workflow automatically uploads to App Store Connect for matching code changes.

No commit/build is certified ready for production release by this audit. The accompanying handoff identifies the exact local QA candidate commit.
