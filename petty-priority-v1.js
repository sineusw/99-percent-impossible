/* 99% IMPOSSIBLE — Petty speech priority guard v1
   Priority: ads > interruption complaint > normal commentary.
   Once an interruption complaint starts, gameplay taps cannot cut it off.
*/
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__pettyPriorityGuard)return;

  const baseSpeak=synth.speak.bind(synth);
  const baseCancel=synth.cancel.bind(synth);
  let protectedInterrupt=false;
  let guardTimer=0;

  const interruptTexts=()=>new Set(
    (window.PettyPersonality?.pools?.interrupt||[]).map(x=>String(x?.text||''))
  );

  function clearProtection(){
    protectedInterrupt=false;
    clearTimeout(guardTimer);
    guardTimer=0;
  }

  synth.speak=function(utterance){
    const text=String(utterance?.text||'');
    const isInterrupt=interruptTexts().has(text);
    const adHasPriority=!!window.__PETTY_AD_BANTER_LOCK;

    // While Petty is delivering an interruption complaint, normal gameplay
    // commentary is not allowed to replace it. Ads remain the only override.
    if(protectedInterrupt&&!adHasPriority&&!isInterrupt)return;

    if(isInterrupt&&!adHasPriority){
      protectedInterrupt=true;
      clearTimeout(guardTimer);
      guardTimer=setTimeout(clearProtection,12000);

      const oldEnd=utterance.onend;
      const oldError=utterance.onerror;
      utterance.onend=e=>{clearProtection();try{oldEnd?.(e)}catch{}};
      utterance.onerror=e=>{clearProtection();try{oldError?.(e)}catch{}};
    }

    return baseSpeak(utterance);
  };

  synth.cancel=function(){
    // Only an ad may cancel Petty once he has started complaining about
    // being interrupted. Player taps/normal result speech are ignored.
    if(protectedInterrupt&&!window.__PETTY_AD_BANTER_LOCK)return;
    if(window.__PETTY_AD_BANTER_LOCK)clearProtection();
    return baseCancel();
  };

  synth.__pettyPriorityGuard=true;
  window.PETTY_PRIORITY_ORDER='ads > interruption > normal';
})();