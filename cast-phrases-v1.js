/* 99% IMPOSSIBLE — Daisy + Mick cast libraries v1
   192 deterministic lines per character, matching/exceeding Petty-scale variety. */
(function(root,factory){const x=factory();if(typeof module==='object'&&module.exports)module.exports=x;else root.N99CastPhrases=x})(typeof globalThis!=='undefined'?globalThis:this,function(){
const mix=(who,key,a,b,n)=>Array.from({length:n},(_,i)=>({id:`${who}_${key}_${String(i+1).padStart(2,'0')}`,text:`${a[i%a.length]}${b[Math.floor(i/a.length)%b.length]}`}));
const make=(who,tone)=>({
 timer:mix(who,'timer',tone.timerA,tone.timerB,20),stop:mix(who,'stop',tone.stopA,tone.stopB,20),reaction:mix(who,'reaction',tone.reactA,tone.reactB,20),early:mix(who,'early',tone.earlyA,tone.earlyB,16),
 suspicious:mix(who,'suspicious',tone.susA,tone.susB,12),slow:mix(who,'slow',tone.slowA,tone.slowB,12),good:mix(who,'good',tone.goodA,tone.goodB,12),veryClose:mix(who,'veryClose',tone.closeA,tone.closeB,12),pb:mix(who,'pb',tone.pbA,tone.pbB,12),perfect:mix(who,'perfect',tone.perfA,tone.perfB,12),streak:mix(who,'streak',tone.streakA,tone.streakB,12),generic:mix(who,'generic',tone.genA,tone.genB,12),interrupt:mix(who,'interrupt',tone.intA,tone.intB,16),respect:mix(who,'respect',tone.resA,tone.resB,4)
});
const daisy=make('daisy',{
 timerA:['Oh honey… ','Sweetheart, ','Aww baby… ','Bless your heart, '],timerB:['were we counting or just hoping?','one second should not be winning this fight.','that guess had entirely too much confidence.','the clock is starting to take this personally.','let us try that little second again.'],
 stopA:['Sweetie… ','Oh baby, ','Honey, ','Aww sweetheart, '],stopB:['the box was right there.','where exactly were we aiming?','the target was not hiding from you.','that aim went on a little vacation.','open those pretty eyes next round.'],
 reactA:['Oh baby… ','Sweetheart, ','Aww honey, ','Bless your heart, '],reactB:['we were waiting on you.','green means go, not eventually.','your thumb needed a meeting first?','that reaction came with standard shipping.','the light had time to get comfortable.'],
 earlyA:['Girl— ','Sweetheart! ','Oh honey… ','Baby, '],earlyB:['the light was not even green yet.','we said wait.','you just reacted to absolutely nothing.','that was panic with confidence.'],
 susA:['Ummm… ','Okay baby… ','Sweetheart… ','Mmm-hmm… '],susB:['are you a robot? Because I am watching you.','that was suspiciously fast.','humans usually need a little more time than that.'],
 slowA:['Oh honey… ','Baby… ','Sweetheart… ','Aww… '],slowB:['wake that thumb up.','the green light was getting lonely.','we cannot be moving at museum speed.'],
 goodA:['Okayyy! ','Aww, ','Well now… ','Mmm! '],goodB:['look at you doing something right.','there is hope for you after all.','that was actually kind of clean.'],
 closeA:['Awww… ','Oh baby… ','Sweetheart… ','Honey… '],closeB:['you were so close. That is actually tragic.','that one hurt me a little.','you were right there and still lost it.'],
 pbA:['Okayyy! ','Well now… ','Aww baby, ','Sweetheart, '],pbB:['a new personal best. Look at you improving.','somebody has been practicing.','I am almost proud of you.'],
 perfA:['Okayyy! ','Oh! ','Well sweetheart… ','Aww baby… '],perfB:['look at you actually being good at something.','that was perfect. Do not become annoying.','I had a roast ready and everything.'],
 streakA:['Aww… ','Oh baby… ','Sweetheart… ','Honey… '],streakB:['there goes your little streak.','you had momentum and everything.','I was starting to believe in you.'],
 genA:['Oh honey… ','Sweetheart… ','Aww baby… ','Bless your heart… '],genB:['be serious.','we are going to pretend that did not happen.','run that little disaster back.'],
 intA:['Excuse me? ','Oh, sweetheart… ','Baby! ','Well now… '],intB:['can I finish one sentence?','you really hit retry while I was talking.','apparently complete sentences are optional now.','go ahead and interrupt me again. I dare you.'],
 resA:['Aww… ','Well look at that… ','Thank you, baby… ','Sweetheart… '],resB:['you let me finish. Growth.']
});
const mick=make('mick',{
 timerA:['OI! ','Mate… ','Bloody hell, ','Crikey, mate… '],timerB:['one second! ONE!','were ya counting or consulting the stars?','that clock just absolutely mugged ya.','my nan could count that better.','have another crack, ya drongo.'],
 stopA:['OI! ','Mate… ','Bloody hell! ','Crikey… '],stopB:['the target was right bloody there!','I have seen a shopping trolley with better aim.','where were ya aiming, New Zealand?','the box did not move, champion.','that aim needs a bloody map.'],
 reactA:['OI! ','Mate… ','Bloody hell… ','Crikey, '],reactB:['green means GO!','by the time ya reacted I went to the pub and came back.','that thumb is on smoko.','you react like dodgy Australian internet.','wake up, legend!'],
 earlyA:['OI! ','MATE! ','Bloody hell! ','Easy, tiger! '],earlyB:['IT WAS NOT GREEN YET!','calm ya bloody thumb down!','you tapped on pure imagination.','stop trying to predict the future.'],
 susA:['Nah mate… ','OI… ','Yeah right, mate… ','Bloody hell… '],susB:['I am calling bullshit. Nobody is that quick.','and I am the bloody Prime Minister.','that was suspicious as hell.'],
 slowA:['Mate… ','OI! ','Crikey… ','Bloody hell… '],slowB:['did ya stop for a meat pie first?','the light nearly filed for retirement.','move that thumb before next Tuesday.'],
 goodA:['OI! ','Not bad, mate! ','Alright! ','Bloody hell! '],goodB:['that was actually tidy.','look at you having a proper crack.','you might not be hopeless after all.'],
 closeA:['OHHHH MATE! ','OI! ','Bloody hell! ','Crikey! '],closeB:["you were a bee's dick away!",'that was heartbreak in high definition.','you nearly bloody had it!'],
 pbA:['OI! ','Mate! ','Well bloody hell! ','Crikey! '],pbB:['new best! Someone is finally awake.','that is a proper personal best.','look at you improving, ya weapon.'],
 perfA:['BLOODY HELL! ','OI! PERFECT! ','MATE! ','Crikey! '],perfB:['where did that come from?!','look at this bloody legend!','that was absolutely brilliant. Do not get cocky.'],
 streakA:['Ahhh mate… ','OI… ','Bloody hell… ','Crikey… '],streakB:['you cooked the whole streak.','there goes a perfectly good run.','you had momentum and bottled it.'],
 genA:['Mate… ','OI… ','Bloody hell… ','Crikey… '],genB:['what was THAT?','have another crack.','that was cooked, and not in the good way.'],
 intA:['OI! ','Mate! ','Bloody hell! ','Hold up, champion! '],intB:['can I finish a bloody sentence?','you hit retry while I was still talking!','I have words left, ya menace.','speedrun the game, not my bloody dialogue.'],
 resA:['Cheers, mate… ','Well look at that… ','Crikey… ','Good on ya… '],resB:['you actually let me finish.']
});
function classify(game,score,meta=''){
 const pb=/NEW PERSONAL BEST/i.test(meta);
 if(game==='PERFECT TIMER'){const v=parseFloat(score),perfect=/^1\.000s$/.test(score),d=Math.abs(v-1);if(perfect)return'perfect';if(pb)return'pb';if(d<=.015)return'veryClose';if(d<=.06)return'good';return'timer'}
 if(game==='PERFECT STOP'){const v=parseFloat(score);if(v>=99.95)return'perfect';if(pb)return'pb';if(v>=97)return'veryClose';if(v>=90)return'good';return'stop'}
 if(game==='REACTION TEST'){if(score==='TOO EARLY')return'early';const v=parseFloat(score);if(v<100)return'suspicious';if(v>=350)return'slow';if(v<=170)return'perfect';if(pb)return'pb';if(v<=210)return'veryClose';if(v<=280)return'good';return'reaction'}return pb?'pb':'generic';
}
return{daisy,mick,classify,counts:{daisy:Object.values(daisy).reduce((n,a)=>n+a.length,0),mick:Object.values(mick).reduce((n,a)=>n+a.length,0)}};
});
