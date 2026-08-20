/* 99% IMPOSSIBLE — Ads scaffolding (standalone, additive)
   Hooks in via DOM observation only — watches for text/counters that
   already exist, never patches streak()/show()/reset(). Safe on top
   of either app.js variant. All actual ad calls are TODO stubs until
   a real ad network account exists. */
(()=>{
const AK=n=>'n99_ads_'+n;
const CK=n=>'n99_cos_'+n; // shares the RAGE PASS flag from cosmetics.js

function hasPass(){return localStorage.getItem(CK('ragepass'))==='1'}

// ---- shared placeholder "ad" experience ----
function playPlaceholderAd(onComplete){
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
  overlay.innerHTML=`<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div>
  <div style="font-family:Teko,'Arial Black',sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">3</span>s</div>
  <div style="font-size:11px;color:#7a7a86;max-width:280px">This is a placeholder so the reward flow can be tested. Swap in a real AdMob/Unity Ads call here once an account exists.</div>`;
  document.body.appendChild(overlay);
  let n=3;
  const t=setInterval(()=>{
    n--;
    const el=overlay.querySelector('#adCount');
    if(el)el.textContent=n;
    if(n<=0){clearInterval(t);overlay.remove();onComplete()}
  },1000);
}

// ---- 1. Rewarded ad: save a dying streak ----
// TODO: replace playPlaceholderAd() with a real rewarded-ad SDK call,
// only invoke onComplete in the SDK's "reward earned" callback.
let cachedGoodStreak=0;
function watchStreak(){
  const tot=document.querySelector('#tot');
  if(!tot)return;
  new MutationObserver(()=>{
    // cache the streak value each time an attempt resolves, BEFORE a
    // possible death, so we have something to restore
    const c=+(localStorage.getItem('n99_currentStreak')||0);
    if(c>0)cachedGoodStreak=c;
    checkForDeath();
  }).observe(tot,{childList:true,characterData:true,subtree:true});
}
function checkForDeath(){
  if(hasPass())return; // pass holders don't need this — or could still offer it; kept simple for now
  const modal=document.querySelector('#modal');
  if(!modal)return;
  const isOpen=!modal.className.includes('hide');
  if(!isOpen)return;
  const text=modal.textContent||'';
  if(text.indexOf('STREAK DEAD')===-1)return;
  if(modal.querySelector('.ad-revive-btn'))return; // already offered this reveal
  const btn=document.createElement('button');
  btn.className='ad-revive-btn';
  btn.textContent='📺 WATCH AD TO SAVE STREAK';
  btn.style.cssText='display:block;width:100%;margin-top:10px;padding:12px;border:none;border-radius:10px;background:linear-gradient(180deg,#FFB020 0%,#B87700 100%);color:#231400;font-family:Teko,"Arial Black",sans-serif;font-size:1.2rem;letter-spacing:.5px;text-transform:uppercase';
  btn.onclick=()=>{
    btn.disabled=true;btn.textContent='LOADING AD…';
    playPlaceholderAd(()=>{
      localStorage.setItem('n99_currentStreak',cachedGoodStreak);
      btn.textContent='STREAK SAVED — SHOWS ON NEXT ATTEMPT';
      btn.style.background='#00FFA3';
    });
  };
  const box=modal.querySelector('.modalbox')||modal;
  box.appendChild(btn);
}

// ---- 2. Interstitial every N total attempts ----
const INTERSTITIAL_EVERY=5;
function watchInterstitial(){
  const tot=document.querySelector('#tot');
  if(!tot)return;
  let lastCount=+tot.textContent||0;
  new MutationObserver(()=>{
    const now=+tot.textContent||0;
    if(now>lastCount){
      lastCount=now;
      if(!hasPass()&&now%INTERSTITIAL_EVERY===0)showInterstitial();
    }
  }).observe(tot,{childList:true,characterData:true,subtree:true});
}
// TODO: replace playPlaceholderAd() below with a real interstitial SDK call.
function showInterstitial(){
  setTimeout(()=>playPlaceholderAd(()=>{}),400); // small delay so it doesn't collide with the result modal opening
}

watchStreak();
watchInterstitial();
})();
