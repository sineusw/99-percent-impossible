/* 99% IMPOSSIBLE — Petty Personality v2.1
   Standalone dialogue engine. No gameplay function patches.
   Adds time/day/holiday awareness, first-launch + return greetings,
   contextual memory, rarity/cooldowns, unique-line tracking and achievements. */
(()=>{
  const P=n=>'n99_petty_'+n;
  const get=(n,d=null)=>{const v=localStorage.getItem(P(n));return v===null?d:v};
  const set=(n,v)=>localStorage.setItem(P(n),String(v));
  const q=s=>document.querySelector(s);
  const now=Date.now();
  const session=+(get('session','0')||0)+1; set('session',session);
  let speaking=false,audioUnlocked=false,lastResultKey='',lastTotal=+(q('#tot')?.textContent||0),toastTimer=0,pendingGreeting=null;

  const style=document.createElement('style');
  style.textContent=`
    .petty-toast{position:fixed;left:50%;top:max(18px,env(safe-area-inset-top));transform:translateX(-50%) translateY(-18px);width:min(calc(100% - 28px),430px);z-index:75;opacity:0;pointer-events:none;background:linear-gradient(180deg,#17131d,#0d0a11);border:1px solid rgba(255,46,149,.35);border-radius:12px;padding:12px 14px;box-shadow:0 12px 30px rgba(0,0,0,.62),0 0 22px rgba(255,46,149,.16);transition:.22s ease;color:#fff;text-align:center;font-family:'Chakra Petch',system-ui,sans-serif}
    .petty-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
    .petty-toast .kicker{font-size:9px;letter-spacing:2px;font-weight:1000;color:var(--neon-pink,#FF2E95);margin-bottom:3px}
    .petty-toast b{display:block;font-family:'Teko','Arial Black',sans-serif;font-size:24px;line-height:1.02;letter-spacing:.6px;text-transform:uppercase}
    .petty-toast small{display:block;margin-top:3px;color:#aaa6b2;font-size:10px;font-weight:700}
    .petty-aside{margin:11px auto 2px;padding:8px 10px;max-width:340px;border:1px dashed rgba(255,255,255,.12);border-radius:8px;color:#b8b4c0;font-size:11px;font-weight:800;line-height:1.35}
    .petty-aside::before{content:'PETTY: ';color:var(--neon-pink,#FF2E95);letter-spacing:.7px}
    .petty-voice{position:fixed;left:14px;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 66px);z-index:40;width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.18);background:linear-gradient(180deg,#25202c,#121016);box-shadow:0 4px 14px rgba(0,0,0,.45);color:#fff;font-size:18px;touch-action:manipulation}
    .petty-voice.off{opacity:.55;filter:grayscale(.65)}
    body:has(#modal:not(.hide)) .petty-voice{opacity:.28;pointer-events:none}
  `;
  document.head.appendChild(style);

  const toast=document.createElement('div');toast.className='petty-toast';toast.innerHTML='<div class="kicker">PETTY ACHIEVEMENT</div><b></b><small></small>';document.body.appendChild(toast);
  const voiceBtn=document.createElement('button');voiceBtn.className='petty-voice';voiceBtn.setAttribute('aria-label','Toggle or test Petty voice');document.body.appendChild(voiceBtn);

  function voiceOn(){return get('voice','1')==='1'}
  function syncVoiceBtn(){voiceBtn.textContent=voiceOn()?'🔊':'🔇';voiceBtn.classList.toggle('off',!voiceOn());voiceBtn.title=voiceOn()?'Petty Voice: ON — tap to test':'Petty Voice: OFF — tap to turn on'}
  function chooseVoice(){const vs=window.speechSynthesis?.getVoices?.()||[];return vs.find(v=>/^en-GB/i.test(v.lang))||vs.find(v=>/^en-/i.test(v.lang))||null}
  function speak(text,force=false){
    if((!voiceOn()&&!force)||!('speechSynthesis' in window)||!text||speaking)return false;
    try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const v=chooseVoice();if(v)u.voice=v;u.lang=v?.lang||'en-GB';u.rate=.91;u.pitch=.86;u.volume=1;speaking=true;u.onstart=()=>{audioUnlocked=true};u.onend=u.onerror=()=>{speaking=false};window.speechSynthesis.speak(u);return true}catch(e){speaking=false;return false}
  }
  function showToast(title,sub='',kicker='PETTY ACHIEVEMENT',ms=3400,voice=''){clearTimeout(toastTimer);toast.querySelector('.kicker').textContent=kicker;toast.querySelector('b').textContent=title;toast.querySelector('small').textContent=sub;toast.classList.add('on');if(voice)speak(voice);toastTimer=setTimeout(()=>toast.classList.remove('on'),ms)}
  function achievement(id,title,sub,voice=''){if(get('ach_'+id)==='1')return false;set('ach_'+id,'1');showToast(title,sub,'PETTY ACHIEVEMENT',3900,voice);return true}

  voiceBtn.onclick=()=>{if(!voiceOn())set('voice','1');syncVoiceBtn();showToast('VOICE TEST','If you hear this, Petty can talk.','PETTY SETTINGS',2600);speaking=false;speak('Oh good. You can hear me now.',true)};
  let lastVoiceTap=0;voiceBtn.addEventListener('pointerup',()=>{const t=Date.now();if(t-lastVoiceTap<420){set('voice','0');window.speechSynthesis?.cancel();speaking=false;syncVoiceBtn();showToast('VOICE OFF','Fine. Suffer in silence.','PETTY SETTINGS',2200);lastVoiceTap=0}else lastVoiceTap=t});syncVoiceBtn();

  const heard=()=>{try{return JSON.parse(get('heard','{}'))||{}}catch{return {}}};
  const markHeard=id=>{const h=heard();h[id]={count:(h[id]?.count||0)+1,session,at:Date.now()};set('heard',JSON.stringify(h));set('unique',Object.keys(h).length)};
  function eligible(line){const h=heard()[line.id];if(!h)return true;const cd=line.cooldown??3;return session-(h.session||0)>=cd}
  function choose(lines){const pool=lines.filter(eligible);const src=pool.length?pool:lines.filter(x=>(x.repeat??true));if(!src.length)return null;const weighted=[];src.forEach(x=>{const w=x.weight??1;for(let i=0;i<w;i++)weighted.push(x)});const line=weighted[Math.floor(Math.random()*weighted.length)];markHeard(line.id);return line}
  const L=(id,text,cooldown=3,weight=1,repeat=true)=>({id,text,cooldown,weight,repeat});

  const pools={
    first:[L('first_1','Oh. You actually downloaded it. Welcome to 99% Impossible. Let’s see how long that confidence lasts.',999,1,false)],
    returnShort:[L('rs1','Back already? That was quick.',2),L('rs2','Oh. We’re doing this again?',2),L('rs3','That break really fixed everything, huh?',3),L('rs4','You missed me. Be honest.',4)],
    returnDay:[L('rd1','Welcome back. Yesterday wasn’t embarrassing enough?',5),L('rd2','Oh good. You came back voluntarily.',5),L('rd3','I see sleep did not cure the confidence.',5),L('rd4','Fresh day. Same dangerous optimism.',5)],
    returnLong:[L('rl1','LOOK WHO CAME CRAWLING BACK.',9),L('rl2','Well, well, well. Look who remembered this game exists.',8),L('rl3','I was beginning to think you developed self-respect.',10),L('rl4','Welcome back. I kept the receipts.',8)],
    late:[L('late1','It’s late. This is getting embarrassing for both of us.',6),L('late2','You do know sleep exists, yes?',6),L('late3','At this hour? Fine. One more. I want to see something.',7),L('late4','Nothing good happens after midnight. Your score history agrees.',8)],
    morning:[L('am1','Good morning. Starting the day with questionable decisions, are we?',6),L('am2','Morning. Failure before breakfast. Efficient.',7),L('am3','Rise and grind. Mostly grind.',7)],
    friday:[L('fri1','Friday night and you chose me? I’m touched.',8),L('fri2','It’s Friday. You could be doing anything. Yet here we are.',8)],
    monday:[L('mon1','Monday and you’re already making poor decisions.',8),L('mon2','New week. Same button. Same confidence.',8)],
    pb:[L('pb1','New personal best. Took you long enough.',4),L('pb2','Wait… you actually got better?',4),L('pb3','Progress detected. Annoying, but noted.',5),L('pb4','That was impressive. Don’t make this weird.',6),L('pb5','Fine. I’ll admit that was decent.',7)],
    streak:[L('st1','Streak dead. We’ll pretend that never happened.',4),L('st2','That streak had a family.',5),L('st3','And just like that… character development.',5),L('st4','I watched that streak die in real time.',6)],
    perfect:[L('pf1','Oh. You actually did it. That’s inconvenient.',8),L('pf2','Congratulations. I was starting to think you couldn’t read the instructions.',9),L('pf3','Everybody act surprised. You actually did it.',9),L('pf4','Right. I don’t want to talk about it.',10),L('pf5','Glitch.',12)],
    early:[L('e1','The button wasn’t even ready for you.',4),L('e2','You lost to a color that hadn’t appeared yet.',5),L('e3','Patience lasted exactly zero business days.',5),L('e4','Would you like me to explain what wait means?',6),L('e5','Impressive. You reacted to absolutely nothing.',6)],
    slow:[L('sl1','The signal arrived eventually.',4),L('sl2','That reaction needed a connecting flight.',5),L('sl3','Good news: the button is still there.',5),L('sl4','I’ve seen faster paperwork.',6),L('sl5','The green had time to reflect on its life choices.',7)],
    generic:[L('g1','Oh, you’re still here? Excellent.',5),L('g2','We appreciate your continued contribution to our metrics.',7),L('g3','One more try. Surely this is the one. Surely.',6),L('g4','You seem very committed to proving a point.',6),L('g5','Again? I respect the delusion.',7),L('g6','Take your time. I’ve nowhere else to be.',8)],
    adBefore:[L('ad1','Right. I need to pay rent. Here’s an advert.',6),L('ad2','Don’t move. Capitalism.',7),L('ad3','Time for our corporate overlords.',8),L('ad4','You know, there is a button that makes these disappear.',10)],
    adAfter:[L('ada1','And we’re back. Capitalism.',7),L('ada2','Thank you for your involuntary contribution.',8),L('ada3','Excellent. The lights stay on another day.',8)]
  };

  function fourthThursday(year,month){let d=new Date(year,month,1);let count=0;while(d.getMonth()===month){if(d.getDay()===4&&++count===4)return d.getDate();d.setDate(d.getDate()+1)}return -1}
  function holidayInfo(d){const m=d.getMonth(),day=d.getDate(),y=d.getFullYear();if(m===0&&day===1)return ['NEW YEAR’S DAY','Fresh year. Clean slate. Unfortunately, I kept your stats.'];if(m===1&&day===14)return ['VALENTINE’S DAY','Happy Valentine’s Day. Nothing says romance like arguing with a timing game.'];if(m===9&&day===31)return ['HALLOWEEN','Happy Halloween. Your score history is frightening enough already.'];if(m===10&&day===fourthThursday(y,10))return ['THANKSGIVING','Happy Thanksgiving. I’m grateful for you. Mostly because you keep the engagement numbers up.'];if(m===11&&day===25)return ['CHRISTMAS','Merry Christmas. Your gift is another attempt.'];if(m===11&&day===31)return ['NEW YEAR’S EVE','New year, new you. We’ll see.'];return null}

  const previousSeen=+(get('lastSeen','0')||0);const firstEver=get('introSeen')!=='1';const away=previousSeen?now-previousSeen:0;
  set('lastSeen',now);
  function buildGreeting(){
    const d=new Date(),h=d.getHours(),day=d.getDay(),holiday=holidayInfo(d);
    if(firstEver)return {text:pools.first[0].text,kicker:'PETTY GAMES',title:'WELCOME TO 99% IMPOSSIBLE',sub:'This seemed like a good idea at the time.',first:true};
    if(holiday)return {text:holiday[1],kicker:'PETTY HOLIDAY SPECIAL',title:holiday[0],sub:'Yes, Petty checked the calendar.'};
    let line=null;
    if(away>=3*24*60*60*1000)line=choose(pools.returnLong);
    else if(away>=20*60*60*1000)line=choose(pools.returnDay);
    else if(away>=20*60*1000)line=choose(pools.returnShort);
    if(!line){if(h>=0&&h<5)line=choose(pools.late);else if(h>=5&&h<9)line=choose(pools.morning);else if(day===5&&h>=17)line=choose(pools.friday);else if(day===1&&h<12)line=choose(pools.monday)}
    return line?{text:line.text,kicker:'PETTY GAMES',title:'OH. YOU AGAIN.',sub:'Petty remembers.'}:null
  }
  pendingGreeting=buildGreeting();
  const unlockGreeting=e=>{if(e.target===voiceBtn||!pendingGreeting||!voiceOn())return;const g=pendingGreeting;pendingGreeting=null;if(g.first)set('introSeen','1');setTimeout(()=>{showToast(g.title,g.sub,g.kicker,3600);speak(g.text,true)},500);removeEventListener('pointerdown',unlockGreeting,true)};
  addEventListener('pointerdown',unlockGreeting,true);

  const seenBeat=setInterval(()=>set('lastSeen',Date.now()),15000);addEventListener('pagehide',()=>{set('lastSeen',Date.now());clearInterval(seenBeat)});

  const milestoneMap={10:['DENIAL','10 attempts. Still confident?','Ten attempts. Still confident?'],25:['THANKS FOR THE ENGAGEMENT','25 attempts. The metrics are loving you.','Twenty five attempts. Thanks for the engagement.'],50:['AT THIS POINT YOU WORK HERE','50 attempts. HR will be in touch.','At this point, you work here.'],100:['EMPLOYEE OF THE MONTH','100 attempts. Congratulations on your unpaid internship.','Congratulations on your unpaid internship.'],250:['THIS IS A LIFESTYLE NOW','250 attempts. We stopped judging. Almost.','Two hundred and fifty attempts. This is a lifestyle now.']};
  function onTotalChanged(){const total=+(q('#tot')?.textContent||0);if(total<=lastTotal){lastTotal=total;return}lastTotal=total;if(milestoneMap[total]){const [title,sub,voice]=milestoneMap[total];achievement('attempt_'+total,title,sub,voice)}const unique=+(get('unique','0')||0);if(unique>=100)achievement('heard100','PETTY MUCH?','Heard 100 unique Petty lines. This relationship is getting serious.','You have heard one hundred unique insults. Seek enrichment.')}
  const tot=q('#tot');if(tot)new MutationObserver(onTotalChanged).observe(tot,{childList:true,characterData:true,subtree:true});

  function addAside(text){const mr=q('#mr');if(!mr||!text)return;mr.querySelector('.petty-aside')?.remove();const d=document.createElement('div');d.className='petty-aside';d.textContent=text;mr.appendChild(d)}
  function handleResult(){
    const modal=q('#modal');if(!modal||modal.classList.contains('hide'))return;
    const score=(q('#ms')?.textContent||'').trim(),game=(q('#mg')?.textContent||'').trim(),meta=(q('#mm')?.textContent||'').trim(),roast=(q('#mr')?.childNodes?.[0]?.textContent||q('#mr')?.textContent||'').trim();
    const key=[game,score,meta].join('|');if(!score||key===lastResultKey)return;lastResultKey=key;
    const isPB=/NEW PERSONAL BEST/i.test(meta),streakDead=/STREAK DEAD/i.test(roast),perfect=(game==='PERFECT TIMER'&&/^1\.000s$/.test(score))||(game==='PERFECT STOP'&&parseFloat(score)>=99.95)||(game==='REACTION TEST'&&parseFloat(score)<=170);
    let pool=null;
    if(perfect){pool=pools.perfect;achievement('first_perfect','FINALLY.','You did the impossible. Please remain humble.','')}
    else if(streakDead)pool=pools.streak;
    else if(isPB)pool=pools.pb;
    else if(score==='TOO EARLY')pool=pools.early;
    else if(game==='REACTION TEST'&&parseFloat(score)>=350)pool=pools.slow;
    else if(Math.random()<.24)pool=pools.generic;
    if(pool){const line=choose(pool);if(line){setTimeout(()=>addAside(line.text),80);setTimeout(()=>speak(line.text),180)}}
  }
  const modal=q('#modal');if(modal)new MutationObserver(handleResult).observe(modal,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});

  document.addEventListener('petty:ad-before',()=>{if(Math.random()<.35){const x=choose(pools.adBefore);if(x)speak(x.text)}});
  document.addEventListener('petty:ad-after',()=>{if(Math.random()<.45){const x=choose(pools.adAfter);if(x)speak(x.text)}});

  window.PettyPersonality={version:'2.1',speak,showToast,achievement,choose,pools,get audioUnlocked(){return audioUnlocked},get uniqueLines(){return +(get('unique','0')||0)},emit(type,detail={}){document.dispatchEvent(new CustomEvent('petty:event',{detail:{type,...detail}}))}};
})();