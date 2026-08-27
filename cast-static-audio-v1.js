/* 99% IMPOSSIBLE — Daisy/Mick static HTMLAudio transport v1.1
   Petty stays on the proven Petty transport. Daisy/Mick use their own
   pre-generated MP3 assets keyed by the same FNV-1a text hash used by
   scripts/generate-cast-audio.mjs. No WebAudio and no gameplay SFX changes. */
(()=>{
'use strict';
const synth=window.speechSynthesis;
if(!synth||synth.__n99CastStaticPatched)return;

const priorSpeak=synth.speak.bind(synth);
const priorCancel=synth.cancel.bind(synth);
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
  const c=window.N99Character?.get?.()||'petty';
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
  try{return priorCancel()}catch{}
}

function playText(character,text,handlers={}){
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
  a.onerror=()=>{if(my!==seq)return;activeAudio=null;try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file})}catch{}};
  try{
    const p=a.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{
      if(my!==seq)return;
      activeAudio=null;
      try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file,blocked:true})}catch{}
    });
    return true;
  }catch{
    activeAudio=null;
    try{handlers.onerror?.({type:'error',engine:'cast-static-audio',character,file,blocked:true})}catch{}
    return false;
  }
}

synth.cancel=function(){return stopAll()};

synth.speak=function(utterance){
  const character=currentCharacter();
  if(character==='petty')return priorSpeak(utterance);
  const text=String(utterance?.text||'').trim();
  if(!text)return;
  stopCast(true);
  const my=++seq;
  const file=`/assets/${character}-audio/${hashText(text)}.mp3`;
  const a=new Audio(file);
  a.preload='auto';
  a.playsInline=true;
  a.setAttribute('playsinline','');
  activeAudio=a;
  activeUtterance=utterance;
  a.onplay=()=>{if(my===seq)try{utterance.onstart?.({type:'start',engine:'cast-static-audio',character})}catch{}};
  a.onended=()=>{if(my===seq)finish('end',{character})};
  a.onerror=()=>{if(my===seq)finish('error',{character,file})};
  try{
    const p=a.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{if(my===seq)finish('error',{character,file,blocked:true})});
  }catch{if(my===seq)finish('error',{character,file,blocked:true})}
};

synth.__n99CastStaticPatched=true;
window.N99CastStaticAudio={hashText,currentCharacter,playText,stop:stopAll};
})();
