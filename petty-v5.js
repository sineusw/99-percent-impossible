/* 99% IMPOSSIBLE — Petty Personality v5
   Adds sharper writing and protects ad banter from normal Petty chatter.
   Does NOT replace Older Joe, gameplay, or the working volume toggle. */
(()=>{
  const pp=window.PettyPersonality;
  if(!pp||pp.__v5)return;
  pp.__v5=true;

  const L=(id,text,cooldown=6,weight=1,repeat=true)=>({id:'v5_'+id,text,cooldown,weight,repeat});
  const add=(name,lines)=>{if(!pp.pools[name])pp.pools[name]=[];pp.pools[name].push(...lines)};

  add('generic',[
    L('g01','You pressed retry so confidently I almost checked whether the score had changed.',8),
    L('g02','A fresh attempt, powered entirely by selective memory.',9),
    L('g03','The previous result has been reviewed and, apparently, ignored.',9),
    L('g04','I admire how quickly evidence becomes irrelevant to you.',10),
    L('g05','There is something beautiful about confidence with no supporting documentation.',11),
    L('g06','You are treating the retry button like an appeal process.',11),
    L('g07','Another attempt. The board has asked whether we have a strategy.',12),
    L('g08','I would call this persistence, but persistence usually learns something.',12),
    L('g09','You have mistaken emotional commitment for statistical advantage.',13),
    L('g10','At this point, even the button is just being polite.',13),
    L('g11','The confidence is premium. The results remain on the free plan.',14),
    L('g12','You keep returning like the last score was merely a rumour.',14)
  ]);

  add('pb',[
    L('pb01','A personal best. I had already written the insult. Very inconsiderate.',10),
    L('pb02','That was genuinely better. Please stop damaging the brand.',11),
    L('pb03','Progress detected. I will be filing a complaint.',12),
    L('pb04','You improved. I would like the record to show I was against it.',12),
    L('pb05','A new best. This relationship is becoming less convenient for me.',13),
    L('pb06','Fine. That was good. I hope you enjoyed that sentence. It was expensive.',14)
  ]);

  add('perfect',[
    L('pf01','Perfect. I am going to need a moment and possibly legal counsel.',16),
    L('pf02','That was flawless. Frankly, it feels off-brand.',17),
    L('pf03','Perfect. Please remain where you are while we investigate.',18),
    L('pf04','Well done. I have temporarily run out of disrespect.',19),
    L('pf05','That was perfect. I preferred the arrangement where I was superior.',20),
    L('pf06','Congratulations. You have made this unnecessarily difficult for the narrator.',20)
  ]);

  add('streak',[
    L('st01','And the streak is gone. I knew stability would return.',11),
    L('st02','That streak had a future. Then you became involved.',12),
    L('st03','Momentum has left the chat after citing creative differences.',13),
    L('st04','A strong run, ended by an internal management issue.',14),
    L('st05','The streak died suddenly. Investigators are not seeking other suspects.',15)
  ]);

  add('early',[
    L('e01','You reacted to absolutely nothing with tremendous confidence.',11),
    L('e02','The light had not changed. Your thumb simply filed its own paperwork.',12),
    L('e03','You lost a reaction test before there was anything to react to. Efficient.',13),
    L('e04','That was less anticipation and more a hostile takeover by your thumb.',14),
    L('e05','You have once again mistaken impatience for psychic ability.',14)
  ]);

  add('slow',[
    L('sl01','The green light was considering a welfare check.',11),
    L('sl02','That response arrived with complimentary ground shipping.',12),
    L('sl03','The signal was immediate. Your participation was optional, apparently.',13),
    L('sl04','I have seen terms and conditions accepted faster.',14),
    L('sl05','The button had enough time to reconsider the relationship.',15)
  ]);

  add('morning',[
    L('am01','Good morning. You have chosen judgment before lunch. Efficient.',13),
    L('am02','Nothing like starting the day by being audited by a British voice.',14),
    L('am03','Your day had potential. Then you opened this.',15)
  ]);

  add('late',[
    L('late01','At this hour, even poor judgment should be on airplane mode.',14),
    L('late02','You are now sacrificing tomorrow for a score you will probably dislike tonight.',15),
    L('late03','This has crossed from persistence into documentary evidence.',16)
  ]);

  // Normal commentary must never cancel a commercial setup/outro.
  // ads.js uses the speech transport directly for those two lines.
  const originalSpeak=pp.speak?.bind(pp);
  if(originalSpeak){
    pp.speak=function(text,force=false){
      if(window.__PETTY_AD_BANTER_LOCK&&!force)return false;
      return originalSpeak(text,force);
    };
  }

  pp.version='5.0';
})();
