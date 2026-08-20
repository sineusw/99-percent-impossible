/* 99% IMPOSSIBLE — Petty slang pack v1.1: rare, short American slang */
(()=>{
  const pp=window.PettyPersonality;if(!pp||pp.__slangV1)return;pp.__slangV1=true;
  const L=(id,text,cooldown=14)=>({id:'slang_'+id,text,cooldown,repeat:true,weight:1});
  const add=(pool,lines)=>{if(!pp.pools[pool])pp.pools[pool]=[];pp.pools[pool].push(...lines)};
  add('generic',[L('g01','Fam, that was not even close.',16),L('g02','Bro. Respectfully. No.',17),L('g03','My guy, be serious.',18),L('g04','Nah. Run that back.',19),L('g05','That attempt had zero aura.',20),L('g06','Low-key tragic.',21),L('g07','Fam. Lock in.',22),L('g08','You are cooked, mate.',23),L('g09','Bro, what was the vision?',24),L('g10','My guy. Absolutely not.',25)]);
  add('early',[L('e01','Bro, it was not even green.',18),L('e02','My guy reacted to nothing.',19),L('e03','Nah, that thumb was freelancing.',20),L('e04','Fam, you pre-ordered the reaction.',21)]);
  add('slow',[L('s01','Fam, the green light moved on.',18),L('s02','Bro, that came by standard shipping.',19),L('s03','My guy, we said milliseconds.',20),L('s04','Nah. That reaction had layovers.',21)]);
  add('streak',[L('st01','Nahhh. You sold the streak.',20),L('st02','Bro had momentum for a second.',21),L('st03','That streak is cooked, fam.',22),L('st04','My guy fumbled the bag.',23)]);
  add('pb',[L('pb01','Okay, fam. That was clean.',22),L('pb02','My guy improved. Annoying.',23),L('pb03','Low-key impressive.',24),L('pb04','Okayyy. I see you.',25)]);
  add('perfect',[L('p01','Nah. Perfect? Check the logs.',28),L('p02','Bro actually hit it.',30),L('p03','That was clean, my guy.',32),L('p04','Fam, I am sick.',34)]);
})();