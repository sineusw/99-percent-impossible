/* 99% IMPOSSIBLE — streak-aware ads + priority Petty ad banter
   v0.9.9: safe-boundary ad gate. Ads may never cover a live/locked attempt. */
(()=>{
const AK=n=>'n99_ads_'+n,CK=n=>'n99_cos_'+n,hasPass=()=>localStorage.getItem(CK('ragepass'))==='1';
const QS=new URLSearchParams(location.search),AD_TEST=QS.get('adtest')==='1',NO_ADS=QS.get('noads')==='1';
let adOpen=false,adPreparing=false,pending=false,preAdTimer=0,lastAdAttempt=+(localStorage.getItem(AK('lastAttempt'))||0);
const PRE_AD_PAUSE=AD_TEST?1400:3600,SIM_AD_SECONDS=5;
const BEFORE_LINES=['Hold that thought. Capitalism.','And now, a word from my landlord.','Sponsor break. Try not to improve.','Commerce has entered the chat.','Your suffering has attracted advertisers.','A brief message from your financial enablers.','Pause. Someone paid for your attention.','Advert time. Even failure has overhead.','Right. Let us monetize the trauma.','A sponsor would like a turn.','Tiny break. Big corporate energy.','Your thumb has created shareholder value.','Commercial incoming. Stay emotionally available.','Good news: a break. Bad news: monetized.','The advertisers have seen enough.','Please hold. Capitalism needs five seconds.','Someone bought these next few seconds.','A sponsor believes in you. Weird.','Time out. Sponsored, obviously.','Before the next loss: commerce.','I would apologize, but rent exists.','Brief commercial. Dignity resumes shortly.','Pause the comeback. We have invoices.','This humiliation is now sponsored.','Advert break. Very glamorous.','Fam, hold up. Capitalism called.','Bro, even roasting you costs money.','My guy, the sponsors want screen time.','A word from people with a marketing budget.','Do not move. Someone paid for this interruption.','Financially responsible interruption incoming.','And now, the part that pays for me.','Corporate would like a moment.','Please enjoy this tasteful monetization.','We interrupt the chaos for revenue.','One sec. The shareholders are hungry.'];
const AFTER_LINES=['Welcome back to your suffering.','Right. Back to the damage.','Commercial over. Problems remain.','Revenue secured. Dignity pending.','Welcome back. Nothing improved.','And we return to the experiment.','Sponsor satisfied. Your move.','Break over. Confidence still intact?','Right then. Back to milliseconds.','Welcome back, victim.','Commercial complete. Resume delusion.','We are back. I have notes.','And now, accountability.','Break is over. Unfortunately.','Welcome back. The target missed you.','Capitalism is done. I am not.','Back again. Lovely.','The ad ended. Your score did not improve.','Right. Where were we? Ah yes. Failure.','Commercial over. Cook yourself responsibly.','We return to our scheduled disappointment.','Welcome back. The game remembers.','The sponsor left. I stayed.','Break complete. Continue the evidence.','And we are back. Fam, lock in.','Bro, commercial is over. Focus.','My guy, the break did not fix your timing.','Back to work. And by work, I mean this.','Welcome back. Shareholders thank you.','Revenue acquired. Reflexes unchanged.','Excellent. Bills paid. Now perform.','The capitalism portion is complete.','Sponsor gone. Pressure back.','Back from commercial. Still confident?','And now, the sequel nobody needed.','Right. Humiliation may resume.'];
function shuffled(lines,key){let a;try{a=JSON.parse(localStorage.getItem(AK(key+'_deck'))||'[]')}catch{}if(!Array.isArray(a)||!a.length){a=[...lines];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}const last=localStorage.getItem(AK(key+'_last'));if(a.length>1&&a[0]===last)[a[0],a[1]]=[a[1],a[0]]}const text=a.shift();localStorage.setItem(AK(key+'_deck'),JSON.stringify(a));localStorage.setItem(AK(key+'_last'),text);return text}
function adSpeak(text,onDone=()=>{}){if(localStorage.getItem('n99_petty_voice')==='0'||!text){onDone();return false}try{window.speechSynthesis?.cancel?.();const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.96;u.pitch=.86;u.volume=1;let finished=false,watchdog=0;const done=()=>{if(finished)return;finished=true;if(watchdog)clearTimeout(watchdog);onDone()};u.onend=done;u.onerror=done;window.speechSynthesis.speak(u);watchdog=setTimeout(done,6000);return true}catch{onDone();return false}}
const beforeAd=()=>adSpeak(shuffled(BEFORE_LINES,'before'));
const afterAd=onDone=>adSpeak(shuffled(AFTER_LINES,'after'),onDone);
function primeGameAudio(){try{const c=typeof audio==='function'?audio():null;if(c?.state==='suspended'&&c.resume)c.resume().catch?.(()=>{})}catch{}}
function currentAttempt(){return +(localStorage.getItem('n99_total')||document.querySelector('#tot')?.textContent||0)}
function streak(){return +(localStorage.getItem('n99_currentStreak')||0)}
function modalSettled(){const m=document.querySelector('#modal');return !m||m.classList.contains('hide')}
function safeBoundary(){
  if(NO_ADS||adOpen)return false;
  if(document.visibilityState==='hidden')return false;
  if(typeof st!=='undefined'&&(st.run||st.locked))return false;
  return modalSettled();
}
function updateDue(){
  if(NO_ADS){pending=false;return}
  if(hasPass()&&!AD_TEST){pending=false;return}
  const now=currentAttempt(),gap=now-lastAdAttempt,hot=streak()>=2;
  if(AD_TEST){if(gap>=1)pending=true;return}
  if(gap>=5&&!hot)pending=true;
  if(gap>=9)pending=true;
}
function deferPreparedAd(){
  if(!adPreparing)return;
  clearTimeout(preAdTimer);preAdTimer=0;
  adPreparing=false;
  pending=true;
  window.__PETTY_AD_BANTER_LOCK=false;
  try{window.speechSynthesis?.cancel?.()}catch{}
}
function openPlaceholderAd(onComplete=()=>{}){
  adPreparing=false;
  pending=false;
  adOpen=true;
  lastAdAttempt=currentAttempt();
  localStorage.setItem(AK('lastAttempt'),String(lastAdAttempt));
  window.__PETTY_AD_BANTER_LOCK=true;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
  overlay.innerHTML='<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div><div id="adTitle" style="font-family:Teko,Arial Black,sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">'+SIM_AD_SECONDS+'</span>s</div><div id="adSub" style="font-size:11px;color:#7a7a86;max-width:280px">Placeholder for the real mobile ad.</div>';
  document.body.appendChild(overlay);
  let n=SIM_AD_SECONDS;
  const t=setInterval(()=>{n--;const el=overlay.querySelector('#adCount');if(el)el.textContent=n;if(n<=0){clearInterval(t);const title=overlay.querySelector('#adTitle'),sub=overlay.querySelector('#adSub');if(title)title.innerHTML='AD COMPLETE';if(sub)sub.innerHTML='<span style="display:inline-block;margin-top:8px;font-size:14px;color:#fff;font-weight:800;letter-spacing:1px">TAP TO CONTINUE</span>';overlay.style.cursor='pointer';const finish=e=>{e.preventDefault();overlay.removeEventListener('pointerup',finish);primeGameAudio();if(title)title.innerHTML='PETTY HAS ONE MORE THING TO SAY…';if(sub)sub.textContent='';afterAd(()=>{primeGameAudio();overlay.remove();adOpen=false;window.__PETTY_AD_BANTER_LOCK=false;onComplete()})};overlay.addEventListener('pointerup',finish,{once:true})}},1000)
}
function commitPreparedAd(){
  if(!adPreparing)return;
  // CRITICAL: this is the final synchronous eligibility check immediately
  // before the ad-open call. Never insert await/timers/state work between them.
  if(!safeBoundary())return deferPreparedAd();
  openPlaceholderAd();
}
function beginAdPreparation(){
  if(adPreparing||adOpen)return false;
  adPreparing=true;
  pending=false;
  window.__PETTY_AD_BANTER_LOCK=true;
  try{window.speechSynthesis?.cancel?.()}catch{}
  beforeAd();
  preAdTimer=setTimeout(()=>{preAdTimer=0;commitPreparedAd()},PRE_AD_PAUSE);
  return true;
}
function tryOpenPendingAd(){
  updateDue();
  if(!pending||adPreparing||adOpen)return false;
  if(hasPass()&&!AD_TEST){pending=false;return false}
  const now=currentAttempt(),gap=now-lastAdAttempt;
  if(!AD_TEST&&streak()>=2&&gap<9)return false;
  if(!safeBoundary())return false;
  return beginAdPreparation();
}
const tot=document.querySelector('#tot');if(tot)new MutationObserver(updateDue).observe(tot,{childList:true,characterData:true,subtree:true});
// Preserve the existing placement: ads are considered only after a player
// intentionally leaves a result via retry/close. The microtask runs after the
// button's own reset/close handler, then the gate rechecks all state from scratch.
document.addEventListener('click',e=>{
  if(!e.target?.matches?.('#retry,#close'))return;
  updateDue();
  queueMicrotask(tryOpenPendingAd);
},true);
// If the player starts interacting with gameplay during the Petty pre-ad pause,
// abandon this opening attempt immediately and keep one pending bit for later.
document.addEventListener('pointerdown',e=>{
  if(adPreparing&&e.target?.closest?.('#primary,[data-g],#back'))deferPreparedAd();
},true);
// No foreground/resume hook by design: this game never auto-opens ads on resume.
window.N99Ads={tryOpenPendingAd,safeBoundary,get pending(){return pending},get adOpen(){return adOpen},get adPreparing(){return adPreparing}};
})();