# Whole leaderboard card, stronger header and edge-to-edge iOS

The owner requested that the complete weekly leaderboard card open the leaderboard, that the 99% IMPOSSIBLE logo be larger and better placed, and that the white native top bar be removed.

## Changes

- The rank card is one semantic button with a single accessible label and rank/status description. Trophy, text, blank space and arrow share the same action. The inner arrow is decorative, not a second nested button. Keyboard activation uses the browser's native button behavior. Duplicate open calls are guarded.
- The wordmark is a larger stacked 99% / IMPOSSIBLE composition. The selected-voice pill is vertically aligned within the header and retains its existing action.
- Capacitor `ios.contentInset` changes from `automatic` to `never`. The WebView already fills the controller's root view; the page's existing viewport-fit=cover and env(safe-area-inset-*) spacing now own the safe area without a second UIKit inset.
- Native background is explicitly #0a0b16. CAPBridgeViewController's supported Info.plist defaults select light status icons with controller-based appearance. Status icons remain visible; the game background extends behind them, while controls stay clear of the Dynamic Island/status area. No new status-bar plugin is needed.
- The actual exported IPA is gated on the native inset, background and status settings.

## Validation scope

Full JS regression suite passed, including the new whole-card semantic/descendant-click assertions. Browser render checks at 320, 393 and 430px found no errors or horizontal overflow and opened all three modes, leaderboard and cast picker. Browser renders cannot verify native status-bar removal.

Focused native layout workflow 45060066715 builds the app on iPhone/iPad and captures real simulator screenshots. The iPhone layout scope selects an iPhone 16 Pro (Dynamic Island), although its inherited matrix display label still names the original default iPhone 14 Plus. New tests sample the native top background in Home and Timer, assert the leaderboard button's full width, and tap at 8%, 50% and 92% across the card to verify all three positions open the entire leaderboard dialog. Native tests were dispatched at commit 824b8bc; subsequent 9adff39 only clears inherited tracking on the new rank-copy span. Header geometry, native configuration and hit-area behavior are identical in both commits.

Signed beta build workflow: 45060271032, candidate build 450602710321. Await native evidence and Apple state before claiming device availability. No public App Store submission, main merge or public gameplay deployment is part of this change.

## Native findings and delivered build

The initial iPhone/iPad game-layout checks passed, including the native dark status-area sample. The initial Home/card checks searched only ordinary `app.buttons`; the real card was present in the native recording. The corrected lookup searches WebKit's accessible dialog trigger across control types. On iPhone 16 Pro, workflow 45061342250 / job 137327736987 passed all three native tests: Game dark status area, Home dark status area and full-width card, and taps at 8%, 50% and 92% opening the full dialog. WebKit reported XCUI element type 1 for the dialog trigger. Native screenshots were downloaded and visually inspected: /workspace/output/verified-fullscreen-home.png and /workspace/output/verified-leaderboard-card-tap.png.

Tablet testing exposed another test assumption: the app intentionally caps content at 520 points, so requiring a card wider than 75% of the entire iPad screen is inappropriate. The test now uses the bounded content width. A tablet-only retry is running in workflow 45062367546; do not call that pending run passed. The iPhone native checks are confirmed passed.

Production source eb6e4c71995e8881d89b0a674192d93a7ec0b202 adds landscape safe-area left/right guards for Back and voice controls. It built as 1.0.2 (450618427741) in successful upload workflow 45061842774. Actual IPA artifact 14770060337 was independently inspected: final header/card/CSS match source, contentInset is never, native background is dark and status icons use light content. The final lateral guards are not a claim of completed physical-device rotation QA.

Apple activated build 450618427741 at 2026-11-22 19:43:53 UTC, IN_BETA_TESTING, via workflow 45062151574. Start Testing notified exactly one verified owner tester. Link: https://testflight.apple.com/join/4PTBzRTD. CI signer TFDLHVGQV9 belongs to upload run 45061842774; the ephemeral signing key was discarded with the runner. Preserve unrelated certificates. Interim build 450602710321 was also activated earlier; the final build supersedes it.

Owner checks: update to 450618427741, tap trophy/text/blank space/arrow on the rank card, review the stacked logo, verify background behind the status icons, and check rotation and return from a game. No public App Store release or main merge occurred.
