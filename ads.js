/* 99% IMPOSSIBLE — streak-aware ad timing
   Ads are queued, never dropped directly on top of a result.
   A hot streak delays the ad; it appears only at a natural retry break.
   Petty comments before and after every ad so monetization feels in-character.
   Placeholder remains until a real mobile ad network is connected. */
(()=>{
const AK=n=>'n99_ads_'+n;
const CK=n=>'n99_cos_'+n;
const hasPass=()=>localStorage.getItem(CK('ragepass'))==='1';
let adOpen=false,pending=false,lastAdAttempt=+(localStorage.getItem(AK('lastAttempt'))||0);

const beforeAd=[
  'And now, a brief message from the people funding your suffering.',
  'Do not go anywhere. Capitalism has requested a moment.',
  'A short commercial break. Apparently dignity does not pay the server bill.',
  'Please enjoy this advertisement while I review your performance.',
  'We will return shortly to your regularly scheduled disappointment.'
];
const afterAd=[
  'And we return to the experiment.',
  'Commercial break complete. Your problems remain.',
  'Welcome back. The advertisement showed more progress than we did.',
  'Thank you. The lights may remain on.',
  'Right. Where were we? Ah yes. Struggling.'
];
let lastBefore=-1,lastAfter=-1;
function pick(pool,last){let i=Math.floor(Math.random()*pool.length);if(pool.length>1&&i===last)i=(i+1)%pool.length;return [pool[i],i]}
function pettySay(text){
  try{
    if(window.PettyPersonality?.speak){window.PettyPersonality.speak(text);return}
    if('speechSynthesis' in window){const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.91;u.pitch=.86;window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
  }catch(e){}
}
function pettyAdMoment(which){
  const pool=which==='before'?beforeAd:afterAd;
  const last=which==='before'?lastBefore:lastAfter;
  const [text,i]=pick(pool,last);
  if(which==='before')lastBefore=i;else lastAfter=i;
  pettySay(text);
  document.dispatchEvent(new CustomEvent('petty-ad-comment',{detail:{phase:which,text}}));
  return text;
}

function playPlaceholderAd(onComplete=()=>{}){
  if(adOpen)return;adOpen=true;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
  overlay.innerHTML='<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div><div style="font-family:Teko,Arial Black,sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">3</span>s</div><div style="font-size:11px;color:#7a7a86;max-width:280px">Placeholder for the real mobile ad. It now follows the final streak-aware timing rules.</div>';
  document.body.appendChild(overlay);
  let n=3;
  const t=setInterval(()=>{n--;const el=overlay.querySelector('#adCount');if(el)el.textContent=n;if(n<=0){clearInterval(t);overlay.remove();adOpen=false;pettyAdMoment('after');onComplete()}},1000);
}

function currentAttempt(){return +(localStorage.getItem('n99_total')||document.querySelector('#tot')?.textContent||0)}
function streak(){return +(localStorage.getItem('n99_currentStreak')||0)}

// Base cadence: roughly every 5 completed attempts, but never while the player
// is hot. Streak 2+ postpones; hard cap at 9 attempts since the previous ad.
function updateDue(){
  if(hasPass())return;
  const now=currentAttempt(),gap=now-lastAdAttempt,hot=streak()>=2;
  if(gap>=5&&!hot)pending=true;
  if(gap>=9)pending=true;
}

const tot=document.querySelector('#tot');
if(tot)new MutationObserver(updateDue).observe(tot,{childList:true,characterData:true,subtree:true});

// Natural placement: player has seen the result and chooses to continue.
// Petty speaks first, then the ad arrives after a short beat.
document.addEventListener('click',e=>{
  if(!e.target?.matches?.('#retry,#close'))return;
  updateDue();
  if(!pending||hasPass()||adOpen)return;
  const now=currentAttempt(),gap=now-lastAdAttempt;
  if(streak()>=2&&gap<9)return;
  pending=false;lastAdAttempt=now;localStorage.setItem(AK('lastAttempt'),String(now));
  pettyAdMoment('before');
  setTimeout(()=>playPlaceholderAd(),1150);
},true);
})();
