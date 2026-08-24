/* 99% IMPOSSIBLE — Petty static-first audio transport v1
   Prefers checked-in /assets/petty-audio/*.mp3 clips, falls back to the
   existing server voice route while migration is incomplete, then finally
   falls back to the device voice. Preserves speechSynthesis lifecycle so
   Petty priority/interruption logic keeps working. */
(()=>{
  const synth=window.speechSynthesis;
  if(!synth||synth.__pettyStaticAudioPatched)return;

  const fallbackSpeak=synth.speak.bind(synth);
  const fallbackCancel=synth.cancel.bind(synth);
  let activeAudio=null,activeUtterance=null,activeController=null,seq=0;
  const blobCache=new Map();
  const existenceCache=new Map();

  function hashText(text){
    let h=0x811c9dc5;
    for(let i=0;i<text.length;i++){
      h^=text.charCodeAt(i);
      h=Math.imul(h,0x01000193);
    }
    return (h>>>0).toString(16).padStart(8,'0');
  }

  function pathFor(text){return '/assets/petty-audio/'+hashText(String(text||'').trim())+'.mp3'}

  function cleanup(){
    if(activeController){try{activeController.abort()}catch{} activeController=null}
    if(activeAudio){
      try{activeAudio.pause()}catch{}
      activeAudio.onended=activeAudio.onerror=null;
      activeAudio=null;
    }
  }

  async function fetchStatic(text,signal){
    const path=pathFor(text);
    if(existenceCache.get(path)===false)throw new Error('static-miss');
    if(blobCache.has(path))return blobCache.get(path);
    const p=fetch(path,{cache:'force-cache',signal}).then(async r=>{
      if(!r.ok){existenceCache.set(path,false);throw new Error('static '+r.status)}
      existenceCache.set(path,true);
      return r.blob();
    });
    blobCache.set(path,p);
    try{return await p}catch(e){blobCache.delete(path);throw e}
  }

  async function fetchRuntimeFallback(text,signal){
    const r=await fetch('/api/petty-voice',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({text}),
      signal
    });
    if(!r.ok)throw new Error('voice '+r.status);
    return r.blob();
  }

  async function loadVoice(text,signal){
    try{return {blob:await fetchStatic(text,signal),engine:'static'}}catch(err){
      if(err?.name==='AbortError')throw err;
      return {blob:await fetchRuntimeFallback(text,signal),engine:'runtime'};
    }
  }

  window.preloadPettyVoice=text=>{
    const t=String(text||'').trim();
    if(!t)return Promise.resolve(false);
    return fetchStatic(t).then(()=>true).catch(()=>false);
  };
  window.PettyStaticAudio={hashText,pathFor};

  async function speakAudio(utterance,mySeq){
    const text=String(utterance?.text||'').trim();
    activeUtterance=utterance;
    if(!text){utterance.onend?.({type:'end'});activeUtterance=null;return}
    const controller=new AbortController();
    activeController=controller;
    try{
      const loaded=await loadVoice(text,controller.signal);
      if(mySeq!==seq)return;
      if(activeController===controller)activeController=null;
      const url=URL.createObjectURL(loaded.blob);
      const a=new Audio(url);
      activeAudio=a;
      a.volume=typeof utterance.volume==='number'?utterance.volume:1;
      a.preload='auto';
      a.onplay=()=>{try{utterance.onstart?.({type:'start',engine:loaded.engine})}catch{}};
      await a.play();
      await new Promise((resolve,reject)=>{a.onended=resolve;a.onerror=reject});
      URL.revokeObjectURL(url);
      if(mySeq===seq)utterance.onend?.({type:'end',engine:loaded.engine});
      if(activeUtterance===utterance)activeUtterance=null;
      if(activeAudio===a)activeAudio=null;
    }catch(err){
      if(mySeq!==seq||err?.name==='AbortError')return;
      cleanup();
      if(activeUtterance===utterance)activeUtterance=null;
      console.warn('Petty static/runtime audio unavailable; falling back to device voice.',err);
      try{fallbackSpeak(utterance)}catch{utterance.onerror?.({type:'error'})}
    }
  }

  synth.speak=function(utterance){const mySeq=++seq;speakAudio(utterance,mySeq)};
  synth.cancel=function(){
    seq++;
    const u=activeUtterance;
    activeUtterance=null;
    cleanup();
    try{fallbackCancel()}catch{}
    try{u?.onend?.({type:'end',cancelled:true})}catch{}
  };
  synth.__pettyStaticAudioPatched=true;
  window.PETTY_VOICE_ENGINE='static-first';
})();
