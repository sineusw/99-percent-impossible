# Petty Static Audio Migration — Overnight Notes

## Scope audited

Active Petty speech currently comes from:

- `petty.js` — result commentary, praise, PB, streak, perfect, generic, and base interruption pools.
- `petty-interrupt-lines-v091.js` — production interruption pool override (24 lines).
- `petty-v6.js` — time/day/holiday greetings and return greetings.
- `ads.js` — before-ad and after-ad Petty banter.

Legacy `petty-v3.js`, `petty-v4.js`, `petty-v5.js`, and `petty-slang-v1.js` remain in the repository but are not loaded by the current `index.html`, so they are intentionally excluded from the production audio inventory.

## Voice issue found

The existing `/api/petty-voice` runtime path depends on ElevenLabs on every uncached phrase. Vercel runtime error history contains ElevenLabs HTTP 400 failures for the selected Older Joe voice with `free_users_not_allowed` / Creator-tier-required messaging. This makes runtime generation a reliability and latency risk in addition to a cost risk.

## Migration implementation

Created `petty-static-audio.js` and wired it in place of `olderjoe.js` on the migration branch.

Playback order is now:

1. Static `/assets/petty-audio/<fnv1a-hash>.mp3`.
2. Existing `/api/petty-voice` route while migration is incomplete.
3. Device British voice fallback if both audio paths fail.

The transport preserves `speechSynthesis.speak/cancel` semantics, `onstart/onend`, Petty's mute control, interruption lifecycle, and ad/interruption priority wrappers.

Created `scripts/generate-petty-audio.mjs`, a one-time source-of-truth generator that:

- extracts active spoken lines from the four production sources above;
- deduplicates identical phrases;
- uses the same Older Joe voice ID and ElevenLabs settings as the current API route;
- skips MP3s that already exist, so reruns do not regenerate completed clips;
- writes static MP3s plus `assets/petty-audio/manifest.json`.

## Remaining audio-materialization constraint

This ChatGPT connector can edit UTF-8 GitHub files but cannot upload binary MP3 payloads, and no ElevenLabs generation connector is currently available. The generator is therefore committed and ready, but the actual MP3 batch cannot be materialized into GitHub from this tool session. Do not delete `/api/petty-voice` yet; the static-first transport intentionally keeps it as a temporary fallback.

## Gameplay issue found and patched

Core `app.js` still scores Reaction Test through `play.onpointerup`, meaning reaction time includes finger-release delay. Timer and Perfect Stop already score physical press through the fairness patch.

Created and wired `reaction-press-input-v1.js` so Reaction now scores on `touchstart` for touch and `pointerdown` for mouse/stylus, with duplicate-event/release suppression and the existing TOO EARLY behavior preserved.

## Safety / rollout

All work is isolated on branch `petty-static-audio-migration`; `main` was not changed directly. Static audio playback is backward-compatible while the MP3 directory is empty because it falls through to the existing voice route and then device voice.
