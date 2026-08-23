/* 99% IMPOSSIBLE — gameplay input fairness v0.9.6
   - Timer STOP scores on physical press, not finger release.
   - Perfect Stop STOP scores on physical press, not finger release.
   - START / TRY AGAIN keep normal release behavior.
   - Mobile touch uses touchstart; mouse/stylus use pointerdown.
   - Backgrounding cancels an active attempt without counting a miss.
*/
(()=>{
  'use strict';

  const primary=document.querySelector('#primary');
  if(!primary)return;

  let stopGestureActive=false;
  let touchHandled=false;

  const isPrecisionStop=()=>
    typeof st!=='undefined' &&
    st.run &&
    !st.locked &&
    (st.g==='timer'||st.g==='stop');

  function alignTimerToPhysicalPress(e){
    if(st.g!=='timer'||!st.start)return;
    const now=performance.now();
    const rawTs=Number(e.timeStamp);
    const eventNow=Number.isFinite(rawTs)&&Math.abs(rawTs-now)<60000?rawTs:now;
    const elapsed=Math.max(0,eventNow-st.start);
    st.start=performance.now()-elapsed;
  }

  function scoreStopFromPress(e){
    if(!isPrecisionStop())return false;
    e.preventDefault?.();
    stopGestureActive=true;
    alignTimerToPhysicalPress(e);
    audio();
    if(st.g==='timer')timerStop();
    else stopStop();
    return true;
  }

  function cancelInterruptedAttempt(){
    if(typeof st==='undefined'||!st.run)return;
    stopGestureActive=false;
    touchHandled=false;
    // reset() already owns RAF/timeout/tick cleanup and does not bump attempts
    // or mutate streak state, so an OS/browser interruption is neutral.
    if(typeof reset==='function')reset();
  }

  primary.addEventListener('touchstart',e=>{
    if(scoreStopFromPress(e)){
      touchHandled=true;
      setTimeout(()=>{touchHandled=false},140);
    }
  },{passive:false,capture:true});

  primary.addEventListener('pointerdown',e=>{
    if(touchHandled||e.pointerType==='touch')return;
    scoreStopFromPress(e);
  },{passive:false,capture:true});

  // Replace the old release-driven gameplay handler. Release still starts a
  // challenge or retries; a release belonging to an already-scored STOP is eaten.
  primary.onpointerup=e=>{
    e.preventDefault();
    if(stopGestureActive){stopGestureActive=false;return}
    if(st.locked)return;
    audio();
    if(primary.textContent==='TRY AGAIN')return reset();
    if(st.g==='timer'&&!st.run)return timerStart();
    if(st.g==='stop'&&!st.run)return stopStart();
    if(st.g==='reaction'&&!st.run)return rxStart();
  };

  primary.addEventListener('pointercancel',()=>{stopGestureActive=false},{capture:true});
  primary.addEventListener('touchcancel',()=>{stopGestureActive=false;touchHandled=false},{capture:true});

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)cancelInterruptedAttempt();
  });
  window.addEventListener('pagehide',cancelInterruptedAttempt);
})();
