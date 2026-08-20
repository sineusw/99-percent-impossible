/* Petty voice transport: routes Petty speech through server-side ElevenLabs Older Joe.
   v0.7.3: cached preloads + proper cancel lifecycle so mute/unmute cannot strand Petty. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__olderJoePatched)return;

  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  let activeAudio=null,activeUrl=null,activeUtterance=null,seq=0;
  const cache=new Map();

  function cleanup(){
    if(activeAudio){try{activeAudio.pause()}catch{} activeAudio=null}
    if(activeUrl){try{URL.revokeObjectURL(activeUrl)}catch{} activeUrl=null}
  }

  async function fetchVoice(text){
    if(cache.has(text))return cache.get(text);
    const p=fetch('/api/petty-voice',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})
    }).then(async r=>{if(!r.ok)throw new Error('voice '+r.status);return r.blob()});
    cache.set(text,p);
    try{return await p}catch(e){cache.delete(text);throw e}
  }

  window.preloadPettyVoice=text=>{
    if(!text)return Promise.resolve(false);
    return fetchVoice(String(text)).then(()=>true).catch(()=>false);
  };

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