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
