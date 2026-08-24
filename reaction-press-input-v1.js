/* 99% IMPOSSIBLE — Reaction physical-press fairness v1.2
   Uses touchstart/pointerdown and passes a normalized performance-clock timestamp into rxHit(). */
(()=>{
'use strict';
const play=document.querySelector('#play');if(!play||typeof rxHit!=='function')return;
let touchHandled=false,pressScored=false;
const canScore=()=>typeof st!=='undefined'&&st.g==='reaction'&&st.run&&!st.locked;
function safeResumeAudio(){try{const c=typeof audio==='function'?audio():null;if(c?.state==='suspended'&&c.resume)c.resume().catch?.(()=>{})}catch{}}
function pressTime(e){const raw=Number(e?.timeStamp),normalize=window.N99ReactionScoring?.normalizePressTime;if(typeof normalize==='function')return normalize(raw);const now=performance.now();return Number.isFinite(raw)&&raw<1e12&&Math.abs(raw-now)<60000?raw:now}
function scorePress(e){if(!canScore()||pressScored)return false;e.preventDefault?.();safeResumeAudio();pressScored=true;rxHit(pressTime(e));setTimeout(()=>{pressScored=false},170);return true}
play.addEventListener('touchstart',e=>{if(scorePress(e)){touchHandled=true;setTimeout(()=>{touchHandled=false},190)}},{passive:false,capture:true});
play.addEventListener('pointerdown',e=>{if(touchHandled||e.pointerType==='touch')return;scorePress(e)},{passive:false,capture:true});
play.onpointerup=e=>{if(touchHandled||pressScored){e.preventDefault?.();return}if(canScore()){e.preventDefault?.();safeResumeAudio();rxHit(performance.now())}};
play.addEventListener('pointercancel',()=>{pressScored=false},{capture:true});
play.addEventListener('touchcancel',()=>{pressScored=false;touchHandled=false},{capture:true});
})();
