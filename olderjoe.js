/* Petty voice transport: routes Petty speech through server-side ElevenLabs Older Joe.
   v0.7.6: synchronous first-gesture HTMLAudio unlock for iPhone/Android welcome. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__olderJoePatched)return;

  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  let activeAudio=null,activeUrl=null,activeUtterance=null,seq=0;
  const cache=new Map();
  const readyBlobs=new Map();

  // Tiny silent WAV. We use this only to unlock one dedicated media element during
  // the first genuine user gesture if the real welcome MP3 has not finished loading.
  const SILENT_WAV='data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACA';
  const welcomeAudio=new Audio();
  welcomeAudio.preload='auto';
  welcomeAudio.setAttribute('playsinline','');
  let welcomeUrl=null,welcomeUnlocked=false;

  function cleanup(){
    if(activeAudio){try{activeAudio.pause()}catch{} activeAudio=null}
    if(activeUrl){try{URL.revokeObjectURL(activeUrl)}catch{} activeUrl=null}
  }
  function cleanupWelcomeUrl(){
    if(welcomeUrl){try{URL.revokeObjectURL(welcomeUrl)}catch{} welcomeUrl=null}
  }

  async function fetchVoice(text){
    text=String(text||'');
    if(readyBlobs.has(text))return readyBlobs.get(text);
    if(cache.has(text))return cache.get(text);
    const p=fetch('/api/petty-voice',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})
    }).then(async r=>{
      if(!r.ok)throw new Error('voice '+r.status);
      const blob=await r.blob();
      readyBlobs.set(text,blob);
      return blob;
    });
    cache.set(text,p);
    try{return await p}catch(e){cache.delete(text);readyBlobs.delete(text);throw e}
  }

  window.preloadPettyVoice=text=>{
    if(!text)return Promise.resolve(false);
    return fetchVoice(String(text)).then(()=>true).catch(()=>false);
  };

  function playWelcomeBlob(blob){
    try{
      cleanupWelcomeUrl();
      welcomeUrl=URL.createObjectURL(blob);
      welcomeAudio.src=welcomeUrl;
      welcomeAudio.currentTime=0;
      const p=welcomeAudio.play();
      p?.catch?.(err=>console.warn('Petty welcome playback blocked.',err));
      return true;
    }catch(err){
      console.warn('Petty welcome playback failed.',err);
      return false;
    }
  }

  // Must be called directly inside pointerdown/click. If the MP3 is already cached,
  // .play() happens synchronously in this same gesture. If it is still loading, we
  // synchronously unlock this exact <audio> element with silence, then reuse the
  // unlocked element as soon as the MP3 arrives. No await/promise occurs before the
  // gesture-time play() call and no device TTS fallback is used for the welcome.
  window.playPettyVoiceWhenReady=text=>{
    text=String(text||'');
    if(!text)return false;
    const ready=readyBlobs.get(text);
    if(ready)return playWelcomeBlob(ready);
    try{
      welcomeAudio.src=SILENT_WAV;
      welcomeAudio.currentTime=0;
      const unlock=welcomeAudio.play();
      welcomeUnlocked=true;
      unlock?.catch?.(()=>{});
    }catch{}
    fetchVoice(text).then(blob=>{
      // Reusing the gesture-unlocked media element is the Safari-safe fallback when
      // the network response was not ready at first touch.
      if(welcomeUnlocked)playWelcomeBlob(blob);
    }).catch(err=>console.warn('Petty welcome preload failed.',err));
    return true;
  };

  window.playPreloadedPettyVoice=text=>{
    text=String(text||'');
    const blob=readyBlobs.get(text);
    if(!blob)return false;
    return playWelcomeBlob(blob);
  };

  window.isPettyVoicePreloaded=text=>readyBlobs.has(String(text||''));

  async function joeSpeak(utterance,mySeq){
    activeUtterance=utterance;
    try{
      utterance.onstart?.({type:'start'});
      const blob=await fetchVoice(utterance.text||'');
      if(mySeq!==seq)return;
      cleanup();
      activeUrl=URL.createObjectURL(blob);
      activeAudio=new Audio(activeUrl);
      activeAudio.volume=typeof utterance.volume==='number'?utterance.volume:1;
      activeAudio.setAttribute('playsinline','');
      await activeAudio.play();
      await new Promise((resolve,reject)=>{
        activeAudio.onended=resolve;
        activeAudio.onerror=reject;
      });
      if(mySeq===seq)utterance.onend?.({type:'end'});
      if(activeUtterance===utterance)activeUtterance=null;
      cleanup();
    }catch(err){
      cleanup();
      if(activeUtterance===utterance)activeUtterance=null;
      console.warn('Older Joe unavailable; falling back to device voice.',err);
      if(mySeq!==seq)return;
      try{nativeSpeak(utterance)}catch{utterance.onerror?.({type:'error'})}
    }
  }

  try{
    synth.speak=function(utterance){const mySeq=++seq;joeSpeak(utterance,mySeq)};
    synth.cancel=function(){
      seq++;
      const u=activeUtterance;
      activeUtterance=null;
      cleanup();
      try{nativeCancel()}catch{}
      try{u?.onend?.({type:'end',cancelled:true})}catch{}
    };
    synth.__olderJoePatched=true;
    window.PETTY_VOICE_ENGINE='older-joe-elevenlabs';
  }catch(err){
    console.warn('Could not install Older Joe voice transport.',err);
  }
})();
