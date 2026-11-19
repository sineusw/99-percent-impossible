/* 99% IMPOSSIBLE — Perfect Stop adaptive difficulty patch
   90%+ target hit: advance one tier
   target hit below 90%: hold tier
   miss: reset to Tier 1
   Difficulty is session/run state only; PBs, score, attempts and global streak stay unchanged.
*/
(()=>{
  'use strict';
  const D=window.N99PerfectStopDifficulty;
  if(!D||typeof D.evaluatePerfectStopAttempt!=='function')return;

  let stopTier=1;
  const clampTier=t=>Math.max(1,Math.min(D.MAX_TIER,t));
  const difficultyIndex=()=>clampTier(stopTier)-1;
  const resetStopDifficulty=()=>{stopTier=1};

  // Fresh Perfect Stop visit = fresh baseline difficulty.
  document.querySelector('[data-g="stop"]')?.addEventListener('click',resetStopDifficulty,{capture:true});
  document.querySelector('#back')?.addEventListener('click',()=>{
    if(typeof st!=='undefined'&&st.g==='stop')resetStopDifficulty();
  },{capture:true});

  stopStart=function(){
    audio();st.run=1;primary.textContent='STOP';ticks('stop');
    let tg=play.querySelector('.target'),m=play.querySelector('.marker'),sl=play.querySelector('.sl'),
        ss=difficultyIndex(),w=Math.max(9,22-ss*1.6),x=12+Math.random()*(76-w);
    tg.style.left=x+'%';tg.style.width=w+'%';sl.textContent='TAP STOP WHEN WHITE HITS GREEN';
    st.pos=1;st.dir=1;m.style.left='1%';
    const startedAt=performance.now(),speed=62+ss*8;
    // Rendering and scoring share one reflected trajectory. A queued press can
    // predate the latest frame, so integrating from that frame is insufficient.
    st.stopPositionAt=at=>{
      const phase=(Math.max(0,at-startedAt)*speed/1000)%194;
      return phase<=97?1+phase:195-phase;
    };
    let loop=now=>{
      st.pos=st.stopPositionAt(now);
      m.style.left=st.pos+'%';st.raf=requestAnimationFrame(loop)
    };
    st.tgt={x,w};st.raf=requestAnimationFrame(loop)
  };

  stopStop=function(pressTime){
    if(!st.run||st.locked||!st.tgt)return;
    if(Number.isFinite(pressTime)&&st.stopPositionAt){
      st.pos=st.stopPositionAt(pressTime);
      play.querySelector('.marker').style.left=st.pos+'%';
    }
    cancelAnimationFrame(st.raf);untick();st.run=0;
    let c=st.tgt.x+st.tgt.w/2,d=Math.abs(st.pos-c),sc=Math.max(0,100-d/50*100),
        visibleSc=Math.round((sc+Number.EPSILON)*10)/10,
        raw=localStorage.getItem(K('stop_best')),old=raw===null?null:+raw,
        hit=st.pos>=st.tgt.x&&st.pos<=st.tgt.x+st.tgt.w,
        isPB=hit&&(old===null||sc>old),
        edgeDist=hit?0:Math.min(Math.abs(st.pos-st.tgt.x),Math.abs(st.pos-(st.tgt.x+st.tgt.w)));

    bump();recordResult({rawScore:sc,percentage:sc,isPB,hadPreviousPB:old!==null,isPerfect:hit&&sc>=99.95});if(isPB)S('stop_best',sc);

    // Difficulty quality uses the same one-decimal score shown to the player.
    const outcome=D.evaluatePerfectStopAttempt({
      hit,
      accuracy:visibleSc/100,
      currentTier:stopTier,
      streakSaveTriggered:false
    });
    stopTier=outcome.nextTier;

    // Retire the old persisted difficulty value so returning players always start fresh.
    S('stop_streak',0);

    // A miss can never advance the game-wide streak.
    streak(hit&&sc>=97);
    let ro=hit?(sc>98?pick(ROAST.stop.great):pick(ROAST.stop.hit)):(edgeDist<=3?pick(ROAST.stop.near):pick(ROAST.stop.bad)),
        ti=tier(sc),delta=deltaMark('stop_lastD',d,'%',1),
        done=()=>{
          show(visibleSc.toFixed(1)+'%',ro,hit?'TARGET HIT':'TARGET MISSED',
            `I got ${visibleSc.toFixed(1)}% on Perfect Stop in 99% IMPOSSIBLE and my phone almost blew up 💀 bet you can't beat this.`,
            ti,isPB,!hit||ti==='fail',delta);
          primary.textContent='TRY AGAIN'
        };
    if(!hit&&edgeDist<=3)nearReveal('stop',d.toFixed(1)+'% FROM CENTER','MISSED BY '+edgeDist.toFixed(1)+'% OF TRACK',done);
    else done();

    // Single source of truth for downstream wrappers/cosmetics.
    return {hit,isPB,score:sc,visibleScore:visibleSc,distance:d};
  };
})();
