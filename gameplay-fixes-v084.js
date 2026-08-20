/* 99% IMPOSSIBLE — v0.8.6 SAFE gameplay fixes
   - Perfect Stop: two exact-center white guide lines
   - Reaction Test: record the instant the finger touches, not when it lifts
   - Palette wording/color sync delegated to cosmetics.js
*/
(()=>{
  'use strict';
  const q=s=>document.querySelector(s);

  // Visual-only center guides. pointer-events:none means they can never block taps.
  const style=document.createElement('style');
  style.textContent=`
    .stopstage .target{position:absolute}
    .stopstage .target::after{
      content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;
      background:linear-gradient(90deg,
        transparent calc(50% - 7px),
        rgba(255,255,255,.98) calc(50% - 7px),rgba(255,255,255,.98) calc(50% - 5px),
        transparent calc(50% - 5px),transparent calc(50% + 5px),
        rgba(255,255,255,.98) calc(50% + 5px),rgba(255,255,255,.98) calc(50% + 7px),
        transparent calc(50% + 7px));
      filter:drop-shadow(0 0 4px rgba(255,255,255,.85));z-index:2
    }`;
  document.head.appendChild(style);

  // Reaction Test should measure the first contact. The old handler measured pointerup,
  // which could add ~80-150ms while a finger was held down and could miss a real PB.
  const play=q('#play');
  if(play){
    play.addEventListener('pointerdown',e=>{
      try{
        if(window.st?.g==='reaction'&&window.st?.run){
          e.preventDefault();
          if(typeof window.rxHit==='function')window.rxHit();
          else if(typeof rxHit==='function')rxHit();
        }
      }catch{}
    },{passive:false});
  }

  // Ask the palette layer to refresh text after gameplay redraws.
  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.card,#primary,#retry,#back,.cos-btn'))return;
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),30);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),350);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),1900);
  },false);
})();