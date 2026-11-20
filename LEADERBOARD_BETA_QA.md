# Leaderboard beta — November 19, 2026

Candidate: **1.0.2 / 446317554281**, app source `bccbef5`, upload workflow 44631755428. Artifact `14582127737`. Actual exported IPA was inspected: all leaderboard files are present and `N99LeaderboardPreviewEnabled=true`.

Includes all four leaderboard commits: fb42a2e, df0d04f, 6887a21 and 1c11120. The beta enables the preview without a URL parameter. Ordinary builds default off. The home label and result reveal identify sample/demo ranks. There is no connected worldwide score service in these branches.

On iPhone:

1. Confirm the exact build number in TestFlight before installing.
2. Find “Leaderboard demo · sample ranks” on Home.
3. Finish a round in each game. Results should show a rank path, animated current rank and milestone or movement headline above Retry.
4. Play repeated rounds to exercise top 1,000/100/50/25/10/5/3/1 reveals and downward movement. These follow a fixed sample-rank sequence, independent of real world competition.
5. With each owned character selected, check rotating captions and local day/time/holiday lines. Native dynamic leaderboard lines use device speech voices (English locale per character), not the prerecorded character voice. Normal gameplay retains its existing voice transport. Check mute, interruption, retry and privacy/ad audio locks on the physical device.
6. Check Retry and Close remain accessible, including with reduced motion and smaller screens. Vibration is browser-supported only and is not verified on iPhone.

Verification: full gameplay/audio/store/privacy regression suite passed; leaderboard tests cover gating, sample labels, milestone reveals, per-character variety, result identity, and native speech routing without web API fetches. A 390×844 Chromium session completed a real timer round, captured the rank reveal and found Retry accessible with no page errors. This does not establish physical iPhone audio/haptics behavior.

Apple processing completed and beta review approved the build. Preparation workflow 44632701324 returned BETA_APPROVED and associated it with the existing public tester group, https://testflight.apple.com/join/4PTBzRTD . Existing testers were not emailed. Open TestFlight and manually select version 1.0.2 / build 446317554281. Physical installation and feature/audio checks remain pending owner feedback.

### Testing activated after owner reported missing update

Preparation workflow 44634704099 verified that the full notification audience was the single owner tester, started testing, and confirmed **IN_BETA_TESTING** for build 446317554281. One standard Apple beta notification was issued to that verified owner. The earlier BETA_APPROVED/group-assigned status was insufficient to establish device availability; it is superseded by this activation result.

## Petty rank-change audio correction — November 20, 2026

Owner reported no audible Petty on rank rises/falls in 446317554281. Found the native leaderboard route intercepted Petty before his actual voice player and sent dynamic lines to device TTS. The corrected route preserves Petty's existing runtime HTMLAudio/voice API transport; device TTS remains the Daisy/Mick dynamic-line fallback. The full regression suite and a targeted Petty-routing test pass. A request with Origin capacitor://localhost to the live Petty voice endpoint returned HTTP 200 audio/mpeg (7,958 bytes) and matching CORS for a rank-climb line.

Replacement **1.0.2 / 448077898641**, source 21d7e3d, uploaded successfully via 44807789864. Independently inspected actual artifact 14662734710: corrected Petty branch is present and leaderboard preview remains enabled. Physical audibility still requires owner verification after installation.

Audio-fix delivery: workflow 44812789471 successfully submitted and activated build **448077898641**, returning **IN_BETA_TESTING**. The single owner tester was verified before Apple sent the standard update notification. Install this build to physically verify Petty's rank-change speech; prior 446317554281 is superseded.

## Matching captions and alternate-drop cadence — November 20, 2026

Candidate **1.0.2 / 448143364121**, source 705c18f, upload workflow 44814336412. Every rank climb selects a leaderboard line used for both the visible caption and speech. Drop counts are independent per game and character: odd-numbered drops are silent with the caption cleared; even-numbered drops select a line. Climbing between drops does not reset the drop cadence. Skipped drops cannot fall through to a generic game roast. Existing mute and ad/interruption priority behavior remains in force.

Full local regression suite passed. Dedicated tests exercise repeated rises/drops, per-character rotation, the actual Petty caption/speech consumer, exact text matching and the absence of generic speech on silent drops. Device validation remains pending installation.

Delivery status for cadence build: upload workflow 44814336412 succeeded. Preparation 44814846596 reached its seven-minute processing limit before the exact build became available; no activation or owner notification occurred. Fresh inspection 44815990105 still listed 448077898641 as the newest visible build, so 448143364121 is not yet installable and Apple ingest/processing is unverified. Do not describe it as IN_BETA_TESTING. Retry preparation for exact version 1.0.2/build 448143364121 after Apple exposes it.
