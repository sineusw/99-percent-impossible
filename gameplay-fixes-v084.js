/* 99% IMPOSSIBLE — v0.8.6 SAFE gameplay fixes
   - Perfect Stop: two exact-center white guide lines
   - Reaction Test: record the instant the finger touches, not when it lifts
   - Palette wording/color sync delegated to cosmetics.js
*/
(()=>{
  'use strict';
  const q=s=>document.querySelector(s);

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

  const play=q('#play');
  if(play){
    play.addEventListener('pointerdown',e=>{
      try{
        if(typeof st!=='undefined'&&st.g==='reaction'&&st.run){
          e.preventDefault();
          if(typeof rxHit==='function')rxHit();
        }
      }catch{}
    },{passive:false});
  }

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.card,#primary,#retry,#back,.cos-btn'))return;
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),30);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),350);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),1900);
  },false);
})();