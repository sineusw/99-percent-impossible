/* Petty voice transport — Older Joe via ElevenLabs.
   v0.6.3: use an unlocked Web Audio context so delayed lines (especially
   post-ad outros on iPhone) can play even though they happen seconds after
   the user's original tap. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__olderJoePatched)return;

  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  const AC=window.AudioContext||window.webkitAudioContext;
  let ctx=null,source=null,seq=0;

  function getCtx(){
    if(!AC)return null;
    if(!ctx)ctx=new AC();
    return ctx;
  }
  async function unlock(){
    const c=getCtx();
    if(c&&c.state==='suspended'){try{await c.resume()}catch{}}
  }
  // Unlock once from real user interaction. After this, Web Audio can play
  // Petty's delayed ad outro without Safari treating it as autoplay.
  const unlockOnce=()=>{unlock();removeEventListener('pointerdown',unlockOnce,true);removeEventListener('touchstart',unlockOnce,true)};
  addEventListener('pointerdown',unlockOnce,true);
  addEventListener('touchstart',unlockOnce,true);

  function cleanup(){
    if(source){try{source.stop()}catch{}source=null}
  }

  async function joeSpeak(utterance,mySeq){
    try{
      utterance.onstart?.({type:'start'});
      const r=await fetch('/api/petty-voice',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:utterance.text||''})
      });
      if(!r.ok)throw new Error('voice '+r.status);
      const bytes=await r.arrayBuffer();
      if(mySeq!==seq)return;

      const c=getCtx();
      if(!c)throw new Error('Web Audio unavailable');
      if(c.state==='suspended')await c.resume();
      const buffer=await c.decodeAudioData(bytes.slice(0));
      if(mySeq!==seq)return;

      cleanup();
      source=c.createBufferSource();
      const gain=c.createGain();
      gain.gain.value=typeof utterance.volume==='number'?utterance.volume:1;
      source.buffer=buffer;
      source.connect(gain).connect(c.destination);
      await new Promise((resolve,reject)=>{
        source.onended=resolve;
        try{source.start(0)}catch(e){reject(e)}
      });
      if(mySeq===seq)utterance.onend?.({type:'end'});
      cleanup();
    }catch(err){
      cleanup();
      console.warn('Older Joe unavailable; falling back to device voice.',err);
      if(mySeq!==seq)return;
      try{nativeSpeak(utterance)}catch{utterance.onerror?.({type:'error'})}
    }
  }

  try{
    synth.speak=function(utterance){const mySeq=++seq;joeSpeak(utterance,mySeq)};
    synth.cancel=function(){seq++;cleanup();nativeCancel()};
    synth.__olderJoePatched=true;
    window.PETTY_VOICE_ENGINE='older-joe-elevenlabs-webaudio';
    window.unlockPettyVoice=unlock;
  }catch(err){
    console.warn('Could not install Older Joe voice transport.',err);
  }
})();
