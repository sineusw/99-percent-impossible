/* 99% IMPOSSIBLE — Petty first-welcome no-cancel adapter v1.1
   Preserves the gesture-warmed HTMLAudioElement through the entire cold-start fetch gap.
   Normal cancels are blocked only until the first welcome actually starts; ads may still override. */
(()=>{
  'use strict';
  const pp=window.PettyPersonality;
  const synth=window.speechSynthesis;
  if(!pp||!synth||pp.speakWelcome)return;

  pp.speakWelcome=function(text,force=true,kind='welcome'){
    const realCancel=synth.cancel;
    const realSpeak=synth.speak;
    let cancelRestored=false;

    const restoreCancel=()=>{
      if(cancelRestored)return;
      cancelRestored=true;
      if(synth.cancel===guardedCancel)synth.cancel=realCancel;
    };

    function guardedCancel(){
      // Ads retain highest priority. Everything else must not kill the
      // gesture-warmed Petty element before the first real welcome starts.
      if(window.__PETTY_AD_BANTER_LOCK){
        restoreCancel();
        return realCancel.call(synth);
      }
      console.log('[PETTY WELCOME] cancel suppressed until welcome onstart');
    }

    synth.cancel=guardedCancel;
    synth.speak=function(u){
      const oldStart=u?.onstart;
      const oldEnd=u?.onend;
      const oldError=u?.onerror;
      if(u){
        u.onstart=e=>{restoreCancel();try{oldStart?.(e)}catch{}};
        u.onend=e=>{restoreCancel();try{oldEnd?.(e)}catch{}};
        u.onerror=e=>{restoreCancel();try{oldError?.(e)}catch{}};
      }
      return realSpeak.call(synth,u);
    };

    try{
      return pp.speak?.(text,force,kind) ?? false;
    } finally {
      // Only the speak interception is synchronous. Keep cancel guarded until
      // the utterance's onstart/onend/onerror, with a hard fallback timeout.
      synth.speak=realSpeak;
      setTimeout(restoreCancel,5000);
    }
  };
})();
