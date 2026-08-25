/* Petty voice transport: routes Petty speech through server-side ElevenLabs Older Joe.
   v0.7.5: cached preloads + guaranteed gesture-unlocked first Android welcome. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__olderJoePatched)return;

  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  let activeAudio=null,activeUrl=null,activeUtterance=null,seq=0;
  const cache=new Map();
  const readyBlobs=new Map();
  let welcomeCtx=null;

  function cleanup(){
    if(activeAudio){try{activeAudio.pause()}catch{} activeAudio=null}
    if(activeUrl){try{URL.revokeObjectURL(activeUrl)}catch{} activeUrl=null}
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

  // Called from the first real user gesture. Unlock a dedicated AudioContext now,
  // while browser user activation is definitely present. Once the already-started
  // fetch completes, decode/play the MP3 through that unlocked context. This avoids
  // both Android autoplay rejection and the robotic speechSynthesis fallback.
  window.playPettyVoiceWhenReady=text=>{
    text=String(text||'');
    if(!text)return false;
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return false;
      if(!welcomeCtx)welcomeCtx=new C();
      try{welcomeCtx.resume?.()}catch{}
      const ctx=welcomeCtx;
      fetchVoice(text).then(async blob=>{
        try{
          if(ctx.state==='suspended')await ctx.resume();
          const ab=await blob.arrayBuffer();
          const buffer=await ctx.decodeAudioData(ab.slice(0));
          const source=ctx.createBufferSource();
          source.buffer=buffer;
          source.connect(ctx.destination);
          source.start(0);
        }catch(err){console.warn('Petty welcome playback failed.',err)}
      }).catch(err=>console.warn('Petty welcome preload failed.',err));
      return true;
    }catch(err){
      console.warn('Could not unlock Petty welcome audio.',err);
      return false;
    }
  };

  // Retained for any already-buffered gesture-safe callers.
  window.playPreloadedPettyVoice=text=>{
    text=String(text||'');
    const blob=readyBlobs.get(text);
    if(!blob)return false;
    try{
      seq++;
      activeUtterance=null;
      cleanup();
      activeUrl=URL.createObjectURL(blob);
      activeAudio=new Audio(activeUrl);
      activeAudio.volume=1;
      const a=activeAudio;
      a.onended=a.onerror=()=>{if(activeAudio===a)cleanup()};
      const p=a.play();
      p?.catch?.(err=>{
        console.warn('Preloaded Petty playback blocked.',err);
        if(activeAudio===a)cleanup();
      });
      return true;
    }catch(err){
      console.warn('Preloaded Petty playback failed.',err);
      cleanup();
      return false;
    }
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
      // Critical: Petty core uses onend/onerror to clear its own speech lock.
      // A cancel must therefore finish the lifecycle too.
      try{u?.onend?.({type:'end',cancelled:true})}catch{}
    };
    synth.__olderJoePatched=true;
    window.PETTY_VOICE_ENGINE='older-joe-elevenlabs';
  }catch(err){
    console.warn('Could not install Older Joe voice transport.',err);
  }
})();