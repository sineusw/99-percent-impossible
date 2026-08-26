/* 99% IMPOSSIBLE — Petty HTMLAudioElement transport v2.0
   ElevenLabs runtime only. No AudioContext, no local-MP3 probe, no device TTS in production. */
(()=>{
'use strict';
const synth=window.speechSynthesis;
if(!synth||synth.__pettyHtmlAudioPatched)return;
const nativeCancel=synth.cancel.bind(synth);
const cache=new Map();
let audioEl=null,activeUrl=null,activeUtterance=null,seq=0,unlocked=false,unlocking=false;
// Tiny silent WAV. Used only to claim media playback permission on a trusted gesture.
const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
function getAudio(){
  if(audioEl)return audioEl;
  audioEl=document.createElement('audio');
  audioEl.preload='auto';
  audioEl.playsInline=true;
  audioEl.setAttribute('playsinline','');
  audioEl.style.display='none';
  document.body?.appendChild(audioEl);
  return audioEl;
}
function revoke(){if(activeUrl){try{URL.revokeObjectURL(activeUrl)}catch{}activeUrl=null}}
function detach(a){if(!a)return;a.onplay=a.onended=a.onerror=null}
function finish(u,engine='html-audio',extra={}){
  if(activeUtterance===u)activeUtterance=null;
  try{u?.onend?.({type:'end',engine,...extra})}catch{}
}
function stopCurrent(cancelled=false){
  const a=getAudio(),u=activeUtterance;
  activeUtterance=null;
  try{a.pause();a.currentTime=0}catch{}
  detach(a);revoke();
  if(u)finish(u,'html-audio',{cancelled});
}
function fetchVoice(text){
  text=String(text||'').trim();
  if(!text)return Promise.reject(new Error('empty voice text'));
  if(cache.has(text))return cache.get(text);
  const p=fetch('/api/petty-voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
    .then(async r=>{if(!r.ok)throw new Error('voice '+r.status);return r.blob()})
    .catch(e=>{cache.delete(text);throw e});
  cache.set(text,p);return p;
}
window.preloadPettyVoice=text=>fetchVoice(text).then(()=>true).catch(()=>false);
window.isPettyVoicePreloaded=text=>cache.has(String(text||'').trim());
window.unlockPettyAudio=()=>{
  if(unlocked||unlocking)return true;
  const a=getAudio();
  try{
    unlocking=true;
    a.src=SILENT;a.currentTime=0;a.volume=.01;
    const p=a.play();
    if(p?.then)p.then(()=>{unlocked=true;unlocking=false;try{a.pause();a.currentTime=0}catch{};a.removeAttribute('src');a.load?.()}).catch(()=>{unlocking=false});
    else{unlocked=true;unlocking=false}
    return true;
  }catch{unlocking=false;return false}
};
// Always try to claim the dedicated media element on a genuine mobile gesture.
addEventListener('pointerdown',()=>window.unlockPettyAudio?.(),{capture:true});
addEventListener('touchstart',()=>window.unlockPettyAudio?.(),{capture:true,passive:true});
function playBlob(u,blob,mySeq){
  if(mySeq!==seq)return;
  const a=getAudio();
  stopCurrent(false);
  activeUtterance=u;
  activeUrl=URL.createObjectURL(blob);
  a.src=activeUrl;a.volume=typeof u.volume==='number'?u.volume:1;a.currentTime=0;a.preload='auto';
  let done=false;
  const fail=err=>{if(done||mySeq!==seq)return;done=true;detach(a);revoke();if(activeUtterance===u)activeUtterance=null;try{u.onerror?.({type:'error',engine:'html-audio',error:err})}catch{};try{u.onend?.({type:'end',engine:'html-audio',error:true})}catch{}};
  a.onplay=()=>{unlocked=true;try{u.onstart?.({type:'start',engine:'html-audio'})}catch{}};
  a.onended=()=>{if(done||mySeq!==seq)return;done=true;detach(a);revoke();finish(u)};
  a.onerror=fail;
  try{const p=a.play();p?.catch?.(fail)}catch(err){fail(err)}
}
function speakHtml(u){
  const text=String(u?.text||'').trim(),mySeq=++seq;
  if(!text){try{u?.onend?.({type:'end',engine:'html-audio'})}catch{};return}
  // Do not route through AudioContext under any condition.
  fetchVoice(text).then(blob=>{if(mySeq===seq)playBlob(u,blob,mySeq)}).catch(err=>{if(mySeq!==seq)return;try{u.onerror?.({type:'error',engine:'html-audio',error:err})}catch{};try{u.onend?.({type:'end',engine:'html-audio',error:true})}catch{}});
}
synth.speak=speakHtml;
synth.cancel=function(){seq++;stopCurrent(true);try{nativeCancel()}catch{}};
synth.__pettyHtmlAudioPatched=true;
synth.__pettyStaticAudioPatched=true;
window.PETTY_VOICE_ENGINE='elevenlabs-html-audio';
window.PettyStaticAudio={allowDeviceFallback:false,transport:'html-audio-only'};
})();