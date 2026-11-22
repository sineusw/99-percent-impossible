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

Headless Chromium at widths 320, 393 and 430 confirmed no horizontal overflow or page errors. Clicking all three mode illustrations opened the correct existing game; leaderboard and voice picker also opened. At 393px, the first game card moved from y=495 in the initial fallback-font prototype to y=369 with the bundled fonts and corrected privacy/footer order. This comparison is local render evidence, not an iPhone performance measurement.

Local screenshots: /workspace/output/home-redesign-393.png, /workspace/output/home-redesign-320.png, /workspace/output/home-redesign-430.png and /workspace/output/home-redesign-goals.png. Screenshots use a mocked signed-in but unranked Game Center bridge; no real network standings are asserted. Actual iPhone touch/layout remains to be verified in the next beta.

No public App Store release or main merge is part of this work. Public web gameplay remains on its separate production source.
