/* 99% IMPOSSIBLE — HTML5 Audio SFX Engine v4.1.0 (Strict 3-Asset Minimal)
   Exactly 3 game outcomes: fail, win, perfect. No start/tick/go/tap hooks.
   Uses small per-sound pools so rapid/repeated outcomes do not depend on one reused element.
   Global mute silences gameplay outcome SFX too. */
(()=>{
'use strict';
const SFX_MAP={fail:'/assets/sfx/fail.mp3',win:'/assets/sfx/win.mp3',perfect:'/assets/sfx/perfect.mp3'};
const POOL_SIZE=3;
const bank={};
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
  try{
    sound.pause();
    sound.currentTime=0;
    const p=sound.play();
    p?.catch?.(()=>{});
    return true;
  }catch{return false}
}

// Kept for compatibility with the prior Timer-only workaround; now all games use the same pooled path.
function playFresh(name){return play(name)}

function prime(){
  Object.values(bank).forEach(pool=>pool.els.forEach(a=>{try{a.load()}catch{}}));
  return true;
}

window.N99SFX={play,playFresh,prime,bank};
// Compatibility for Reaction TOO EARLY: same fail asset, no separate transport or fourth sound.
window.N99DiscreteSFX={playEarlyFail:()=>play('fail')};
window.audio=function(){return null};
window.tone=function(){return};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();return play('fail')};
window.win=function(t){if(typeof untick==='function')untick();return play(t==='perfect'?'perfect':'win')};
})();
