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
