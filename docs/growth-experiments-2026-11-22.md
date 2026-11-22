# Daily improvement work: November 22, 2026

Goal: improve enjoyable replayability, retention and sustainable net profit. These changes are hypotheses with verified functional behavior, not proven increases in revenue.

## Current baseline and data gaps

- Live iPhone Game Center beta: 1.0.2 (450508891281), confirmed IN_BETA_TESTING. Public website is a separate older gameplay deployment; do not promote the native feature branch to it.
- No verified population-wide D1/D7 retention, payer conversion, ad revenue, fill rate, eCPM or ElevenLabs cost report is accessible in this session. No financial forecast is asserted.
- Public app-ads.txt returns HTTP 200, contains the correct publisher record, and matches the App Store developer domain. Actual AdMob account verification/app readiness has not been independently read; public HTTP checks do not establish approval.
- Live Game Center cross-device syncing and cast rank reactions still need the owner's real-device test.

## Implemented beta experiments

### Daily skill goals and permanent progress

Three achievable precision goals (one per game), rotating on the device's local calendar date. Day choices rotate between Timer ±50/35/20ms, Stop ≥90/93/95%, and valid Reaction ≤350/320/300ms. Goals are identical for the same local date. They do not change gameplay difficulty or rank scores. Suspicious/nonfinite/false-start results do not complete goals. Each goal/day counts once. Completing all three earns one permanent challenge day; titles unlock at 1, 3, 7, 14 and 30 completed days. Missing days removes no earned progress. Goals are not cloud-synced or tamper-resistant; there are no monetary rewards or paid advantages.

Hypothesis: a short concrete goal across all three games improves meaningful return visits and variety. Validate with challenge completion, next-day/seven-day return cohorts and qualitative feedback when actual aggregate measurement is available. Local-only records cannot establish population retention.

### Ad spacing

Normal interstitial eligibility retains existing 5-round/7-round streak-aware rules and adds a 90-second minimum from session start and from the last attempted ad. Test-query mode still bypasses time spacing for QA; the native beta uses official Google test units. Consent and verified Rage Pass remain authoritative. No live pricing or ad-unit IDs change.

Hypothesis: preventing rapid round-count-triggered ads reduces frustrating interruptions and increases long-term value. This could reduce immediate impressions; net revenue impact must be measured. Compare ad frequency, sessions completed, genuine post-ad return behavior and revenue per active user over a meaningful sample. Do not call backgrounding during an ad a proven ad-caused quit.

### Voice cost and startup

Confirmed waste: launch preloaded one randomly picked welcome, while the first tap selected another. The welcome now picks once on first eligible interaction and preloads only that same line after the input handler. Muted launches generate none. A bounded local Cache Storage cache reuses validated generated voice audio across launches (24 short clips, each at most 256KiB, seven-day validity); unsupported/restricted storage falls back to the existing network transport. Cached audio contains no player identity. Petty's session memory cache is now bounded to 40 entries. Real voices and caption matching are preserved.

Functional evidence: tests confirm zero welcome requests at startup, one request for the exact spoken line after pointer/touch input, cross-runtime cache reuse, per-character isolation, expiry, bounded entries, invalid-audio rejection and fallback on storage failure. Actual provider savings depend on usage/cache support and are not estimated here.

### Local measurement

New local-only counters retain at most 30 local calendar days: sessions, results, valid results, personal bests, perfects, completed daily goals/days and ad attempts/show/dismiss/failure/background events. Results are deduplicated by object identity; no raw scores, account IDs or player names are retained. Writes are coalesced off input handlers and flushed on background. No analytics network requests are added. `N99Metrics.summary()` exposes these device-only aggregates for diagnostics, not revenue data. Privacy policy documents local counters/progress/audio caching.

## Validation

Full existing gameplay, native monetization/consent, catalog/restore, audio, layout, share-integrity and leaderboard regressions passed. New tests cover daily rollover/persistence/no duplicate awards, suspicious-score exclusion, same-game launch buttons, first-session/inter-ad time floors, audio cache lifecycle and exact welcome generation, and local metrics isolation. Headless Chromium at 393×852 found no page errors or horizontal overflow; the daily Reaction Play button opened the actual existing Reaction game. Screenshots: /workspace/output/daily-progress-home.png and /workspace/output/daily-progress-goals.png. These are local UI checks, not physical-device or real-revenue evidence.

## Next opportunities, prioritized

1. Finish real-device live leaderboard and Apple purchase/restore QA, and establish actual AdMob verification. Existing release blockers precede expansion.
2. Add privacy-conscious aggregate measurement with a clear data plan when an appropriate existing backend/account is available; measure retention and ad-related exits before changing monetization further.
3. Test first-session tutorial clarity and daily-goal difficulty. Consider optional cosmetic-only rewarded ads only after an actual configured rewarded unit and defined reward exist; never invent an ad unit or award competitive advantages.

Public release remains gated. Preserve user data and the existing Apple products. No public App Store submission or main merge is authorized by this experiment log alone.

## Signed beta export and privacy publication

Code source 0b7943b86c9c5755f566fa8d3d788092b37448f8 built as 1.0.2 (450553010361) in successful upload workflow 45055301036. Archive/export/signing checks passed. Downloaded artifact 14766898791 was independently inspected: daily JS/CSS, local metrics, real-voice cache, ad spacing, welcome transport, live leaderboard and privacy policy match reviewed source; the Game Center bridge remains registered and sample-rank mode is false. Apple activation is tracked in workflow 45055427271; availability must be confirmed from its actual returned state.

Privacy-only production commit f3ce39dd18fe04d18220c2c6f7998ef74689eaa2 (based on the previously live 2d2478a) deployed READY as dpl_Fb9LpUvHqLC62dqBNv8ULA4PbQUb. Public privacy text matches that source. Public homepage and app-ads.txt bytes still match the prior gameplay deployment. No native gameplay branch was deployed to the website.

Measurement limits: the current local `sessions` counter counts page/app-view loads, not every foreground return. Local rounds/daily-goal events can indicate activity on a device, but are not population retention or verified purchase/ad proceeds. `adInterruptedExit` records app backgrounding while an ad boundary is open; it does not establish why the player left. Net-profit evaluation needs actual ad proceeds + net Apple purchase proceeds − actual voice/hosting/acquisition costs. Do not substitute predicted eCPM, nominal pack prices or mock test counts for those inputs.
