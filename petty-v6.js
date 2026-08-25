/* 99% IMPOSSIBLE — Petty v6.6: simple funny greetings + guaranteed first-gesture Older Joe welcome */
(()=>{const pp=window.PettyPersonality;if(!pp||pp.__v6)return;pp.__v6=true;const pick=a=>a[Math.floor(Math.random()*a.length)],d=new Date(),h=d.getHours(),day=d.getDay(),m=d.getMonth()+1,n=d.getDate();let p=[];
const holiday=(m===1&&n===1)?['New year. Same thumbs.','New year, new you? Prove it.']:(m===2&&n===14)?['Happy Valentine’s Day. The target still doesn’t love you.','Valentine’s Day and you’re here with me? Awkward.']:(m===3&&n===17)?['Happy St. Patrick’s Day. You’re gonna need the luck.']:(m===7&&n===4)?['Happy Fourth! Your thumbs still need freedom.']:(m===10&&n===31)?['Happy Halloween. That last score was scary.','Halloween? Perfect. Your timing already scares me.']:(m===12&&n===25)?['Merry Christmas! I got you another loss.','Merry Christmas. Santa can’t fix those reflexes.']:(m===12&&n===31)?['New Year’s Eve. One last bad score?']:null;if(holiday)p.push(...holiday);
if(h<5)p.push('Bro. Go to bed.','Fam, why are you awake?','It is WAY too late for this.');else if(h<11)p.push('Morning! Ready to get cooked?','Good morning. Let’s ruin it.','You woke up and chose this?');else if(h<14)p.push('Lunch break? Let’s waste it together.','Eating lunch? Hope your thumbs ate too.');else if(h<18)p.push('Afternoon! You ready to lose?','Back already? Let’s see those thumbs.');else if(h<22)p.push('Evening! Time to get humbled.','Night’s young. Your streak won’t be.');else p.push('Late night? Bad choices already.','Bro. Sleep was an option.');
if(day===1)p.push('Monday AND this game? Rough.');if(day===5)p.push('Friday night and you picked me? Wild.');if(day===0||day===6)p.push('Weekend plans: getting cooked by me?','It’s the weekend. Go outside after this.');
p.push('Oh look who’s back.','Bro came back for more.','You again?! I love the confidence.','Fam, you really missed me?','Round two? Or twenty?','Welcome back, loser. Kidding. Mostly.','Oh good. My favorite victim.','You ready to get cooked?','Back again? Lock in this time.','Mate, we JUST did this.','My guy came back voluntarily.','Alright. Show me something.','Here we go again.','You ready? I’m not going easy.','Bro said “one more try.” Sure.');const g=pick(p);

// Start fetching immediately. The first genuine pointer gesture unlocks a dedicated
// audio channel; the greeting then plays as soon as Older Joe's MP3 is ready.
// No robotic TTS fallback and no second tap required.
try{window.preloadPettyVoice?.(g)}catch{}
let said=false;
addEventListener('pointerdown',e=>{
  if(said||e.target?.classList?.contains('petty-voice')||window.__PETTY_AD_BANTER_LOCK)return;
  if(typeof window.playPettyVoiceWhenReady==='function'){
    if(window.playPettyVoiceWhenReady(g)){said=true;return}
  }
  // Legacy fallback only when the Older Joe transport is unavailable entirely.
  said=true;
  pp.interruptAndSpeak?pp.interruptAndSpeak(g):pp.speak(g,true);
},{capture:true});
pp.version='6.6'})();