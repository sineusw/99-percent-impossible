/* 99% IMPOSSIBLE — Reaction Test physical-press fairness v1
   Scores Reaction on touchstart/pointerdown instead of finger release.
   Keeps the existing TOO EARLY path and suppresses duplicate release events. */
(()=>{
  'use strict';
  const play=document.querySelector('#play');
  if(!play||typeof rxHit!=='function')return;

  let touchHandled=false;
  let pressScored=false;

  function canScore(){
    return typeof st!=='undefined'&&st.g==='reaction'&&st.run&&!st.locked;
  }

  function scorePress(e){
    if(!canScore()||pressScored)return false;
    e.preventDefault?.();
    pressScored=true;
    rxHit();
    // rxHit ends the run synchronously. Clear the gesture latch after the
    // release window so the next round can score normally.
    setTimeout(()=>{pressScored=false},160);
    return true;
  }

  play.addEventListener('touchstart',e=>{
    if(scorePress(e)){
      touchHandled=true;
      setTimeout(()=>{touchHandled=false},180);
    }
  },{passive:false,capture:true});

  play.addEventListener('pointerdown',e=>{
    if(touchHandled||e.pointerType==='touch')return;
    scorePress(e);
  },{passive:false,capture:true});

  // Replace the core release-driven Reaction handler. The physical press above
  // already scored the attempt, so release must never add extra milliseconds.
  play.onpointerup=e=>{
    if(touchHandled||pressScored){e.preventDefault?.();return}
    // Defensive fallback for browsers that do not emit pointerdown/touchstart.
    if(canScore()){e.preventDefault?.();rxHit()}
  };

  play.addEventListener('pointercancel',()=>{pressScored=false},{capture:true});
  play.addEventListener('touchcancel',()=>{pressScored=false;touchHandled=false},{capture:true});
})();
