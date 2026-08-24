# 99% IMPOSSIBLE — v0.10.1 Council Device Test Matrix

## Part A — code verification

### Reaction timestamp normalizer

`reaction-next.js` uses `performance.now()` for GO and normalizes a supplied press timestamp before scoring.

The `raw > 1e12` check is a heuristic for detecting epoch-style timestamps because `performance.now()` should remain far smaller than Unix-epoch milliseconds. It is not a formal guarantee of clock-origin compatibility, so device logging remains part of the acceptance test.

### Double-tap claim guard

Current production code in `ads.js`:

```js
document.addEventListener('click',e=>{
  if(!e.target?.matches?.('#retry,#close'))return;
  if(adOpen||adBoundaryClaimed||claimInProgress){
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  claimInProgress=true;
  updateDue();
  queueMicrotask(()=>{
    claimInProgress=false;
    tryOpenPendingAd();
  });
},true);
```

The unlock is a **microtask** (`queueMicrotask`), not `setTimeout(0)`.

The first Retry/Close click sets `claimInProgress=true` synchronously in capture phase. Normal handlers for that same click then finish in the same task. A second independent user click cannot dispatch before the task/microtask checkpoint. Any synchronous re-entrant click dispatched inside that same task is also rejected because `claimInProgress` is already true. The microtask then clears the transient lock and reruns the single ad gate from fresh state.

## Part B — device matrix

Run all 15 on iPhone Safari first, then Android Chrome. Do not stop at the first failure.

### Reaction audio
1. START sound audible on first attempt.
2. WAIT phase silent; no tick/hum.
3. GO sound audible.
4. Physical tap confirmation audible.
5. Result/win/fail sound audible after scoring.
6. TOO EARLY visual + audio works before GO.
7. 15+ rapid retries; AudioContext never goes silent or visibly stalls.
8. Finger-down to response feels immediate.

### Reaction timing
9. Record 10 attempts. Check no negatives, no implausible sub-50ms values, score consistency, and raw event timestamp behavior where available.

### Ads — core safety
10. Force eligibility, rapid Retry as result closes; never cover a live attempt.
11. Near-miss then immediate Retry during/after reveal; never cover suspense/live attempt.
12. Let one ad complete; gameplay and game audio recover afterward.
13. Background mid-attempt, return; no foreground ad, attempt intact or cleanly reset.

### Ads — edge cases
14. Background during Petty pre-ad banter; overlay clears, boundary releases, one pending ad remains, and foreground does not auto-open it.
15. Double-tap Retry at boundary claim; exactly one path wins. Never both, never neither.

## Reporting format

For each browser:

```text
1 PASS
2 PASS
3 FAIL — <one-line observation>
...
9 PASS — raw event.timeStamp samples: <values if available>; results: <10 ms values>
...
14 PASS/FAIL — <details>
15 PASS/FAIL — <details>
```

If all 15 pass on both browsers, old PRs #5/#6/#7 can be closed as superseded and v0.10.1 can be treated as stable.