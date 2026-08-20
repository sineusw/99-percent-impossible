/* 99% IMPOSSIBLE — Petty slang pack v1
   Rare American slang for contrast with Older Joe's proper British delivery. */
(()=>{
  const pp=window.PettyPersonality;if(!pp||pp.__slangV1)return;pp.__slangV1=true;
  const L=(id,text,cooldown=14)=>({id:'slang_'+id,text,cooldown,repeat:true,weight:1});
  const add=(pool,lines)=>{if(!pp.pools[pool])pp.pools[pool]=[];pp.pools[pool].push(...lines)};
  add('generic',[
    L('g01','Fam, that was not even close. I say “fam” now. This is what you have done to me.',16),
    L('g02','Bro. Respectfully. No.',17),
    L('g03','My guy, the target was over there.',18),
    L('g04','Nah. Run that back. I cannot believe I just said “nah.”',19),
    L('g05','That attempt had zero aura. I have been informed this is devastating.',20),
    L('g06','Low-key tragic. I deeply resent knowing what “low-key” means.',21),
    L('g07','Fam. Be serious.',22),
    L('g08','You are cooked, mate. Apparently we are combining dialects now.',23)
  ]);
  add('early',[
    L('e01','Bro, the light had not even changed yet.',18),
    L('e02','My guy just reacted to absolutely nothing.',19),
    L('e03','Nah, that thumb was freelancing.',20)
  ]);
  add('slow',[
    L('s01','Fam, the green light had time to move on emotionally.',18),
    L('s02','Bro, that reaction came by standard shipping.',19),
    L('s03','My guy, we are measuring reflexes, not continental drift.',20)
  ]);
  add('streak',[
    L('st01','Nahhh. You sold the streak.',20),
    L('st02','Bro really had momentum and said “not for long.”',21),
    L('st03','That streak is cooked. Moment of silence, fam.',22)
  ]);
  add('pb',[
    L('pb01','Okay, fam. That was actually clean. Do not make me say that again.',22),
    L('pb02','My guy improved. This is becoming inconvenient.',23),
    L('pb03','Low-key impressive. High-key irritating.',24)
  ]);
  add('perfect',[
    L('p01','Nah. Perfect? Fam, I need to check the logs.',28),
    L('p02','Bro actually hit it. I am sick.',30),
    L('p03','That was clean, my guy. I hate this timeline.',32)
  ]);
})();