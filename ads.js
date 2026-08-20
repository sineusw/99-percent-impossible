/* 99% IMPOSSIBLE — streak-aware ad timing + reliable Petty ad banter
   Ads are queued, never dropped directly on top of a result.
   A hot streak delays the ad; it appears only at a natural retry break.
   Every ad gets exactly one Petty line BEFORE and one AFTER.
   Placeholder remains until a real mobile ad network is connected. */
(()=>{
const AK=n=>'n99_ads_'+n;
const CK=n=>'n99_cos_'+n;
const hasPass=()=>localStorage.getItem(CK('ragepass'))==='1';
let adOpen=false,pending=false,lastAdAttempt=+(localStorage.getItem(AK('lastAttempt'))||0);

const PRE_AD_PAUSE=4700;
const SIM_AD_SECONDS=5;
const POST_AD_PAUSE=450;

const BEFORE_LINES=[
  'And now, a brief message from the people funding your suffering.',
  'Do not go anywhere. Capitalism has requested a moment.',
  'Please enjoy this advertisement while I review your performance.',
  'We will return shortly to your regularly scheduled disappointment.',
  'A commercial break. Apparently humiliation alone does not pay the bills.',
  'Hold that thought. Someone has paid to interrupt your suffering.'
];
const AFTER_LINES=[
  'Welcome back to your suffering.',
  'And we return to the experiment.',
  'Commercial break complete. Your problems remain.',
  'Welcome back. Unfortunately, your score is still here.',
  'Right. Where were we? Ah yes. Struggling.',
  'And we are back. I hope the advertisement gave you time to reflect.'
];
let beforeIndex=+(sessionStorage.getItem('n99_ad_before_i')||0);
let afterIndex=+(sessionStorage.getItem('n99_ad_after_i')||0);

function nextLine(lines,type){
  let i=type==='before'?beforeIndex:afterIndex;
  const text=lines[i%lines.length];
  i++;
  if(type==='before'){beforeIndex=i;sessionStorage.setItem('n99_ad_before_i',String(i));}
  else{afterIndex=i;sessionStorage.setItem('n99_ad_after_i',String(i));}
  return text;
}

function forcePetty(text){
  const pp=window.PettyPersonality;
  if(!pp?.speak||!text)return false;
  // Result/idle commentary can still be finishing when an ad is queued.
  // Reset Petty's local speech lock, then force this ad line through Older Joe.
  try{window.speechSynthesis?.cancel?.()}catch{}
  try{return pp.speak(text,true)!==false}catch{return false}
}

function beforeAd(){return forcePetty(nextLine(BEFORE_LINES,'before'));}
function afterAd(){return forcePetty(nextLine(AFTER_LINES,'after'));}

function playPlaceholderAd(onComplete=()=>{}){
  if(adOpen)return;
  adOpen=true;
  beforeAd();

  setTimeout(()=>{
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
    overlay.innerHTML='<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div><div style="font-family:Teko,Arial Black,sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">'+SIM_AD_SECONDS+'</span>s</div><div style="font-size:11px;color:#7a7a86;max-width:280px">Placeholder for the real mobile ad. It follows the final streak-aware timing rules.</div>';
    document.body.appendChild(overlay);
    let n=SIM_AD_SECONDS;
    const t=setInterval(()=>{
      n--;
      const el=overlay.querySelector('#adCount');
      if(el)el.textContent=n;
      if(n<=0){
        clearInterval(t);
        overlay.remove();
        // Keep the ad lock until Petty's post-ad line has been launched so a
        // rapid tap cannot start another game/comment and steal the voice.
        setTimeout(()=>{
          afterAd();
          adOpen=false;
          onComplete();
        },POST_AD_PAUSE);
      }
    },1000);
  },PRE_AD_PAUSE);
}

function currentAttempt(){return +(localStorage.getItem('n99_total')||document.querySelector('#tot')?.textContent||0)}
function streak(){return +(localStorage.getItem('n99_currentStreak')||0)}

function updateDue(){
  if(hasPass())return;
  const now=currentAttempt(),gap=now-lastAdAttempt,hot=streak()>=2;
  if(gap>=5&&!hot)pending=true;
  if(gap>=9)pending=true;
}

const tot=document.querySelector('#tot');
if(tot)new MutationObserver(updateDue).observe(tot,{childList:true,characterData:true,subtree:true});

document.addEventListener('click',e=>{
  if(!e.target?.matches?.('#retry,#close'))return;
  updateDue();
  if(!pending||hasPass()||adOpen)return;
  const now=currentAttempt(),gap=now-lastAdAttempt;
  if(streak()>=2&&gap<9)return;
  pending=false;
  lastAdAttempt=now;
  localStorage.setItem(AK('lastAttempt'),String(now));
  setTimeout(()=>playPlaceholderAd(),120);
},true);
})();
