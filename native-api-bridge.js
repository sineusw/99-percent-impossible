/* 99% IMPOSSIBLE — native API bridge.
   Capacitor bundles run from a local origin, so selected server APIs are routed to the stable billing-branch API alias.
   v1.2 also records lightweight Petty transport evidence for physical-device acceptance. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_API_BRIDGE)return;
window.__N99_NATIVE_API_BRIDGE=true;
const API_ORIGIN='https://99-percent-impossible-git-monetization-9419e7-sineusws-projects.vercel.app';
const evidence=[];
const note=(type,data={})=>{
  const entry={t:new Date().toISOString(),type,...data};
  evidence.push(entry);if(evidence.length>40)evidence.shift();
  window.__N99VoiceEvidence={events:evidence,last:entry};
  try{localStorage.setItem('n99_voice_evidence',JSON.stringify(window.__N99VoiceEvidence))}catch{}
  console.log('[N99 PETTY EVIDENCE]',entry);
};

const nativeFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
  let rewritten=input,isPetty=false,original='';
  try{
    original=typeof input==='string'?input:input?.url||'';
    const path=new URL(original,location.href).pathname;
    isPetty=path==='/api/petty-voice';
    if(typeof rewritten==='string'&&rewritten.startsWith('/api/petty-voice')) rewritten=API_ORIGIN+rewritten;
    else if(rewritten instanceof Request&&path==='/api/petty-voice') rewritten=new Request(API_ORIGIN+'/api/petty-voice',rewritten);
  }catch{}
  if(isPetty)note('fetch:start',{original,resolved:typeof rewritten==='string'?rewritten:rewritten?.url||''});
  try{
    const response=await nativeFetch(rewritten,init);
    if(isPetty){
      note('fetch:response',{status:response.status,ok:response.ok,contentType:response.headers.get('content-type')||'',contentLength:response.headers.get('content-length')||''});
      try{
        response.clone().blob().then(blob=>note('fetch:blob',{size:blob.size,type:blob.type||''})).catch(err=>note('fetch:blob-error',{name:err?.name||'',message:err?.message||String(err)}));
      }catch(err){note('fetch:clone-error',{name:err?.name||'',message:err?.message||String(err)})}
    }
    return response;
  }catch(err){
    if(isPetty)note('fetch:error',{name:err?.name||'',message:err?.message||String(err)});
    throw err;
  }
};
window.N99_API_ORIGIN=API_ORIGIN;

const nativeCreateObjectURL=URL.createObjectURL?.bind(URL);
if(nativeCreateObjectURL){
  URL.createObjectURL=function(value){
    const url=nativeCreateObjectURL(value);
    if(value instanceof Blob&&/^audio\//i.test(value.type||''))note('object-url',{url,size:value.size,type:value.type||''});
    return url;
  };
}

const mediaProto=window.HTMLMediaElement?.prototype;
if(mediaProto&&!mediaProto.__n99PettyEvidencePatched){
  const nativePlay=mediaProto.play;
  mediaProto.play=function(...args){
    const src=this.currentSrc||this.src||'';
    const track=/^blob:/i.test(src);
    if(track)note('audio:play',{src});
    try{
      const p=nativePlay.apply(this,args);
      if(track&&p?.then)p.then(()=>note('audio:play:resolved',{src:this.currentSrc||src})).catch(err=>note('audio:play:rejected',{src:this.currentSrc||src,name:err?.name||'',message:err?.message||String(err)}));
      return p;
    }catch(err){
      if(track)note('audio:play:threw',{src,name:err?.name||'',message:err?.message||String(err)});
      throw err;
    }
  };
  mediaProto.__n99PettyEvidencePatched=true;
}
})();
