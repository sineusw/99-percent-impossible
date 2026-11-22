# Home and leaderboard hierarchy polish

Owner approved four refinements after the visual refresh: shorter Home leaderboard card, rank-first emphasis, a compact leaderboard introduction, and a smaller voice picker beside the large logo.

The card now has a 104px minimum instead of 154px and no decorative footer. Its actual rank is 46px and precedes the smaller description. The logo remains large; header height reduces from 116px to 108px and voice control width from 144px to 126px (116px on narrow phones). The board hero is a compact single-line invitation with a smaller trophy; spacing before the player's position and standings is reduced. Existing semantic whole-card access, 44px touch controls, safe areas, real-only standings, scoring, audio and purchases are preserved.

Full JS/audio regression suite passed. Browser signed-out and explicitly named populated QA-fixture checks passed at 320/393/430px: no logo/voice overlap, no horizontal board overflow, no page errors, tab switching and empty Play navigation intact. Populated preview images are fixtures, not real standings.

Source be13de3 is being delivered as private TestFlight build 1.0.2 (450677823941), upload workflow 45067782394. Native layout workflow 45067785172 checks iPhone/iPad Home/game status safe areas and full-card left/middle/right taps. Delivery and native results are confirmed below. Draft PR41 targets the prior visual branch. No main merge or public release.

## Completed delivery

Upload workflow 45067782394 succeeded. IPA artifact 14772505525 was downloaded and all three changed UI assets exactly matched source be13de3285f38a32f65418acf9ec597b1ad96ac1. Activation workflow 45068230733, job 137349103215, confirmed testingStarted 450677823941 and externalBetaState IN_BETA_TESTING, with one verified owner notification recipient. TestFlight: https://testflight.apple.com/join/4PTBzRTD.

Native workflow 45067785172 succeeded. iPhone job 137347725741 and iPad job 137347725502 each passed Home/game edge-to-edge and whole-card left/middle/right tap checks. Actual iPhone screenshots from artifact 14772566721 were visually inspected: /workspace/output/polished-native-home.png and /workspace/output/polished-native-leaderboard.png. The simulator is signed out; authenticated Game Center behavior on physical devices is not established by these captures.
