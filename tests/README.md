Run `npm install --prefix tests` and `npm test --prefix tests` with Node 20 or later.

The suite loads the production scripts in page order in Happy DOM and exercises synthetic touch/click events, result cancellation, and reaction input. It is a DOM regression suite, not a substitute for physical iPhone or WKWebView testing. Audio is muted and speech is stubbed.

Audio tests cover native endpoint routing, iOS CORS preflight, unrelated-origin rejection, audio response validation, cache reuse and retry after failure. They mock playback and the ElevenLabs API; they do not prove audible output on a device.

Integrity checks cover suspicious reaction exclusion, the legitimate 100 ms boundary, first-score versus improved PB sharing, synchronous result metadata, share payloads, and neutral visibilitychange/pagehide cancellation in all three modes.

Release regressions cover queued press timestamps, Perfect Stop frame independence, asynchronous cast ownership restoration, silent per-element SFX gesture initialization, delayed outcome playback, mute, and shipped cast phrase assets. Playback permission is mocked; audible hardware output still needs physical-device testing.

Audio-control regressions also verify that mute cancels protected complaints and pending welcomes, stops active gameplay SFX, and prevents muted or queued welcomes from speaking.

Run `npm test` from the repository root to include the cast asset availability check. After adding or generating voice MP3s, run `node scripts/check-cast-audio.mjs --write` to update the shipped phrase IDs. Categories without any shipped audio fail the check; unavailable variants remain in the source library for later generation and are excluded from browser rotation.
