/* v0.2.7 final gameplay pass: hot streaks + memory roasts + PB ghost */
(()=>{
  const q=s=>document.querySelector(s);
  const lvl=q('.head .lvl');
  const head=q('.head');
  let lastStreakDeath=false;

  const CHOKE=[
    'THE GAME REMEMBERS THIS.',
    'AGAIN? THIS IS BECOMING A PATTERN.',
    'YOU ARE ACTIVELY GETTING COOKED.',
    'SAME MISTAKE. DIFFERENT TAP.',
    'AT THIS POINT THE GAME KNOWS YOUR MOVE.',
    'THREE STRAIGHT. THIS IS PERSONAL NOW.',
    'YOU KEEP COMING BACK JUST TO DO THAT?',
    'THE BUTTON HAS LEARNED YOUR WEAKNESS.',
    'I HAVE RECEIPTS. YOU KEEP MISSING.',
    'YOUR LOSING STREAK HAS LORE NOW.'
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];

  const style=document.createElement('style');
  style.textContent=`
    .streak-badge{display:none;margin:8px auto 0;width:max-content;padding:5px 10px;border:1px solid rgba(255,176,32,.38);border-radius:999px;background:rgba(255,176,32,.1);color:#FFB020;font-size:11px;font-weight:1000;letter-spacing:1px;box-shadow:0 0 18px rgba(255,176,32,.14)}
    .streak-badge.on{display:block;animation:streakPop .25s ease}
    .streak-dead{display:inline-block;margin-top:9px;padding:5px 9px;border:1px solid rgba(255,42,95,.35);border-radius:7px;background:rgba(255,42,95,.1);color:#FF5A7D;font-size:11px;font-weight:1000;letter-spacing:1px;animation:deadPop .38s ease}
    .ghost{position:absolute;top:-18px;width:3px;height:68px;border-radius:3px;background:#fff;opacity:.48;box-shadow:0 0 8px rgba(255,255,255,.75),0 0 14px rgba(139,92,246,.55);transform:translateX(-50%);pointer-events:none;z-index:2}
    .ghost:after{content:'PB';position:absolute;top:70px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:1000;letter-spacing:.5px;color:#b8a5ff;white-space:nowrap}
    @keyframes streakPop{50%{transform:scale(1.12)}}
    @keyframes deadPop{35%{transform:scale(1.08)}}
  `;
  document.head.appendChild(style);

  const streakBadge=document.createElement('div');
  streakBadge.id='streakLive';
  streakBadge.className='streak-badge';
  streakBadge.textContent='🔥 x2';
  head?.insertBefore(streakBadge,head.querySelector('h2'));

  function updateStreakBadge(){
    if(!streakBadge)return;
    const c=G('currentStreak');
    streakBadge.textContent='🔥 x'+c;
    streakBadge.classList.toggle('on',c>=2);
  }

  function updateTarget(){
    if(!lvl||!st.g)return;
    const raw=localStorage.getItem(K(st.g+'_best'));
    if(raw===null){lvl.textContent=st.g==='stop'?'SET YOUR FIRST TARGET':'NO TARGET YET';return}
    const v=+raw;
    if(st.g==='timer') lvl.textContent='TARGET '+v.toFixed(3)+'s';
    else if(st.g==='reaction') lvl.textContent='TARGET '+Math.round(v)+'ms';
    else lvl.textContent='BEAT YOUR PB GHOST';
  }

  function ensureGhosts(){
    if(st.g!=='stop')return;
    const track=q('.track');
    if(!track||track.querySelector('.ghost-l'))return;
    const a=document.createElement('i'),b=document.createElement('i');
    a.className='ghost ghost-l'; b.className='ghost ghost-r';
    track.append(a,b);
  }

  function placeGhosts(){
    if(st.g!=='stop'||!st.tgt)return;
    ensureGhosts();
    const a=q('.ghost-l'),b=q('.ghost-r');
    if(!a||!b)return;
    const raw=localStorage.getItem(K('stop_bestD'));
    if(raw===null){a.style.display=b.style.display='none';return}
    const d=+raw,c=st.tgt.x+st.tgt.w/2;
    a.style.display=b.style.display='block';
    a.style.left=Math.max(1,Math.min(99,c-d))+'%';
    b.style.left=Math.max(1,Math.min(99,c+d))+'%';
  }

  function memoryRoast(roast,isPB,fail){
    if(!st.g)return roast;
    const key=st.g+'_memoryFails';
    let fails=G(key);
    if(isPB&&fails>0){
      const tries=fails+1;
      S(key,0);
      return 'FINALLY. ONLY TOOK YOU '+tries+' TRIES.';
    }
    if(fail){
      fails++;
      S(key,fails);
      if(fails>=3)return pick(CHOKE);
    }else S(key,0);
    return roast;
  }

  const baseStreak=streak;
  streak=function(ok){
    const before=G('currentStreak');
    baseStreak(ok);
    const c=G('currentStreak');
    lastStreakDeath=!ok&&before>=2;
    updateStreakBadge();
    return {c,died:lastStreakDeath};
  };

  const baseReset=reset;
  reset=function(){
    baseReset();
    ensureGhosts();
    updateTarget();
    updateStreakBadge();
  };

  const baseShow=show;
  show=function(score,roast,meta,share,t,isPB,fail,delta=''){
    roast=memoryRoast(roast,isPB,fail);
    baseShow(score,roast,meta,share,t,isPB,fail,delta);
    if(lastStreakDeath){
      const tag='<div class="streak-dead">STREAK DEAD 💀</div>';
      const result=q('#res');
      if(result)result.insertAdjacentHTML('beforeend',tag);
      const modalRoast=q('#mr');
      if(modalRoast)modalRoast.insertAdjacentHTML('beforeend',tag);
    }
    lastStreakDeath=false;
    updateTarget();
  };

  const baseStopStart=stopStart;
  stopStart=function(){
    baseStopStart();
    placeGhosts();
  };

  const baseStopStop=stopStop;
  stopStop=function(){
    if(!st.tgt)return baseStopStop();
    const oldRaw=localStorage.getItem(K('stop_best'));
    const old=oldRaw===null?null:+oldRaw;
    const c=st.tgt.x+st.tgt.w/2;
    const d=Math.abs(st.pos-c);
    const sc=Math.max(0,100-d/50*100);
    baseStopStop();
    if(old===null||sc>old)S('stop_bestD',d);
  };

  updateStreakBadge();
})();
