/* 99% IMPOSSIBLE — Petty Personality v4
   Safe additive personality expansion only.
   Does NOT touch gameplay, ads, Older Joe transport, or the voice toggle. */
(()=>{
  const pp=window.PettyPersonality;
  if(!pp||pp.__v4)return;
  pp.__v4=true;

  const L=(id,text,cooldown=5,weight=1,repeat=true)=>({id:'v4_'+id,text,cooldown,weight,repeat});
  const add=(name,lines)=>{if(!pp.pools[name])pp.pools[name]=[];pp.pools[name].push(...lines)};

  add('generic',[
    L('g01','Another attempt. Confidence remains fully funded.',6),
    L('g02','You have chosen persistence over evidence. Admirable, in a way.',7),
    L('g03','We return once again to the scene of the incident.',7),
    L('g04','The retry button is beginning to know you personally.',8),
    L('g05','I see the previous result has taught us absolutely nothing.',7),
    L('g06','This level of optimism should probably be regulated.',9),
    L('g07','The strategy appears unchanged. Fascinating commitment to the bit.',9),
    L('g08','I would suggest a different approach, but watching this is more entertaining.',10),
    L('g09','We are now operating almost entirely on confidence and muscle memory.',8),
    L('g10','At some point this becomes research. I think we passed that point.',10),
    L('g11','You pressed retry with remarkable conviction for someone with that evidence.',10),
    L('g12','There is courage, and then there is refusing to read the room.',11),
    L('g13','The game remains unchanged. Your optimism, somehow, has increased.',10),
    L('g14','I am beginning to respect the refusal to learn.',11),
    L('g15','Another data point for the ongoing investigation.',9),
    L('g16','The confidence-to-results ratio remains extraordinary.',12),
    L('g17','We have reached the phase where even I want to know how this ends.',12),
    L('g18','You know, stopping is technically available.',13),
    L('g19','Persistence is admirable. This specific persistence is under review.',11),
    L('g20','Again. With feeling, apparently.',8)
  ]);

  add('pb',[
    L('pb01','Oh no. You are improving.',7),
    L('pb02','A new best. This is becoming inconvenient.',8),
    L('pb03','That was better. I would like it noted that I object.',9),
    L('pb04','Progress has occurred despite my best expectations.',10),
    L('pb05','You are making it increasingly difficult to maintain my tone.',10),
    L('pb06','Fine. That was objectively good. I feel nothing.',11),
    L('pb07','A personal best. Please do not become confident again.',12),
    L('pb08','There it is. Growth. Disgusting.',12),
    L('pb09','I preferred you when the results were easier to mock.',13),
    L('pb10','Very good. I will now pretend I did not see it.',14),
    L('pb11','That improvement was annoyingly legitimate.',12),
    L('pb12','You have introduced competence into what was a very stable system.',14)
  ]);

  add('perfect',[
    L('pf01','No. Do it again. I do not trust that.',14),
    L('pf02','Perfect. How unnecessarily dramatic.',15),
    L('pf03','Well, that ruins several jokes I had prepared.',15),
    L('pf04','I reject the result on emotional grounds.',16),
    L('pf05','Perfect again and I will be contacting management.',17),
    L('pf06','That was flawless. I preferred the earlier version of you.',17),
    L('pf07','This is getting suspiciously competent.',18),
    L('pf08','You appear to have misunderstood your role in this relationship.',18),
    L('pf09','An unacceptable level of accuracy has been detected.',19),
    L('pf10','Fine. Perfect. Are you happy now?',20)
  ]);

  add('streak',[
    L('st01','And there it is. Balance has been restored.',8),
    L('st02','The streak has returned safely to zero.',9),
    L('st03','Momentum met reality. Reality won.',10),
    L('st04','That run was becoming dangerously respectable.',10),
    L('st05','I was almost proud of you. Thank you for correcting that.',11),
    L('st06','The streak is gone. I have canceled the parade.',12),
    L('st07','A beautiful run, interrupted by a familiar problem.',12),
    L('st08','You built momentum and then personally dismantled it.',13),
    L('st09','The comeback story has been postponed indefinitely.',14),
    L('st10','That streak died doing what it loved: trusting you.',15)
  ]);

  add('early',[
    L('e01','Nothing had happened yet. You simply volunteered a mistake.',9),
    L('e02','You reacted before reality had finished loading.',10),
    L('e03','An impressive response to an event that did not occur.',11),
    L('e04','The green light was still considering its options.',10),
    L('e05','Patience has once again left the premises.',11),
    L('e06','You managed to lose during the waiting portion.',12),
    L('e07','That was not reflex. That was anxiety with excellent timing.',13),
    L('e08','You have successfully anticipated the wrong future.',13),
    L('e09','We may need a separate game where the objective is not to touch anything.',14),
    L('e10','The button had not invited you yet.',12)
  ]);

  add('slow',[
    L('sl01','The green light had begun to worry about you.',9),
    L('sl02','Reaction confirmed. Delivery time: eventually.',10),
    L('sl03','I briefly considered checking your pulse.',11),
    L('sl04','The signal arrived first class. Your response came by freight.',12),
    L('sl05','That reaction had a loading screen.',11),
    L('sl06','The button gave you every possible opportunity.',12),
    L('sl07','Good news: you saw it. Eventually.',10),
    L('sl08','We could measure that response with a calendar.',13),
    L('sl09','The green light was beginning to feel ignored.',13),
    L('sl10','I have witnessed customer service respond faster.',14)
  ]);

  add('morning',[
    L('am01','Good morning. Nothing says fresh start like immediate judgment.',11),
    L('am02','The coffee has not even settled and here we are.',12),
    L('am03','A whole new day of opportunities. You selected this one.',13),
    L('am04','Morning. Your confidence appears to have recharged overnight.',13),
    L('am05','Starting early. Very responsible. The activity itself, less so.',14),
    L('am06','Rise and grind, apparently. Mostly grind.',15)
  ]);

  add('late',[
    L('late01','At this hour, every decision begins to look intentional.',12),
    L('late02','Sleep was available. You chose statistical humiliation instead.',13),
    L('late03','The responsible version of you has clearly gone to bed.',13),
    L('late04','It is late enough that this now counts as tomorrow’s bad decision.',14),
    L('late05','I am a narrator, not a sleep specialist, but even I have concerns.',15),
    L('late06','At this point the sun may beat you to a perfect score.',16)
  ]);

  add('returnShort',[
    L('rs01','That was quick. Did you forget to be done?',6),
    L('rs02','Back already. The separation anxiety is touching.',7),
    L('rs03','You barely left. I had not even finished judging the last session.',8),
    L('rs04','A dramatic exit followed by an immediate return. Classic.',9)
  ]);

  add('returnDay',[
    L('rd01','Welcome back. I see overnight reflection changed nothing.',10),
    L('rd02','A fresh day and the same deeply personal battle with a button.',11),
    L('rd03','You came back. I will update the case file.',12),
    L('rd04','Twenty four hours later, confidence has apparently regenerated.',12)
  ]);

  add('returnLong',[
    L('rl01','Well. Look who has returned to unfinished business.',14),
    L('rl02','I had begun to think you escaped.',15),
    L('rl03','You stayed away long enough to make this reunion disappointing.',16),
    L('rl04','Welcome back. The evidence has been preserved.',17),
    L('rl05','Time healed many things. Apparently not this relationship.',18)
  ]);

  // Session-level anti-repeat wrapper. Petty v2 already tracks long-term line
  // cooldowns; this adds a short rolling memory so the same few jokes do not
  // keep surfacing during one long session.
  const originalChoose=pp.choose?.bind(pp);
  const recent=[];
  if(originalChoose){
    pp.choose=function(lines){
      if(!Array.isArray(lines)||!lines.length)return originalChoose(lines);
      const filtered=lines.filter(x=>!recent.includes(x?.id));
      const source=filtered.length>=Math.min(3,lines.length)?filtered:lines;
      const picked=originalChoose(source);
      if(picked?.id){recent.push(picked.id);while(recent.length>10)recent.shift()}
      return picked;
    };
  }

  pp.version='4.0';
  pp.v4={recentLines:recent};
})();
