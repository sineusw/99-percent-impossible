/* Petty voice transport: routes existing Petty speech through server-side ElevenLabs Older Joe. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__olderJoePatched)return;

  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  let activeAudio=null,activeUrl=null,seq=0;

  function cleanup(){
    if(activeAudio){try{activeAudio.pause()}catch{} activeAudio=null}
    if(activeUrl){try{URL.revokeObjectURL(activeUrl)}catch{} activeUrl=null}
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
      const blob=await r.blob();
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
    window.PETTY_VOICE_ENGINE='older-joe-elevenlabs';
  }catch(err){
    console.warn('Could not install Older Joe voice transport.',err);
  }
})();
