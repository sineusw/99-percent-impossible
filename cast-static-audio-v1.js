/* 99% IMPOSSIBLE — Daisy/Mick static HTMLAudio transport v1.3
   Daisy/Mick use pre-generated MP3 assets and no longer require the native
   speechSynthesis object just to expose direct HTMLAudio playback. */
(()=>{
'use strict';
if(window.N99CastStaticAudio)return;
const synth=window.speechSynthesis||null;
const priorSpeak=synth?.speak?.bind(synth)||null;
const priorCancel=synth?.cancel?.bind(synth)||null;
let activeAudio=null;
let activeUtterance=null;
let seq=0;

function hashText(text){
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,0x01000193);
  }
  return (h>>>0).toString(16).padStart(8,'0');
}

function currentCharacter(){
  const c=String(window.N99Character?.get?.()||'petty').toLowerCase();
  return c==='daisy'||c==='mick'?c:'petty';
}

function finish(type,extra={}){
  const u=activeUtterance;
  activeUtterance=null;
  activeAudio=null;
  if(!u)return;
  try{
    if(type==='error')u.onerror?.({type:'error',engine:'cast-static-audio',...extra});
    else u.onend?.({type:'end',engine:'cast-static-audio',...extra});
  }catch{}
}

function stopCast(cancelled=false){
  seq++;
  const a=activeAudio;
  if(a){
    try{a.pause();a.currentTime=0}catch{}
    a.onplay=a.onended=a.onerror=null;
  }
  if(activeUtterance)finish('end',{cancelled});
  activeAudio=null;
  activeUtterance=null;
}

function stopAll(){
  stopCast(true);
  try{return priorCancel?.()}catch{}
}

function playText(character,text,handlers={}){
  character=String(character||'').toLowerCase();
  if(character!=='daisy'&&character!=='mick')return false;
  text=String(text||'').trim();
  if(!text)return false;
  stopCast(true);
  const my=++seq;
  const file=`/assets/${character}-audio/${hashText(text)}.mp3`;
  const a=new Audio(file);
  a.preload='auto';
  a.playsInline=true;
  a.setAttribute('playsinline','');
  activeAudio=a;
  activeUtterance=null;
  a.onplay=()=>{if(my===seq)try{handlers.onstart?.({type:'start',engine:'cast-static-audio',character,file})}catch{}};
  a.onended=()=>{if(my!==seq)return;activeAudio=null;try{handlers.onend?.({type:'end',engine:'cast-static-audio',character,file})}catch{}};
  a.onerror=()=>{if(my!==seq)return;activeAudio=null;try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file,error:a.error})}catch{}};
  try{
    const p=a.play();
    if(p&&typeof p.catch==='function')p.catch(err=>{
      if(my!==seq)return;
      activeAudio=null;
      try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file,blocked:true,error:err})}catch{}
    });
    return true;
  }catch(err){
    activeAudio=null;
    try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file,blocked:true,error:err})}catch{}
    return false;
  }
}

function unlock(character=currentCharacter()){
  character=String(character||'').toLowerCase();
  if(character!=='daisy'&&character!=='mick')return false;
  const text=window.N99CastLines?.[character]?.intro?.[0]?.text;
  if(!text)return false;
  try{
    const a=new Audio(`/assets/${character}-audio/${hashText(text)}.mp3`);
    a.preload='auto';
    a.playsInline=true;
    a.setAttribute('playsinline','');
    a.muted=true;
    const stop=()=>{try{a.pause();a.currentTime=0}catch{}};
    const p=a.play();
    if(p&&typeof p.then==='function')p.then(stop).catch(()=>{});else stop();
    return true;
  }catch{return false}
}

if(synth&&priorSpeak){
  synth.cancel=function(){return stopAll()};
  synth.speak=function(utterance){
    const character=currentCharacter();
    if(character==='petty')return priorSpeak(utterance);
    const text=String(utterance?.text||'').trim();
    if(!text)return;
    playText(character,text,{
      onstart:e=>{try{utterance.onstart?.(e)}catch{}},
      onend:e=>{try{utterance.onend?.(e)}catch{}},
      onerror:e=>{try{utterance.onerror?.(e)}catch{}}
    });
  };
  synth.__n99CastStaticPatched=true;
}
window.N99CastStaticAudio={hashText,currentCharacter,playText,stop:stopAll,unlock};
})();
