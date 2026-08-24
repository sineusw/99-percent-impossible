/* 99% IMPOSSIBLE — gameplay input fairness v0.9.7
   - Timer STOP scores on physical press, not finger release.
   - Perfect Stop STOP scores on physical press, not finger release.
   - START / TRY AGAIN keep normal release behavior.
   - Mobile touch uses touchstart; mouse/stylus use pointerdown.
   - Backgrounding cancels an active attempt without counting a miss.
   - Reaction false-start feedback is forced visible/audible across mobile browsers.
*/
(()=>{
  'use strict';

  const primary=document.querySelector('#primary');
  if(!primary)return;

  let stopGestureActive=false;
  let touchHandled=false;

  // The core game shakes the playfield on failure, but the score modal opens
  // immediately over it. Punch the visible modal too so TOO EARLY always reads.
  const feedbackStyle=document.createElement('style');
  feedbackStyle.textContent=`
    .modalbox.false-start-punch{
      animation:falseStartPunch .38s ease;
      border-color:#FF2A5F!important;
      box-shadow:0 0 46px rgba(255,42,95,.68),0 14px 45px rgba(0,0,0,.78),inset 0 1px 1px rgba(255,255,255,.06)!important
    }
    @keyframes falseStartPunch{
      20%{transform:translateX(-10px) scale(1.01)}
      40%{transform:translateX(10px) scale(1.015)}
      60%{transform:translateX(-7px)}
      80%{transform:translateX(5px)}
    }
  `;
  document.head.appendChild(feedbackStyle);

  // Safari can resume an AudioContext asynchronously. Keep the Reaction
  // false-start hit in phone-friendly midrange without changing global fail audio.
  function reactionFalseStartSound(fallback){
    try{
      untick();
      const c=typeof audio==='function'?audio():null;
      const playFail=()=>{
        tone(440,.11,'sawtooth',.075);
        tone(220,.18,'square',.055,.045);
      };
      if(c?.state==='running')return playFail();
      if(c?.resume)return c.resume().then(()=>{if(c.state==='running')playFail()}).catch(()=>fallback?.());
      return playFail();
    }catch{
      return fallback?.();
    }
  }

  // Wrap the final loaded show() so TOO EARLY gets the mobile-safe fail sound
  // only for this synchronous result path, then restore the original failSound.
  // The visible score modal also gets the false-start punch after result wrappers run.
  if(typeof show==='function'){
    const baseShow=show;
    show=function(score,...rest){
      const falseStart=typeof st!=='undefined'&&st.g==='reaction'&&score==='TOO EARLY';
      let originalFailSound=null;
      if(falseStart&&typeof failSound==='function'){
        originalFailSound=failSound;
        failSound=()=>reactionFalseStartSound(originalFailSound);
      }
      let result;
      try{
        result=baseShow(score,...rest);
      }finally{
        if(originalFailSound)failSound=originalFailSound;
      }
      if(falseStart){
        const box=document.querySelector('.modalbox');
        if(box){
          box.classList.remove('false-start-punch');
          void box.offsetWidth;
          box.classList.add('false-start-punch');
          setTimeout(()=>box.classList.remove('false-start-punch'),450);
        }
      }
      return result;
    };
  }

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
