# Home visual refresh: November 22, 2026

The owner requested a substantially more visual, appealing Home screen based on the existing iPhone screenshot.

## Design

- Compact 99% wordmark and a smaller, clearly accessible selected-voice control.
- Original Petty headline retained, with a smaller prelude and bold verdict.
- One compact weekly-rank strip with a trophy illustration, actual rank/status and a leaderboard action; no fictional rankings or player counts.
- Three visual mode cards with original inline vector art: timing dial, precision track and reaction bolt. Each retains the original game button and score rules.
- Daily challenge panel with a genuine 0/3–3/3 progress ring, three completion checkpoints, native expandable goals and earned titles. Completion text appears only after all three goals are actually complete.
- Privacy access remains a 44px-minimum footer button. Sound, Colors, cast selection, StoreKit and Game Center logic remain in use.
- Paid palette accent variables still color the logo, mode illustrations and daily ring.
- The new CSS is scoped to the active Home screen. It adds no animation loop, forced layout measurements or artwork downloads.

## Reliable typography

The original Teko (600/700) and Chakra Petch (500/600/700) families now ship as local fonts. Google Fonts CSS/remote-font dependencies were removed from index.html. Font files were fetched from the already used official fonts.gstatic.com family URLs; both upstream SIL Open Font License files are included under assets/fonts. The two primary font weights are preloaded locally. This preserves the actual design offline instead of falling back to differently sized fonts. The privacy wording distinguishes bundled newer native fonts from older/web versions.

## Verification

Full gameplay, commerce, consent, real-character audio, rank cadence, live bridge, daily-goal persistence, cache and local metrics regressions passed. The daily test now also checks all three completed checkpoints and the completed ring.

Headless Chromium at widths 320, 393 and 430 confirmed no horizontal overflow or page errors. Clicking all three mode illustrations opened the correct existing game; leaderboard and voice picker also opened. At 393px, the first game card moved from y=495 in the initial fallback-font prototype to y=372 in the final styling with the bundled fonts and corrected privacy/footer order. This comparison is local render evidence, not an iPhone performance measurement.

Local screenshots: /workspace/output/home-redesign-393.png, /workspace/output/home-redesign-320.png, /workspace/output/home-redesign-430.png and /workspace/output/home-redesign-goals.png. Screenshots use a mocked signed-in but unranked Game Center bridge; no real network standings are asserted. Actual iPhone touch/layout remains to be verified in the next beta.

No public App Store release or main merge is part of this work. Public web gameplay remains on its separate production source.


## Export and additional render evidence

Code source fd6a16a94d2cc4ef2a179f449d3171adcd791fe5 built as 1.0.2 (450580327671), upload workflow 45058032767. Signed archive and export checks passed. Downloaded artifact 14768322630 was inspected independently: the illustrated index, Home stylesheet, local font CSS and primary fonts, both font licenses, daily/rank markup and privacy policy match source. The Game Center plugin remains registered; sample ranks remain disabled.

A second browser check completed the three goals using labeled local result fixtures: the ring reached zero remaining dash offset, all three checkpoints changed to complete, and the earned-title state appeared. Changing palette CSS variables changed illustration accents. The browser loaded the bundled Chakra Petch/Teko faces with zero Google Fonts network requests. These are UI/test-fixture observations, not real account purchases or global score submissions.

Privacy-only commit 31ccd432dfb7fa3d3e684b1d9690a33c4e07a427 deployed READY as dpl_8H9DNa3twWj2wUsoEXKNra2a57MA, preserving the existing public gameplay source while clarifying bundled fonts versus older/web font requests. Exact TestFlight activation is tracked in workflow 45058115535 and must be read before declaring availability.

## Active TestFlight build

Apple activated 1.0.2 (450580327671) at 2026-11-22 19:05:35 UTC, returning IN_BETA_TESTING in workflow 45058115535. Start Testing notified exactly one verified owner tester. Link: https://testflight.apple.com/join/4PTBzRTD. The ephemeral CI signer is 822RCTSZ7W, from successful upload run 45058032767; its temporary private key was discarded with that runner. Do not retire unrelated signing assets.

Owner check: update to this exact build, inspect Home, open each mode, view leaderboard and goals, change voice/palette, and verify footer privacy access. Automated/browser/export checks passed; physical iPhone appearance and touch behavior remain for owner testing.
