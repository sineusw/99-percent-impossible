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

## Rank-sensitive mix and sustained climbs — November 20, 2026

Supersedes the every-climb cadence above. Outside ranks 1–100, upward moves alternate rank reactions and normal gameplay roasting. Throughout ranks 1–100 (including the top 10), upward moves repeat rank reaction / rank reaction / gameplay roast. No top-10 exemption is used. Three or more consecutive upward moves unlock sustained-climb lines on eligible commentary turns. A drop or held rank breaks the climbing streak; drops retain their independent every-second-drop rank commentary. Displayed and spoken text remain paired. Counts are per game and selected character and last for the current app session.

The sample sequence now includes gradual climbs and additional moves inside the top 100/top 10 to exercise the cadence. Full regression tests and dedicated checks cover tier boundaries, exact two-of-three frequency, continuous-climb tracking, independent drops and the actual speech/caption consumer. Intermediate build 448375447871 was not assigned or activated for testers after correcting the initially assumed top-10 exception. Corrected replacement is **1.0.2 / 448384263331**, source 8a0248e.

Final delivery: upload 44838426333 succeeded; actual IPA artifact 14679398709 was inspected and its shipped commentary module executed to verify rank/rank/roast for both top-100 and top-10 climbs. Beta preparation 44838772468 verified the single owner notification audience, started testing and returned **IN_BETA_TESTING** for 448384263331. A standard Apple update notification was sent to the verified owner. Physical testing of the revised mix remains pending.

## First-attempt rank and rendering response — November 21, 2026

Candidate **1.0.2 / 449564423561**, source c2eb210. Rank display is seeded at startup and recovers a result already shown before the listener attaches. False starts and suspicious attempts keep the current sample rank visible as “UNRANKED ATTEMPT · RANK UNCHANGED”; they do not advance ranks or commentary cadence.

The current rank has no delayed opacity reveal; its optional settle animation is 140ms and uses transform only. Removed the synchronous rank layout read and duplicate clearing. Near-miss presentation pause is 120ms instead of 380ms, without changing score timestamps. The timer does not rewrite its hidden text every animation frame. Utility-control placement coalesces multiple mutation callbacks into one frame. Result background no longer uses expensive backdrop blur; long result panels scroll instead of clipping controls.

Verification: full regression suite passed, including startup/invalid-attempt visibility and layout coalescing tests. A 390×844 Chromium run with 4× CPU throttling completed a first false-start attempt: current rank visible, opacity 1, animation delay 0s, no page errors. Hidden timer generated zero text mutations over a 220ms observation window. Physical-device lag and voice latency still need owner feedback; remote Petty voice generation continues to require network access.

Upload workflow 44956442356 succeeded; actual IPA artifact 14727711304 was independently inspected for startup/unranked rank handling, absence of the forced layout read, batched controls and enabled leaderboard. The initial preparation workflow 44956728428 exhausted its processing window without activating the build. Retry 44957377115 uses a bounded 20-minute processing wait (30-minute job limit) for the exact 449564423561 candidate and can review/activate only that version, notifying only the verified owner tester. At this record, availability is pending Apple ingestion/processing; do not call the build IN_BETA_TESTING without the API outcome.

## Home rank and staged startup audio — November 21, 2026

Candidate **1.0.2 / 449582621811**, source 3c17451. Home shows a prominent YOUR RANK card above the game choices, explicitly labeled as leaderboard-preview/sample data. It synchronizes with the result rank and restores the saved sample sequence position after relaunch. Unranked attempts leave the displayed rank unchanged; corrupt saved positions safely reset.

Startup warmup now starts one silent element per outcome pool on a gesture (three elements rather than nine), then warms remaining pooled elements on later gestures. A 120ms guard prevents compatibility touch/click events from repeating a warmup burst. Outcome audio permission, retry-after-rejection and the protection against priming overriding a real result are tested. This reduces startup work but does not establish physical iPhone cold-start latency.

Verification: full local regression suite passed. Mobile Chromium confirmed the Home card visible in a 390×844 viewport, result/Home ranks matching after a real timer round and saved rank restored after reload, with no page errors. Sound tests confirm first-gesture budget, later warmups, silent priming, delayed outcome playback and failed-unlock retry.

Delivery evidence: upload 44958262181 succeeded; exported IPA artifact 14727978058 independently verified Home rank/restoration code, staged sound warmup and enabled leaderboard. Preparation 44958491311 is still waiting for this exact upload to appear/process in Apple; snapshot inspection 44959001476 showed the prior 449564423561 as the latest visible build. Do not describe 449582621811 as installable before its IN_BETA_TESTING outcome. The bounded preparation job can submit/review/activate the selected build and notify only the verified owner.
