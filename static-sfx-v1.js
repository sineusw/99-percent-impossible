/* 99% IMPOSSIBLE — HTML5 Audio SFX Engine v4 (Strict 3-Asset Minimal)
   Exactly 3 game outcomes: fail, win, perfect. No start/tick/go/tap hooks. */
(()=>{
'use strict';
const SFX_MAP={fail:'/assets/sfx/fail.mp3',win:'/assets/sfx/win.mp3',perfect:'/assets/sfx/perfect.mp3'};
const bank={};
Object.keys(SFX_MAP).forEach(key=>{const a=new Audio();a.src=SFX_MAP[key];a.preload='auto';a.volume=key==='perfect'?.75:.6;bank[key]=a});
function play(name){const sound=bank[name];if(!sound)return false;try{sound.currentTime=0;const p=sound.play();p?.catch?.(()=>{});return true}catch{return false}}
function prime(){Object.values(bank).forEach(a=>{try{a.load()}catch{}});return true}
window.N99SFX={play,prime,bank};
// Compatibility for Reaction TOO EARLY: same fail asset, no separate transport or fourth sound.
window.N99DiscreteSFX={playEarlyFail:()=>play('fail')};
window.audio=function(){return null};
window.tone=function(){return};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();play('fail')};
window.win=function(t){if(typeof untick==='function')untick();play(t==='perfect'?'perfect':'win')};
})();
