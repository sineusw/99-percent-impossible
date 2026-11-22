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
