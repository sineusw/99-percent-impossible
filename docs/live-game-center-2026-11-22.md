# Live Game Center leaderboard beta

The owner selected perfect-streak rankings for Timer/Stop and fastest valid Reaction.

## Scope and score rules

- iOS Game Center is the source of identity, scores and global weekly standings. The web game does not pretend to share Game Center standings.
- Three classic leaderboards use GameKit's `.week` scope; this is Apple's weekly scope, not a custom reset schedule.
- Timer/Stop rank descending by perfect count, then ascending by first losing attempt's distance from perfect. Composite score = count × 60,000,001 + (60,000,000 − miss distance). Ongoing streaks submit count × 60,000,001. Timer distance is integer microseconds; Stop distance is integer ten-thousandths of a percentage point. No position is invented for a player with zero perfects.
- Reaction ranks ascending by integer milliseconds, with raw times below 100 ms and suspicious attempts excluded. Maximum accepted reaction is 60,000 ms.
- Runs reset when opening another game or leaving a game. Native counts are held in memory; app restarts reset active runs. Completed/best scores remain with Game Center.
- Scores that fail to sync are retained locally per player/game/UTC day and retried on refresh. Pending scores from earlier days are not submitted into a later weekly competition. No gameplay input awaits network work.
- This is client-submitted Game Center scoring with native validation, not server-authoritative anticheat.

## Apple resources configured

Existing app 6809299092 and bundle com.pettygamesstudios.ninetynineimpossible, signing bundle ID 85V7W7T39B.

| Game | Vendor identifier | Apple leaderboard ID |
| --- | --- | --- |
| Timer | com.pettygamesstudios.ninetynineimpossible.timer.v1 | de5bd44b-e37e-4e38-8552-ab89024bfe02 |
| Stop | com.pettygamesstudios.ninetynineimpossible.stop.v1 | 3504140a-cf7d-4aba-a9ac-d2a298b83537 |
| Reaction | com.pettygamesstudios.ninetynineimpossible.reaction.v1 | 7c73b766-70a4-4dca-b2f4-843beea388e3 |

Configuration workflow 45050599621 succeeded, including en-US names and score ranges. No App Store version or release was submitted. The signing capability is enabled on this existing App ID.

## UI and commentary

Home shows the selected game's actual current weekly rank. The modal shows top 100 entries, the player's own rank, game tabs, rules, manual refresh, and explicit signed-out/unranked/network states. Home/open-board polling is throttled to 30 seconds and pauses while hidden. Other refreshes are throttled or explicit; no per-frame networking.

The native app bypasses all sample-rank code. Offline labels never assert a fresh rank. Player names use textContent. Delayed replies cannot overwrite a later result or speak stale commentary.

Petty/Daisy/Mick retain existing character pools and shared cadence: rises outside top 100 alternate rank/roast, within top 100 use rank/rank/roast, every second drop comments, first/third drops stay silent, held position uses gameplay roast. Three consecutive rises select sustained-climb lines when rank commentary is eligible. Caption and spoken line share the exact selected string. Real ElevenLabs character audio remains the existing transport.

A pending rank update defers only result commentary for up to six seconds, never gameplay. On timeout the normal result comment is allowed, and a late reply does not interrupt it.

## Validation and remaining device checks

- Full JavaScript gameplay, monetization, privacy, cast audio, layout and rank regression suite passed.
- New happy-dom test verifies real bridge data is the rank source, HTML player names are escaped, suspicious results never submit, stale replies cannot overwrite a newer rank, and native sample UI is excluded.
- Headless Chromium at 393×852 confirmed leaderboard fit without horizontal overflow. Screenshot /workspace/output/live-leaderboard-qa.png uses explicitly named QA fixtures; it is not evidence of real Game Center network play.
- The export verifier checks the actual signed entitlement, provisioning capability, auto-registered native plugin and bundled UI before upload.
- Physical iPhone Game Center authentication, a qualifying submission and cross-account rank movement still require real-device testing after Apple processes the beta. Sandbox and public Game Center standings are separate.
- Public App Store release remains gated; main is not merged.

## Privacy website

Privacy-only commit 2d2478a4980d4e04a1dd321e04199b1345444ffe is based on the current public server commit 8a6aceb. It documents optional Game Center display-name and score sharing, and generalizes generated character commentary. No gameplay bundle was promoted to the website.

## Export verification

Beta candidate 1.0.2 (450508891281), source 1108cda77cab8d436e80c2ffc0b027026df5cbaf, upload workflow 45050889128. Archive and signed-export checks passed. Artifact 14765436762 was downloaded and independently inspected: N99GameCenterPlugin is compiled into N99Storekit.framework and included in Capacitor's packageClassList; live UI, shared voice lines, Petty handler and privacy page match source; sample-rank runtime is false. TestFlight processing/activation is tracked separately in workflow 45051155588.

An additional asynchronous caption/speech regression also passed: no premature speech while rank is pending, exactly matching line/caption on rank-ready, first drop silent and second drop spoken. The hosted privacy-only production deployment dpl_GR5YN11hEwJznaX3TgBcisCpmGFV is READY and the public policy contains the new Game Center section.

## Delivered TestFlight beta

Apple activation workflow 45051407463 succeeded. At 2026-11-22 17:48:37 UTC Apple returned `IN_BETA_TESTING` for build 450508891281, and Start Testing notified exactly the single verified owner tester. Link: https://testflight.apple.com/join/4PTBzRTD. Per-build test notes describe live Game Center boards, not sample ranks. CI-only signer Y2L88263CB belongs to upload run 45050889128; its temporary private key was discarded with that completed runner. Do not retire unrelated signing assets.

Owner device checks: update to 1.0.2 (450508891281), open LIVE LEADERBOARD on Home, connect Game Center, record a valid Reaction time or a Timer/Stop perfect, refresh/relaunch to confirm the score persists, then use a second Game Center account/device to confirm actual shared rank movement and cast reactions. These real-device checks have not yet been reported as passed.
