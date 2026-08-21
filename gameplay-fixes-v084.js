/* 99% IMPOSSIBLE — SAFE gameplay fixes v0.9.2
   - Perfect Stop: two exact-center white guide lines
   - Reaction Test: score from the actual finger-touch timestamp
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

          // Safari can deliver the handler a few dozen ms after the physical touch.
          // Use the pointer event's own timestamp so the modal, saved PB and the
          // player's actual tap all use the exact same moment.
          if(st.ready&&st.start>0){
            const now=performance.now();
            const rawTs=Number(e.timeStamp);
            const eventNow=Number.isFinite(rawTs)&&Math.abs(rawTs-now)<60000?rawTs:now;
            const exactElapsed=Math.max(0,eventNow-st.start);
            st.start=performance.now()-exactElapsed;
          }

          if(typeof rxHit==='function')rxHit();
        }
      }catch{}
    },{passive:false,capture:true});
  }

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.card,#primary,#retry,#back,.cos-btn'))return;
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),30);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),350);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),1900);
  },false);
})();