/* 99% IMPOSSIBLE — SAFE gameplay fixes v0.9.3
   - Perfect Stop: two exact-center white guide lines
   - Reaction Test: score from earliest physical touch on mobile
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

  // Reaction input is owned by reaction-press-input-v1.js.

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.card,#primary,#retry,#back,.cos-btn'))return;
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),30);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),350);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),1900);
  },false);
})();