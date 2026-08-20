/* 99% IMPOSSIBLE — streak-aware ad timing
   Ads are queued, never dropped directly on top of a result.
   A hot streak delays the ad; it appears only at a natural retry break.
   Placeholder remains until a real mobile ad network is connected. */
(()=>{
const AK=n=>'n99_ads_'+n;
const CK=n=>'n99_cos_'+n;
const hasPass=()=>localStorage.getItem(CK('ragepass'))==='1';
let adOpen=false,pending=false,lastAdAttempt=+(localStorage.getItem(AK('lastAttempt'))||0);

function playPlaceholderAd(onComplete=()=>{}){
  if(adOpen)return;adOpen=true;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
  overlay.innerHTML='<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div><div style="font-family:Teko,Arial Black,sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">3</span>s</div><div style="font-size:11px;color:#7a7a86;max-width:280px">Placeholder for the real mobile ad. It now follows the final streak-aware timing rules.</div>';
  document.body.appendChild(overlay);
  let n=3;
  const t=setInterval(()=>{n--;const el=overlay.querySelector('#adCount');if(el)el.textContent=n;if(n<=0){clearInterval(t);overlay.remove();adOpen=false;onComplete()}},1000);
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
// If the streak is still hot, keep delaying unless the hard cap was reached.
document.addEventListener('click',e=>{
  if(!e.target?.matches?.('#retry,#close'))return;
  updateDue();
  if(!pending||hasPass()||adOpen)return;
  const now=currentAttempt(),gap=now-lastAdAttempt;
  if(streak()>=2&&gap<9)return;
  pending=false;lastAdAttempt=now;localStorage.setItem(AK('lastAttempt'),String(now));
  setTimeout(()=>playPlaceholderAd(),120);
},true);
})();
