# Home and leaderboard hierarchy polish

Owner approved four refinements after the visual refresh: shorter Home leaderboard card, rank-first emphasis, a compact leaderboard introduction, and a smaller voice picker beside the large logo.

The card now has a 104px minimum instead of 154px and no decorative footer. Its actual rank is 46px and precedes the smaller description. The logo remains large; header height reduces from 116px to 108px and voice control width from 144px to 126px (116px on narrow phones). The board hero is a compact single-line invitation with a smaller trophy; spacing before the player's position and standings is reduced. Existing semantic whole-card access, 44px touch controls, safe areas, real-only standings, scoring, audio and purchases are preserved.

Full JS/audio regression suite passed. Browser signed-out and explicitly named populated QA-fixture checks passed at 320/393/430px: no logo/voice overlap, no horizontal board overflow, no page errors, tab switching and empty Play navigation intact. Populated preview images are fixtures, not real standings.

Source be13de3 is being delivered as private TestFlight build 1.0.2 (450677823941), upload workflow 45067782394. Native layout workflow 45067785172 checks iPhone/iPad Home/game status safe areas and full-card left/middle/right taps. Delivery and native results are pending; do not infer availability from upload alone. Draft PR41 targets the prior visual branch. No main merge or public release.
