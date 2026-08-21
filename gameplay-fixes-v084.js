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

  const play=q('#play');
  let touchHandled=false;

  function scoreReactionFromEvent(e){
    try{
      if(typeof st==='undefined'||st.g!=='reaction'||!st.run)return false;

      e.preventDefault?.();

      // Use the browser event timestamp itself. On iOS, touchstart fires
      // earlier than the compatibility pointer event and is the closest
      // timestamp we can get to the player's actual finger contact.
      if(st.ready&&st.start>0){
        const now=performance.now();
        const rawTs=Number(e.timeStamp);
        const eventNow=Number.isFinite(rawTs)&&Math.abs(rawTs-now)<60000?rawTs:now;
        const exactElapsed=Math.max(0,eventNow-st.start);

        // rxHit() is still the ONE function that displays and saves the score.
        // Shift its start reference so its performance.now() calculation equals
        // the captured physical-touch elapsed time.
        st.start=performance.now()-exactElapsed;
      }

      if(typeof rxHit==='function')rxHit();
      return true;
    }catch{return false}
  }

  if(play){
    // iPhone/iPad: earliest reliable physical contact event.
    play.addEventListener('touchstart',e=>{
      if(scoreReactionFromEvent(e)){
        touchHandled=true;
        setTimeout(()=>{touchHandled=false},120);
      }
    },{passive:false,capture:true});

    // Mouse / stylus / browsers without touchstart. Ignore the compatibility
    // pointer event that follows an already-handled mobile touch.
    play.addEventListener('pointerdown',e=>{
      if(touchHandled||e.pointerType==='touch')return;
      scoreReactionFromEvent(e);
    },{passive:false,capture:true});
  }

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.card,#primary,#retry,#back,.cos-btn'))return;
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),30);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),350);
    setTimeout(()=>window.N99Cosmetics?.syncColorWords?.(),1900);
  },false);
})();