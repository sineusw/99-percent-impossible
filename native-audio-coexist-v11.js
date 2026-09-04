/* 99% IMPOSSIBLE — Android voice/SFX coexistence patch v1.0
   v10 proved Petty voice works once the native speech shim activates the existing
   ElevenLabs HTMLAudio transport, but that also activated the old continuous
   silent-loop unlock hack. On Android the WebView is already configured with
   setMediaPlaybackRequiresUserGesture(false), so keep Petty's transport but
   disable only the continuous silent loop and prime the normal SFX bank from
   the first real gesture. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_AUDIO_COEXIST)return;
window.__N99_NATIVE_AUDIO_COEXIST=true;

// The legacy Petty transport's gesture-unlock helper starts a looping silent MP3.
// That helper is unnecessary in our Android shell and was the only new audio path
// activated in v10. Preserve the Petty fetch/blob/play engine; suppress only this loop.
if(typeof window.unlockPettyAudio==='function'){
  window.__N99_LEGACY_UNLOCK_PETTY_AUDIO=window.unlockPettyAudio;
  window.unlockPettyAudio=()=>true;
}

let primed=false;
function primeSfx(){
  if(primed)return;
  primed=true;
  try{window.N99SFX?.prime?.()}catch(err){console.error('[N99 SFX] prime failed',err)}
}
document.addEventListener('pointerdown',primeSfx,{capture:true,once:true});
document.addEventListener('touchstart',primeSfx,{capture:true,once:true,passive:true});
})();
