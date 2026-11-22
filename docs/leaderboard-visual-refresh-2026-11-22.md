# Larger wordmark and leaderboard visual refresh

Owner requested that the 99% IMPOSSIBLE sign fill the unused left-header space, and that both the whole-card leaderboard action and its destination page become more visually appealing.

## Implementation

- Responsive 92–112px 99% type, larger IMPOSSIBLE subtitle and a 116px header. Voice selection stays vertically aligned on the right; the native edge-to-edge/safe-area configuration remains unchanged.
- Trophy-medallion Home card with real world-rank/status, a clear view-board action and decorative footer. The entire card remains one semantic accessible control, not nested buttons.
- Dedicated full-height leaderboard dialog on phones, with a safe-area-aware sticky header/close control, larger trophy illustration, illustrated Timer/Stop/Reaction tabs, distinct personal-position card and refresh action.
- Real top-three entries get a podium. Initial avatars derive locally from actual player names; all player-controlled text uses textContent. No fake competitors, ranks, activity indicators or profile-image network calls are introduced.
- Standings rows show actual rank/name/score and highlight the local player. Signed-out, loading and empty boards have an illustrated state and a Play action that opens the existing selected game.
- Out-of-order tab responses may populate the appropriate game cache, but cannot replace the selected game's count/status with another game's message.
- Scoring, Game Center board identifiers, Petty/cast cadence, ownership, ads and gameplay timing remain unchanged. No new backend/provider account or public release is involved.

## Validation

Full existing JS regression suite passed. New assertions cover real-data podium rendering, escaping in podium/rows, signed-out state without invented players, empty-state Play navigation and out-of-order tab responses. A test selector was corrected to scope to the tab group after the dialog gained its own data-game state; the full suite was rerun successfully afterward.

Chromium checks at widths 320/393/430 verified no header overlap, no horizontal leaderboard overflow, selected-tab behavior, and Play navigation. Local screenshots are /workspace/output/leaderboard-new-home.png, /workspace/output/leaderboard-new-signed-out.png and /workspace/output/leaderboard-new-qa-populated.png. The populated screenshot uses explicitly named QA fixtures; it is not evidence of actual Game Center players or network standings.

Native iPhone/iPad focused layout checks and signed TestFlight delivery will be recorded below. Public web gameplay and main are unchanged.

## Export verification

Code source c6de881a93fc81baef63503413fe1e13a283d6ba produced 1.0.2 (450652279811) in successful upload workflow 45065227981. Downloaded IPA artifact 14770839166 was independently inspected: larger-logo/Home-card CSS, full leaderboard-page stylesheet and real-data renderer match reviewed source; edge-to-edge configuration and light status icons remain in place; sample ranks remain disabled. Native layout workflow 45065230735 and Apple activation workflow 45065426054 are tracked separately. Do not declare either passed/available until its actual result is confirmed.

## Final delivery and native checks

Build 1.0.2 (450652279811) is IN_BETA_TESTING, confirmed by activation workflow 45065426054: testingStarted, one verified owner notification recipient, and externalBetaState IN_BETA_TESTING. TestFlight: https://testflight.apple.com/join/4PTBzRTD. Export signer MA6WT8S589 used an ephemeral CI private key discarded after the runner.

Native workflow 45065230735 succeeded on iPhone 16 Pro (job 137339778625) and iPad Pro 13-inch M4 (job 137339778319). All three tests passed on both: edge-to-edge Home, edge-to-edge game, and whole-card taps at left/middle/right opening and closing the board. Downloaded iPhone artifact 14771417271 and visually inspected actual native Home and signed-out leaderboard screenshots, saved as /workspace/output/leaderboard-native-home.png and /workspace/output/leaderboard-native-page.png. Signed-out simulator evidence does not establish physical-device authenticated Game Center behavior.
