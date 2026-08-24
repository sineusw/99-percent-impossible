/* 99% IMPOSSIBLE — final Reaction Test patch
   - Silent unpredictable 1–5s GO delay
   - One authoritative Reaction result object
   - Curved percentage presentation while PB remains raw milliseconds
   - TOO EARLY and sub-100ms SUSPICIOUSLY FAST stay distinct
*/
(()=>{
  'use strict';

  const POINTS=[
    [150,100],[180,99.5],[200,99],[230,97.5],[250,95.5],
    [300,90],[350,80],[500,50],[700,0]
  ];

  function reactionPercent(ms){
    if(ms<=POINTS[0][0])return 100;
    for(let i=1;i<POINTS.length;i++){
      const [b,pb]=POINTS[i],[a,pa]=POINTS[i-1];
      if(ms<=b)return Math.max(0,Math.min(100,pa+(pb-pa)*((ms-a)/(b-a))));
    }
    return 0;
  }

  function reactionTier(ms){
    if(ms<100)return 'suspicious';
    if(ms<120)return 'extreme';
    if(ms<150)return 'elite';
    if(ms<=180)return 'perfect';
    if(ms<=210)return 'epic';
    if(ms<=250)return 'strong';
    if(ms<=300)return 'subtle';
    return 'fail';
  }

  const style=document.createElement('style');
  style.textContent=`
    body.reaction-suspicious .modalbox{border-color:#8B5CF6!important;box-shadow:0 0 48px rgba(139,92,246,.55),0 14px 45px rgba(0,0,0,.78)!important}
    body.reaction-suspicious .modalbox .score{color:#C4B5FD!important;text-shadow:0 0 26px rgba(139,92,246,.75)!important}
    body.reaction-elite .modalbox{border-color:#00D8F6!important;box-shadow:0 0 55px rgba(0,216,246,.5),0 14px 45px rgba(0,0,0,.78)!important}
  `;
  document.head.appendChild(style);

  const suspiciousPetty=[
    {id:'rxbot01',text:'Are you a robot?'},
    {id:'rxbot02',text:'That was not supposed to happen.'},
    {id:'rxbot03',text:'One hundred percent a glitch.'},
    {id:'rxbot04',text:'Who are you paying to tap for you?'},
    {id:'rxbot05',text:'Nah. Run that back.'},
    {id:'rxbot06',text:'I said react. Not predict the future.'},
    {id:'rxbot07',text:'Bro tapped before his brain got the notification.'},
    {id:'rxbot08',text:'Absolutely not. Do it again.'}
  ];

  function publish(result){
    window.N99ReactionResult=result;
    try{window.dispatchEvent(new CustomEvent('n99:reaction-result',{detail:result}))}catch{}
    return result;
  }

  // Temporarily feed Petty's existing perfect-result consumer the dedicated
  // suspicious pool. The authoritative tier comes from N99ReactionResult;
  // no reaction timing or percentage is recalculated here.
  function armSuspiciousPetty(){
    const pp=window.PettyPersonality;
    if(!pp?.pools?.perfect)return ()=>{};
    const old=pp.pools.perfect;
    pp.pools.suspicious=suspiciousPetty;
    pp.pools.perfect=suspiciousPetty;
    return ()=>setTimeout(()=>{if(pp.pools.perfect===suspiciousPetty)pp.pools.perfect=old},0);
  }

  window.N99ReactionScoring={reactionPercent,reactionTier};

  rxStart=function(){
    audio();
    st.run=1;
    st.ready=0;
    st.start=0;
    primary.textContent='WAIT FOR GREEN…';
    untick(); // Reaction waiting is intentionally silent: no learnable rhythm.
    const r=play.querySelector('.rx');
    r.className='rx wait';
    r.innerHTML='<b>WAIT…</b><div>Do not tap yet. The whole box will turn GREEN.</div>';
    const delay=1000+Math.random()*4000;
    st.to=setTimeout(()=>{
      if(!st.run)return;
      tone(920,.08,'square',.05);
      st.ready=1;
      st.start=performance.now();
      r.className='rx go';
      r.innerHTML='<b>GO!</b><div>TAP THIS GREEN BOX NOW</div>';
      primary.textContent='TAP GREEN BOX!';
      navigator.vibrate?.(30);
    },delay);
  };

  rxHit=function(){
    if(!st.run)return;

    if(!st.ready){
      clearTimeout(st.to);
      untick();
      st.run=0;
      bump();
      streak(false);
      publish({reactionMs:null,reactionPercent:null,isPB:false,pbGap:null,tier:'too-early'});
      const r=play.querySelector('.rx');
      r.className='rx early';
      r.innerHTML='<b>TOO EARLY</b><div>Wait for BRIGHT GREEN.</div>';
      show('TOO EARLY',pick(ROAST.reaction.early),'NO TIME RECORDED','I got baited by Reaction Test in 99% IMPOSSIBLE and tapped TOO EARLY 💀 bet you do the same.','fail',false,true,'');
      primary.textContent='TRY AGAIN';
      return window.N99ReactionResult;
    }

    const reactionMs=Math.max(0,performance.now()-st.start);
    st.run=st.ready=0;
    bump();

    const raw=localStorage.getItem(K('reaction_best'));
    const old=raw===null?null:+raw;
    const isPB=old===null||reactionMs<old;
    // Post-GO sub-100ms scores are intentionally allowed to remain PBs.
    // They are socially fun but framed as SUSPICIOUSLY FAST, not normal perfection.
    if(isPB)S('reaction_best',reactionMs);

    const reactionPercent=Math.round((reactionPercentRaw(reactionMs)+Number.EPSILON)*10)/10;
    const pbGap=old===null?null:reactionMs-old;
    const result=publish({reactionMs,reactionPercent,isPB,pbGap,tier:reactionTier(reactionMs)});
    streak(reactionMs<=230);

    const ro=reactionMs<180?pick(ROAST.reaction.elite):reactionMs<=250?pick(ROAST.reaction.good):pick(ROAST.reaction.slow);
    const delta=deltaMark('reaction_lastMs',reactionMs,'ms',0);
    const suspicious=result.tier==='suspicious';
    const restorePetty=suspicious?armSuspiciousPetty():()=>{};
    const visualTier=suspicious?'subtle':result.tier==='extreme'||result.tier==='elite'?'epic':rtier(reactionMs);
    const label=suspicious?'🤖 SUSPICIOUSLY FAST':result.tier==='extreme'?'EXTREMELY FAST':result.tier==='elite'?'ELITE REACTION':'REACTION TIME';
    const done=()=>{
      show(Math.round(reactionMs)+'ms',ro,reactionPercent.toFixed(1)+'% · '+label,`I hit ${Math.round(reactionMs)}ms (${reactionPercent.toFixed(1)}%) on Reaction Test in 99% IMPOSSIBLE ⚡ bet your reflexes are slower.`,visualTier,isPB,visualTier==='fail',delta);
      restorePetty();
      document.body.classList.toggle('reaction-suspicious',suspicious);
      document.body.classList.toggle('reaction-elite',result.tier==='extreme'||result.tier==='elite');
      primary.textContent='TRY AGAIN';
    };

    if(reactionMs>=231&&reactionMs<=250&&old!==null&&!isPB&&pbGap>0&&pbGap<=6){
      nearReveal('reaction',Math.round(pbGap)+'ms FROM YOUR BEST','SO CLOSE',done);
    }else done();
    return result;
  };

  // Named indirection keeps the rounded display and result payload on one curve.
  function reactionPercentRaw(ms){return reactionPercent(ms)}
})();
