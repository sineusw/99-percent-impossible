// Perfect Stop — Adaptive Difficulty State Machine
// Locked behavior: precision hit advances, ordinary hit holds, miss resets.
(function(root){
  'use strict';

  const PRECISION_THRESHOLD = 0.90;
  const MAX_TIER = 8;

  const TierAction = Object.freeze({
    ADVANCE: 'ADVANCE',
    HOLD: 'HOLD',
    RESET: 'RESET'
  });

  const ComboAction = Object.freeze({
    CONTINUE: 'CONTINUE',
    PRESERVE: 'PRESERVE',
    RESET: 'RESET'
  });

  function evaluatePerfectStopAttempt({ hit, accuracy, currentTier, streakSaveTriggered=false }) {
    if (hit) {
      if (accuracy >= PRECISION_THRESHOLD) {
        return {
          nextTier: Math.min(currentTier + 1, MAX_TIER),
          tierAction: TierAction.ADVANCE,
          comboAction: ComboAction.CONTINUE
        };
      }
      return {
        nextTier: currentTier,
        tierAction: TierAction.HOLD,
        comboAction: ComboAction.CONTINUE
      };
    }

    return {
      nextTier: 1,
      tierAction: TierAction.RESET,
      comboAction: streakSaveTriggered ? ComboAction.PRESERVE : ComboAction.RESET
    };
  }

  const api={evaluatePerfectStopAttempt,PRECISION_THRESHOLD,MAX_TIER,TierAction,ComboAction};
  root.N99PerfectStopDifficulty=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
