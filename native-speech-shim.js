/* 99% IMPOSSIBLE — native-only Web Speech compatibility shim.
   Petty's existing ElevenLabs HTMLAudio transport patches speechSynthesis.speak().
   Some Android WebViews omit Web Speech entirely, so provide only the tiny
   interface the existing transport expects. No device TTS is used. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_SPEECH_SHIM)return;
window.__N99_NATIVE_SPEECH_SHIM=true;

if(typeof window.SpeechSynthesisUtterance!=='function'){
  class N99SpeechSynthesisUtterance{
    constructor(text=''){
      this.text=String(text||'');
      this.lang='';this.rate=1;this.pitch=1;this.volume=1;this.voice=null;
      this.onstart=null;this.onend=null;this.onerror=null;
    }
  }
  try{window.SpeechSynthesisUtterance=N99SpeechSynthesisUtterance}catch{}
}

if(!window.speechSynthesis){
  const shim={
    __n99NativeShim:true,
    speaking:false,pending:false,paused:false,
    getVoices(){return[]},
    cancel(){},
    pause(){},
    resume(){},
    speak(utterance){
      console.error('[N99 PETTY VOICE] HTMLAudio transport was not installed before speak()',utterance?.text||'');
      try{utterance?.onerror?.({type:'error',engine:'native-speech-shim',error:new Error('Petty HTMLAudio transport unavailable')})}catch{}
    },
    addEventListener(){},removeEventListener(){},dispatchEvent(){return true}
  };
  try{window.speechSynthesis=shim}catch{
    try{Object.defineProperty(window,'speechSynthesis',{value:shim,configurable:true})}catch(err){console.error('[N99 PETTY VOICE] unable to install native speech shim',err)}
  }
}
})();
