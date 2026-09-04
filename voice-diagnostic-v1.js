/* 99% IMPOSSIBLE — temporary Android voice diagnostics v1. Remove after root cause is confirmed. */
(()=>{
'use strict';
if(window.__N99_VOICE_DIAG_INSTALLED)return;
window.__N99_VOICE_DIAG_INSTALLED=true;
const native=!!window.Capacitor?.isNativePlatform?.();
if(!native)return;
const events=[];
const push=(type,data={})=>{
  const entry={t:new Date().toISOString(),type,...data};
  events.push(entry);if(events.length>80)events.shift();
  window.__N99VoiceDiag={events,last:entry,speechSynthesis:!!window.speechSynthesis,href:location.href};
  console.log('[N99 VOICE DIAG]',entry);
};
push('boot',{speechSynthesis:!!window.speechSynthesis,userAgent:navigator.userAgent,href:location.href});

const nativeFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
  const raw=typeof input==='string'?input:input?.url||'';
  const isVoice=/\/api\/petty-voice|\/assets\/(?:petty|daisy|mick)-audio\//i.test(raw);
  if(!isVoice)return nativeFetch(input,init);
  let resolved=raw;
  try{resolved=new URL(raw,location.href).href}catch{}
  push('fetch:start',{raw,resolved,method:init?.method||'GET'});
  try{
    const res=await nativeFetch(input,init);
    push('fetch:response',{raw,resolved,status:res.status,ok:res.ok,type:res.type});
    return res;
  }catch(err){
    push('fetch:error',{raw,resolved,name:err?.name||'',message:err?.message||String(err)});
    throw err;
  }
};

const NativeAudio=window.Audio;
if(typeof NativeAudio==='function'){
  function DiagnosticAudio(src){
    const a=new NativeAudio(src);
    if(src&&/\/assets\/(?:petty|daisy|mick)-audio\//i.test(String(src))){
      let resolved=String(src);try{resolved=new URL(String(src),location.href).href}catch{}
      push('audio:create',{src:String(src),resolved});
      a.addEventListener('error',()=>push('audio:error',{src:String(src),resolved,currentSrc:a.currentSrc||'',code:a.error?.code||0,message:a.error?.message||''}));
      const nativePlay=a.play.bind(a);
      a.play=function(){
        push('audio:play',{src:String(src),resolved,currentSrc:a.currentSrc||''});
        try{
          const p=nativePlay();
          p?.then?.(()=>push('audio:play:resolved',{src:String(src),resolved,currentSrc:a.currentSrc||''})).catch?.(err=>push('audio:play:rejected',{src:String(src),resolved,name:err?.name||'',message:err?.message||String(err),currentSrc:a.currentSrc||''}));
          return p;
        }catch(err){push('audio:play:threw',{src:String(src),resolved,name:err?.name||'',message:err?.message||String(err)});throw err}
      };
    }
    return a;
  }
  DiagnosticAudio.prototype=NativeAudio.prototype;
  Object.setPrototypeOf(DiagnosticAudio,NativeAudio);
  window.Audio=DiagnosticAudio;
}

if(!window.speechSynthesis){
  push('fatal:speechSynthesis-unavailable');
  setTimeout(()=>{
    if(window.__N99_VOICE_DIAG_ALERTED)return;
    window.__N99_VOICE_DIAG_ALERTED=true;
    alert('VOICE DIAGNOSTIC\n\nspeechSynthesis: UNAVAILABLE\nlocation: '+location.href+'\n\nScreenshot this message for Chat.');
  },1200);
}
})();
