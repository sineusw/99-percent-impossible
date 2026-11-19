/* 99% IMPOSSIBLE — HTML5 Audio SFX Engine v4.1.0 (Strict 3-Asset Minimal)
   Exactly 3 game outcomes: fail, win, perfect. No start/tick/go/tap hooks.
   Uses small per-sound pools so rapid/repeated outcomes do not depend on one reused element.
   Global mute silences gameplay outcome SFX too. */
(()=>{
'use strict';
const SFX_MAP={fail:'/assets/sfx/fail.mp3',win:'/assets/sfx/win.mp3',perfect:'/assets/sfx/perfect.mp3'};
const POOL_SIZE=3;
// Real silence: iOS may ignore JavaScript volume changes.
const SILENT_PRIME='data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
const bank={};
const warmed=new WeakSet(),warming=new WeakMap();
const soundOn=()=>localStorage.getItem('n99_petty_voice')!=='0';

function makeAudio(name){
  const a=new Audio(SFX_MAP[name]);
  a.preload='auto';
  a.playsInline=true;
  a.setAttribute('playsinline','');
  a.volume=name==='perfect'?.75:.6;
  return a;
}

Object.keys(SFX_MAP).forEach(name=>{
  bank[name]={i:0,els:Array.from({length:POOL_SIZE},()=>makeAudio(name))};
});

function play(name){
  if(!soundOn())return false;
  const pool=bank[name];
  if(!pool)return false;
  const sound=pool.els[pool.i++%pool.els.length];
  const pending=warming.get(sound);
  if(pending){sound.src=pending.src;sound.volume=pending.volume;warming.delete(sound)}
  try{
    sound.pause();
    sound.currentTime=0;
    const p=sound.play();
    p?.then?.(()=>warmed.add(sound),()=>{});
    return true;
  }catch{return false}
}

// Kept for compatibility with the prior Timer-only workaround; now all games use the same pooled path.
function playFresh(name){return play(name)}

function prime(){
  if(!soundOn())return false;
  Object.values(bank).forEach(pool=>pool.els.forEach(a=>{
    if(warmed.has(a)||warming.has(a))return;
    const pending={volume:a.volume,src:a.src};
    warming.set(a,pending);
    // load() alone does not grant Safari permission to play a later outcome.
    // Warm each reused element silently within the physical user gesture.
    const finish=success=>{
      if(success)warmed.add(a);
      if(warming.get(a)!==pending)return; // A real result now owns the element.
      warming.delete(a);
      a.pause();a.src=pending.src;a.currentTime=0;a.volume=pending.volume;
    };
    try{
      a.src=SILENT_PRIME;
      a.volume=0;
      const p=a.play();
      if(p?.then)p.then(()=>finish(true),()=>finish(false));else finish(true);
    }catch{finish(false)}
  }));
  return true;
}

// Include click/keydown for keyboard and accessibility activation. Successful
// elements are warmed once; rejected unlocks can retry on the next gesture.
for(const event of ['pointerdown','touchstart','keydown','click'])
  window.addEventListener(event,prime,{capture:true,passive:true});

function stop(){
  Object.values(bank).forEach(pool=>pool.els.forEach(a=>{
    const pending=warming.get(a);
    warming.delete(a);
    try{a.pause();if(pending){a.src=pending.src;a.volume=pending.volume}a.currentTime=0}catch{}
  }));
}
window.N99SFX={play,playFresh,prime,stop,bank};
// Compatibility for Reaction TOO EARLY: same fail asset, no separate transport or fourth sound.
window.N99DiscreteSFX={playEarlyFail:()=>play('fail')};
window.audio=function(){return null};
window.tone=function(){return};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();return play('fail')};
window.win=function(t){if(typeof untick==='function')untick();return play(t==='perfect'?'perfect':'win')};
})();
