# Physical iPhone release gate

Current candidate: **1.0.1 / 433736456171**, app source `5fa7a83`. Use https://testflight.apple.com/join/4PTBzRTD . The owner confirmed this exact build is installed on the iPhone.

This first device candidate uses official Google TEST ads and Apple sandbox purchases. Production identifiers and a separate production build mode are implemented; real production fill/impressions remain a separate validation gate.

| Check | Expected result | Device result |
|---|---|---|
| Apple catalog | All six packs show Apple localized prices; an unavailable pack stays visible and disabled with retry. | **Owner-reported pass, November 14** |
| First launch / connectivity | Home becomes usable; applicable Google privacy form completes. If consent info fails, gameplay works and ads stay off. | Pending |
| Privacy choices | Home shows Ad Privacy or Privacy Choices; applicable choices can be reopened. Audio stops during any form and resumes normally afterwards. | Pending |
| Three games | Perfect Timer, Perfect Stop and Reaction Test start, score and retry; early reaction taps are rejected. | Pending |
| Voice / sound | Petty is free. Selected voice persists. Mute stops commentary and effects; no overlapping voices or speech beneath native forms/ads. | Pending |
| Interstitial | Before buying Rage Pass, complete 5–7 scored rounds/retries. A clearly marked TEST ad shows between rounds. Dismissal returns to one usable retry. | Pending |
| No-fill / background | Failed ad loads release retry. Background/resume never resumes gameplay beneath a presented ad or consent form. | Pending |
| Daisy / Mick purchases | Each Apple sandbox purchase unlocks and selects only its matching voice; both are audible. Cancellation leaves locked content locked. | Pending |
| Three palette purchases | Purchase Cyberpunk, Gold Only and Synthwave individually before Rage Pass; each changes colors and survives force quit/relaunch. | Pending |
| Rage Pass | Apple sandbox purchase unlocks all palettes and suppresses interstitials on subsequent retries. | Pending |
| Restore | Restore Apple Purchases restores verified ownership after app relaunch. Verify reinstall/restore on a test installation with local scores/preferences backed up or disposable. | Pending |
| Production ads | After the QA gate passes, validate a production-mode candidate on a physical phone and reconcile requests/impressions in AdMob. | Pending |

Record iPhone model, iOS version, tested build, region, connectivity, and pass/fail evidence. A simulator fixture purchase, successful SDK call, or TestFlight upload does not establish production commerce/ad serving. All six IAPs still require Apple production review/submission after release gates pass. Keep PR #33 draft/unmerged until device evidence and store/privacy requirements are complete.

Apple account checks/submission are currently blocked by HTTP 403 FORBIDDEN.REQUIRED_AGREEMENTS_MISSING_OR_EXPIRED (November 14). The account holder must identify, review and sign the required agreement. No terms have been accepted by this work.
