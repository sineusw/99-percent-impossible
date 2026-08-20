/* 99% IMPOSSIBLE — Petty Personality v1
   Standalone personality layer. No gameplay function patches.
   Adds contextual callbacks, petty achievements, return jokes,
   milestone jokes, and an optional device voice announcer. */
(()=>{
  const P=n=>'n99_petty_'+n;
  const get=(n,d=null)=>{const v=localStorage.getItem(P(n));return v===null?d:v};
  const set=(n,v)=>localStorage.setItem(P(n),String(v));
  const q=s=>document.querySelector(s);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const now=Date.now();
  let speaking=false,lastResultKey='',lastTotal=+(q('#tot')?.textContent||0),toastTimer=0;

  const style=document.createElement('style');
  style.textContent=`
    .petty-toast{position:fixed;left:50%;top:max(18px,env(safe-area-inset-top));transform:translateX(-50%) translateY(-18px);width:min(calc(100% - 28px),430px);z-index:75;opacity:0;pointer-events:none;background:linear-gradient(180deg,#17131d,#0d0a11);border:1px solid rgba(255,46,149,.35);border-radius:12px;padding:12px 14px;box-shadow:0 12px 30px rgba(0,0,0,.62),0 0 22px rgba(255,46,149,.16);transition:.22s ease;color:#fff;text-align:center;font-family:'Chakra Petch',system-ui,sans-serif}
    .petty-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
    .petty-toast .kicker{font-size:9px;letter-spacing:2px;font-weight:1000;color:var(--neon-pink,#FF2E95);margin-bottom:3px}
    .petty-toast b{display:block;font-family:'Teko','Arial Black',sans-serif;font-size:24px;line-height:1.02;letter-spacing:.6px;text-transform:uppercase}
    .petty-toast small{display:block;margin-top:3px;color:#aaa6b2;font-size:10px;font-weight:700}
    .petty-aside{margin:11px auto 2px;padding:8px 10px;max-width:340px;border:1px dashed rgba(255,255,255,.12);border-radius:8px;color:#b8b4c0;font-size:11px;font-weight:800;line-height:1.35}
    .petty-voice{position:fixed;left:14px;bottom:max(14px,env(safe-area-inset-bottom));z-index:40;width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.18);background:linear-gradient(180deg,#25202c,#121016);box-shadow:0 4px 14px rgba(0,0,0,.45);color:#fff;font-size:18px;touch-action:manipulation}
    .petty-voice.off{opacity:.55;filter:grayscale(.65)}
  `;
  document.head.appendChild(style);

  const toast=document.createElement('div');
  toast.className='petty-toast';
  toast.innerHTML='<div class="kicker">PETTY ACHIEVEMENT</div><b></b><small></small>';
  document.body.appendChild(toast);

  const voiceBtn=document.createElement('button');
  voiceBtn.className='petty-voice';
  voiceBtn.setAttribute('aria-label','Toggle Petty voice');
  document.body.appendChild(voiceBtn);

  function voiceOn(){return get('voice','1')==='1'}
  function syncVoiceBtn(){voiceBtn.textContent=voiceOn()?'🔊':'🔇';voiceBtn.classList.toggle('off',!voiceOn());voiceBtn.title=voiceOn()?'Petty Voice: ON':'Petty Voice: OFF'}
  voiceBtn.onclick=()=>{set('voice',voiceOn()?'0':'1');if(!voiceOn())window.speechSynthesis?.cancel();syncVoiceBtn();showToast('VOICE '+(voiceOn()?'ON':'OFF'),voiceOn()?'Classic Petty is listening.':'Fine. Suffer in silence.','PETTY SETTINGS',2200)};
  syncVoiceBtn();

  function chooseVoice(){
    const voices=window.speechSynthesis?.getVoices?.()||[];
    return voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en-/i.test(v.lang))||null;
  }
  function speak(text){
    if(!voiceOn()||!('speechSynthesis' in window)||!text||speaking)return;
    try{
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      const v=chooseVoice(); if(v)u.voice=v;
      u.lang=v?.lang||'en-GB';u.rate=.93;u.pitch=.88;u.volume=.9;
      speaking=true;u.onend=u.onerror=()=>{speaking=false};
      window.speechSynthesis.speak(u);
    }catch(e){speaking=false}
  }

  function showToast(title,sub='',kicker='PETTY ACHIEVEMENT',ms=3400,voice=''){
    clearTimeout(toastTimer);
    toast.querySelector('.kicker').textContent=kicker;
    toast.querySelector('b').textContent=title;
    toast.querySelector('small').textContent=sub;
    toast.classList.add('on');
    if(voice)speak(voice);
    toastTimer=setTimeout(()=>toast.classList.remove('on'),ms);
  }
  function achievement(id,title,sub,voice=''){
    if(get('ach_'+id)==='1')return false;
    set('ach_'+id,'1');showToast(title,sub,'PETTY ACHIEVEMENT',3800,voice);return true;
  }

  // Return / comeback callbacks. We only show these after a meaningful absence.
  const previousSeen=+(get('lastSeen','0')||0);
  set('lastSeen',now);
  if(previousSeen){
    const away=now-previousSeen;
    setTimeout(()=>{
      if(away>=24*60*60*1000){
        achievement('crawlback','LOOK WHO CAME CRAWLING BACK','Returned after pretending to have self-respect.','Oh good. We were worried you developed self respect.');
      }else if(away>=6*60*60*1000){
        showToast('WELCOME BACK','Thought you were done with us.','PETTY GAMES',3600,'Welcome back. Thought you were done with us.');
      }else if(away>=20*60*1000){
        showToast('OH, YOU’RE BACK','That break really fixed everything, huh?','PETTY GAMES',3400,'Oh. You are back.');
      }
    },900);
  }
  const seenBeat=setInterval(()=>set('lastSeen',Date.now()),15000);
  addEventListener('pagehide',()=>{set('lastSeen',Date.now());clearInterval(seenBeat)});

  const milestoneMap={
    10:['DENIAL','10 attempts. Still confident?','Ten attempts. Still confident?'],
    25:['THANKS FOR THE ENGAGEMENT','25 attempts. The metrics are loving you.','Twenty five attempts. Thanks for the engagement.'],
    50:['AT THIS POINT YOU WORK HERE','50 attempts. HR will be in touch.','At this point, you work here.'],
    100:['EMPLOYEE OF THE MONTH','100 attempts. Congratulations on your unpaid internship.','Congratulations on your unpaid internship.'],
    250:['THIS IS A LIFESTYLE NOW','250 attempts. We stopped judging. Almost.','Two hundred and fifty attempts. This is a lifestyle now.']
  };

  function onTotalChanged(){
    const total=+(q('#tot')?.textContent||0);
    if(total<=lastTotal){lastTotal=total;return}
    lastTotal=total;
    if(milestoneMap[total]){
      const [title,sub,voice]=milestoneMap[total];achievement('attempt_'+total,title,sub,voice);
    }
  }
  const tot=q('#tot');
  if(tot)new MutationObserver(onTotalChanged).observe(tot,{childList:true,characterData:true,subtree:true});

  const PB_LINES=['NEW PERSONAL BEST. Took you long enough.','Wait… you actually got better?','Progress detected. Annoying, but noted.'];
  const STREAK_LINES=['Streak dead. We’ll pretend that never happened.','That streak had a family.','And just like that… character development.'];
  const PERFECT_LINES=['Congratulations. We were starting to think you couldn’t read the instructions.','Oh. You actually did it. That’s inconvenient.','HE DID IT. EVERYBODY ACT SURPRISED.'];
  const EARLY_LINES=['The button wasn’t even ready for you.','You lost to a color that hadn’t appeared yet.','Patience lasted exactly zero business days.'];
  const SLOW_LINES=['The signal arrived eventually.','That reaction needed a connecting flight.','Good news: the button is still there.'];

  function addAside(text){
    const mr=q('#mr');if(!mr||!text)return;
    mr.querySelector('.petty-aside')?.remove();
    const d=document.createElement('div');d.className='petty-aside';d.textContent=text;mr.appendChild(d);
  }
  function handleResult(){
    const modal=q('#modal'); if(!modal||modal.classList.contains('hide'))return;
    const score=(q('#ms')?.textContent||'').trim();
    const game=(q('#mg')?.textContent||'').trim();
    const meta=(q('#mm')?.textContent||'').trim();
    const roast=(q('#mr')?.textContent||'').trim();
    const key=[game,score,meta,roast].join('|'); if(!score||key===lastResultKey)return;lastResultKey=key;

    let line='',voice='';
    const isPB=/NEW PERSONAL BEST/i.test(meta);
    const streakDead=/STREAK DEAD/i.test(roast);
    const perfect=(game==='PERFECT TIMER'&&/^1\.000s$/.test(score))||(game==='PERFECT STOP'&&parseFloat(score)>=99.95)||(game==='REACTION TEST'&&parseFloat(score)<=170);

    if(perfect){line=pick(PERFECT_LINES);voice=line;achievement('first_perfect','FINALLY.','You did the impossible. Please remain humble.','You actually did it. That is inconvenient.');}
    else if(streakDead){line=pick(STREAK_LINES);voice=line;}
    else if(isPB){line=pick(PB_LINES);voice=line;}
    else if(score==='TOO EARLY'){line=pick(EARLY_LINES);voice=line;}
    else if(game==='REACTION TEST'&&parseFloat(score)>=350){line=pick(SLOW_LINES);voice=line;}
    else if(Math.random()<.22){line=pick(['Oh, you’re still here? Excellent.','We appreciate your continued contribution to our metrics.','One more try. Surely this is the one. Surely.']);}

    if(line){setTimeout(()=>addAside(line),80);if(voice&&Math.random()<.7)setTimeout(()=>speak(voice),160)}
  }

  const modal=q('#modal');
  if(modal)new MutationObserver(handleResult).observe(modal,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});

  // Public event hook for future recorded voice packs. Later packs can listen
  // to this instead of touching gameplay code.
  window.PettyPersonality={
    version:'1.0',
    speak,
    showToast,
    achievement,
    emit(type,detail={}){document.dispatchEvent(new CustomEvent('petty:event',{detail:{type,...detail}}))}
  };
})();