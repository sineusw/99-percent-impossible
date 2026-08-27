/* 99% IMPOSSIBLE — Petty first-welcome no-cancel adapter v1.2
   Preserves the gesture-warmed HTMLAudioElement through the entire cold-start fetch gap.
   Normal cancels are blocked only until the first welcome actually starts; ads may still override.
   Emits n99:petty-welcome-start when real welcome audio starts. */
(()=>{
  'use strict';
  const pp=window.PettyPersonality;
  const synth=window.speechSynthesis;
  if(!pp||!synth||pp.speakWelcome)return;
  window.__PETTY_WELCOME_STARTED=false;

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
        u.onstart=e=>{
          window.__PETTY_WELCOME_STARTED=true;
          try{window.dispatchEvent(new CustomEvent('n99:petty-welcome-start'))}catch{}
          restoreCancel();
          try{oldStart?.(e)}catch{}
        };
        u.onend=e=>{restoreCancel();try{oldEnd?.(e)}catch{}};
        u.onerror=e=>{restoreCancel();try{oldError?.(e)}catch{}};
      }
      return realSpeak.call(synth,u);
    };

    try{
      return pp.speak?.(text,force,kind) ?? false;
    } finally {
      synth.speak=realSpeak;
      setTimeout(restoreCancel,5000);
    }
  };
})();
