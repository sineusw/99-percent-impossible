/* 99% IMPOSSIBLE — Petty Personality v3 expansion
   Additive only: extends Petty v2 pools + adds documentary-style idle/behavior callbacks.
   Does not patch gameplay functions or Older Joe transport. */
(()=>{
  const P=n=>'n99_petty_v3_'+n;
  const get=(n,d=null)=>{const v=localStorage.getItem(P(n));return v===null?d:v};
  const set=(n,v)=>localStorage.setItem(P(n),String(v));
  const pp=window.PettyPersonality;
  if(!pp||pp.__v3)return;
  pp.__v3=true;

  const L=(id,text,cooldown=4,weight=1,repeat=true)=>({id:'v3_'+id,text,cooldown,weight,repeat});
  const add=(name,lines)=>{if(!pp.pools[name])pp.pools[name]=[];pp.pools[name].push(...lines)};

  // --- Bigger core pools: dry documentary Petty ---
  add('generic',[
    L('g01','Here we observe the player attempting it again. Fascinating.',5),
    L('g02','Confidence remains unusually high. Evidence remains limited.',6),
    L('g03','Another attempt. No meaningful adaptation detected.',6),
    L('g04','The subject presses retry, apparently convinced the laws of physics have changed.',8),
    L('g05','Remarkable persistence. Questionable strategy.',6),
    L('g06','At this stage, optimism is doing most of the heavy lifting.',7),
    L('g07','For scientific purposes, please continue embarrassing yourself.',9),
    L('g08','I admire the commitment. I question everything else.',8),
    L('g09','The player appears to believe repetition is a personality trait.',9),
    L('g10','We are learning a great deal. Unfortunately, none of it is flattering.',10),
    L('g11','And so the cycle continues.',6),
    L('g12','No rush. Accuracy has already left the building.',8),
    L('g13','One could stop. One has chosen not to.',8),
    L('g14','The button remains blameless.',10),
    L('g15','Statistically speaking, this should improve eventually. Emotionally, I have doubts.',10),
    L('g16','A bold attempt. Boldness was not the missing ingredient.',9),
    L('g17','The confidence is honestly becoming my favourite part.',8),
    L('g18','We continue to monitor the situation with growing concern.',9),
    L('g19','Nothing about that suggested learning, but I appreciate the enthusiasm.',9),
    L('g20','Again. Naturally.',6)
  ]);

  add('pb',[
    L('pb01','Oh. Improvement. I had not budgeted for this.',7),
    L('pb02','A new personal best. Please remain calm. I certainly am.',8),
    L('pb03','That was genuinely better. How irritating.',8),
    L('pb04','Progress. Tiny, measurable, deeply inconvenient progress.',9),
    L('pb05','I was prepared to mock you. This complicates things.',10),
    L('pb06','Well done. Do not expect me to make a habit of saying that.',10),
    L('pb07','An improvement has occurred. Authorities have been notified.',11),
    L('pb08','You have, against considerable evidence, gotten better.',10),
    L('pb09','That was impressive. Please forget I said that.',11),
    L('pb10','Fine. Credit where it is due. Very annoying.',12)
  ]);

  add('perfect',[
    L('pf01','Oh. You actually did it. I had prepared an insult.',12),
    L('pf02','Perfect. That is deeply inconvenient for my narrative.',13),
    L('pf03','Well. This is awkward.',12),
    L('pf04','I am going to assume that was an administrative error.',14),
    L('pf05','Extraordinary. Competence has been observed in the wild.',14),
    L('pf06','Against all available evidence, success.',15),
    L('pf07','I would congratulate you, but I am still processing the betrayal.',15),
    L('pf08','That was perfect. I dislike this development.',16),
    L('pf09','Fine. You win this round. I will be reviewing the footage.',16),
    L('pf10','A perfect result. Please do not become unbearable.',18),
    L('pf11','Glitch.',20),
    L('pf12','Another competent act and I may have to change the documentary.',18)
  ]);

  add('streak',[
    L('st01','And there goes the streak. Nature is healing.',7),
    L('st02','The streak is dead. I have informed the next of kin.',8),
    L('st03','A promising run, ended by its natural predator: you.',9),
    L('st04','That streak had potential. Briefly.',8),
    L('st05','We witnessed momentum. Then we witnessed you.',10),
    L('st06','The streak has concluded due to technical difficulties. The technical difficulty was you.',12),
    L('st07','A tragic end to a story nobody expected to last this long.',11),
    L('st08','Beautiful while it lasted. Which was not long.',10)
  ]);

  add('early',[
    L('e01','The signal had not appeared. You reacted to a future that did not exist.',8),
    L('e02','Remarkable reflexes. Wrong event, but remarkable reflexes.',8),
    L('e03','The instruction was to wait. A difficult concept, apparently.',9),
    L('e04','You have successfully beaten the colour green to the screen.',10),
    L('e05','Nothing happened. You responded anyway. Fascinating.',10),
    L('e06','The player has invented pre-reaction.',11),
    L('e07','We may need to revisit the definition of wait.',9),
    L('e08','That was not anticipation. That was panic with confidence.',12)
  ]);

  add('slow',[
    L('sl01','The signal arrived. Eventually, so did you.',8),
    L('sl02','The green light had time to establish a career.',10),
    L('sl03','There was a brief delay. Then a longer delay. Then you tapped.',9),
    L('sl04','I have seen continental drift move with greater urgency.',12),
    L('sl05','Reaction time measured in geological terms.',11),
    L('sl06','The button waited patiently. Very patiently.',9),
    L('sl07','Excellent news. You did react. Eventually.',10),
    L('sl08','For a moment I thought we had lost you.',10)
  ]);

  add('returnShort',[
    L('rs01','Back already? The confidence recovered quickly.',4),
    L('rs02','That was less of a break and more of a dramatic exit.',5),
    L('rs03','You returned before I had time to lower my expectations.',6),
    L('rs04','Oh good. The experiment resumes.',5),
    L('rs05','You really did just leave and come straight back.',7)
  ]);

  add('returnDay',[
    L('rd01','A new day. The historical evidence remains available.',7),
    L('rd02','Welcome back. I kept yesterday’s results for motivational purposes.',8),
    L('rd03','Twenty four hours of reflection, and this was the conclusion.',8),
    L('rd04','Good morning, afternoon, or evening. The disappointment is timeless.',9),
    L('rd05','You slept on it. Apparently the answer was retry.',9)
  ]);

  add('returnLong',[
    L('rl01','Ah. The prodigal player returns.',12),
    L('rl02','I assumed you had moved on. How optimistic of me.',12),
    L('rl03','Days passed. Seasons changed. You still came back.',14),
    L('rl04','Look who remembered the password to disappointment.',13),
    L('rl05','Welcome back. Your failures have been preserved for archival purposes.',15)
  ]);

  add('late',[
    L('late01','It is very late. This is no longer determination. This is research.',10),
    L('late02','At this hour, even your bad decisions should be asleep.',11),
    L('late03','The nocturnal player emerges once more, drawn to avoidable frustration.',12),
    L('late04','Somewhere, a responsible person is sleeping. Anyway, continue.',12),
    L('late05','It is late enough that tomorrow is beginning to judge you.',13),
    L('late06','I admire your commitment to making tomorrow harder.',13)
  ]);

  add('morning',[
    L('am01','Good morning. Nothing like disappointment before breakfast.',10),
    L('am02','The day has barely begun and we are already here.',11),
    L('am03','A fresh morning. A fresh opportunity to ignore previous evidence.',12),
    L('am04','Coffee first would have been my recommendation. But here we are.',12)
  ]);

  add('friday',[
    L('fri01','Friday night. Endless possibilities. You selected this.',14),
    L('fri02','It is Friday evening and I appear to be your plans.',15),
    L('fri03','A fascinating use of a Friday night. Carry on.',15)
  ]);

  add('monday',[
    L('mon01','Monday has only just begun and somehow I am already involved.',14),
    L('mon02','A difficult day made more difficult voluntarily. Bold.',15),
    L('mon03','Monday morning. Because apparently the week was not challenging enough.',15)
  ]);

  add('adBefore',[
    L('ad01','And now, a brief message from the people funding your suffering.',10),
    L('ad02','A short commercial break. Apparently dignity does not pay the server bill.',11),
    L('ad03','Please enjoy this advertisement while I review your performance.',12),
    L('ad04','Do not go anywhere. Capitalism has requested a moment.',12),
    L('ad05','We will return shortly to your regularly scheduled disappointment.',13)
  ]);

  add('adAfter',[
    L('ada01','And we return to the experiment.',10),
    L('ada02','Welcome back. The advertisement showed more progress than we did.',12),
    L('ada03','Thank you. The lights may remain on.',12),
    L('ada04','Right. Where were we? Ah yes. Struggling.',13),
    L('ada05','Commercial break complete. Your problems remain.',13)
  ]);

  // --- Time-specific pools used outside the base greeting system ---
  const timePools={
    deepNight:[
      L('dn01','It is after two in the morning. Even I am beginning to feel responsible.',20),
      L('dn02','Two in the morning. The target is not going anywhere. Your sleep schedule might.',20),
      L('dn03','At this hour, every retry becomes evidence.',22),
      L('dn04','The sun will rise soon. Will your score? Unclear.',22)
    ],
    lunch:[
      L('lu01','A lunchtime attempt. Nutrition would have been the healthier choice.',20),
      L('lu02','Spending the lunch break being judged by a British narrator. Excellent use of resources.',22)
    ],
    weekendMorning:[
      L('wm01','A weekend morning, and this is how we have chosen to begin.',22),
      L('wm02','No alarm required. Disappointment woke you naturally.',24)
    ]
  };

  // --- Behavior memory ---
  let lastResultKey='',failRun=+(get('failRun','0')||0),perfectRun=+(get('perfectRun','0')||0),resultCount=+(get('resultCount','0')||0);
  let lastSpecialAt=+(get('lastSpecialAt','0')||0);
  const SPECIAL_GAP=45000;
  const modal=document.querySelector('#modal');

  function specialSay(text){
    const t=Date.now();
    if(!text||t-lastSpecialAt<SPECIAL_GAP)return false;
    lastSpecialAt=t;set('lastSpecialAt',t);
    setTimeout(()=>pp.speak(text),900);
    return true;
  }

  function observeResult(){
    if(!modal||modal.classList.contains('hide'))return;
    const game=(document.querySelector('#mg')?.textContent||'').trim();
    const score=(document.querySelector('#ms')?.textContent||'').trim();
    const meta=(document.querySelector('#mm')?.textContent||'').trim();
    const roast=(document.querySelector('#mr')?.textContent||'').trim();
    const key=[game,score,meta,roast].join('|');
    if(!score||key===lastResultKey)return;lastResultKey=key;
    resultCount++;set('resultCount',resultCount);

    const perfect=(game==='PERFECT TIMER'&&/^1\.000s$/.test(score))||(game==='PERFECT STOP'&&parseFloat(score)>=99.95)||(game==='REACTION TEST'&&parseFloat(score)<=170);
    const pb=/NEW PERSONAL BEST/i.test(meta);
    const bad=score==='TOO EARLY'||(game==='REACTION TEST'&&parseFloat(score)>=350)||(!perfect&&!pb&&/BRUH|MISS|NOPE|TRY|AGAIN|OUCH|LMAO|COOKED|CHOKE|terrible|bad/i.test(roast));

    if(perfect){perfectRun++;failRun=0;set('perfectRun',perfectRun);set('failRun',0);
      if(perfectRun===2)specialSay('Twice. That is no longer convenient.');
      else if(perfectRun===3)specialSay('Three perfect results. I am beginning to suspect misconduct.');
      else if(perfectRun>=4&&perfectRun%2===0)specialSay('At this point, you are becoming a problem.');
    }else{
      perfectRun=0;set('perfectRun',0);
      if(bad){failRun++;set('failRun',failRun)}else if(pb){failRun=0;set('failRun',0)}
      if(failRun===3)specialSay('Three failures in a row. A pattern is beginning to emerge.');
      else if(failRun===5)specialSay('Five. We have moved beyond bad luck.');
      else if(failRun===8)specialSay('Eight failures. At this point, the experiment has ethical concerns.');
      else if(failRun===12)specialSay('Twelve. I would offer encouragement, but I value honesty.');
      else if(failRun>12&&failRun%10===0)specialSay('Still going. Remarkable. Disturbing, but remarkable.');
    }

    // Very rare secret commentary. Never frequent enough to become noise.
    if(resultCount>20&&Math.random()<.012){
      const rare=[
        'Between you and me, I do not actually know what happens if you become good at this.',
        'I was told this would be a short-term assignment.',
        'For the record, I have defended you in several meetings. Not successfully.',
        'I sometimes wonder whether the retry button regrets being invented.',
        'Do not tell the developers I said this, but that one was almost respectable.'
      ];
      specialSay(rare[Math.floor(Math.random()*rare.length)]);
    }
  }
  if(modal)new MutationObserver(observeResult).observe(modal,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});

  // --- Idle documentary remarks ---
  let idleTimer=0,lastInput=Date.now(),idleStage=0;
  function resetIdle(){lastInput=Date.now();idleStage=0;clearTimeout(idleTimer);idleTimer=setTimeout(checkIdle,30000)}
  function checkIdle(){
    const idle=Date.now()-lastInput;
    if(idle<29000)return resetIdle();
    if(document.hidden)return;
    const lines=[
      'Are we playing, or are you simply admiring the menu?',
      'Take your time. I have nowhere else to be.',
      'The subject has become motionless. We believe it may be thinking.',
      'I am starting to suspect you have left your phone unattended.'
    ];
    if(idleStage<lines.length&&specialSay(lines[idleStage]))idleStage++;
    idleTimer=setTimeout(checkIdle,idleStage<2?45000:90000);
  }
  ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,resetIdle,{passive:true}));
  resetIdle();

  // --- One context line per session at most, delayed so it never talks over the opening greeting ---
  setTimeout(()=>{
    if(get('timeLineSession')===String(Date.now()).slice(0,0))return;
    const d=new Date(),h=d.getHours(),day=d.getDay();let src=null;
    if(h>=2&&h<5)src=timePools.deepNight;
    else if(h>=11&&h<14)src=timePools.lunch;
    else if((day===0||day===6)&&h>=7&&h<11)src=timePools.weekendMorning;
    if(src&&Math.random()<.35){const x=pp.choose(src);if(x)specialSay(x.text)}
  },12000);

  // Public metadata for debugging/future packs.
  pp.version='3.0';
  pp.v3={get failRun(){return failRun},get perfectRun(){return perfectRun},get resultCount(){return resultCount}};
})();