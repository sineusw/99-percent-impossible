/* 99% IMPOSSIBLE — Petty first-welcome no-cancel adapter v1.0
   Preserves the gesture-warmed HTMLAudioElement by suppressing cancel() only during the first welcome call.
   Normal Petty speech/interruption/ad behavior remains unchanged. */
(()=>{
  'use strict';
  const pp=window.PettyPersonality;
  const synth=window.speechSynthesis;
  if(!pp||!synth||pp.speakWelcome)return;

  pp.speakWelcome=function(text,force=true,kind='welcome'){
    const realCancel=synth.cancel;
    try{
      synth.cancel=function(){};
      return pp.speak?.(text,force,kind) ?? false;
    } finally {
      synth.cancel=realCancel;
    }
  };
})();
