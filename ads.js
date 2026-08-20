/* 99% IMPOSSIBLE — streak-aware ad timing + reliable Petty ad banter */
(()=>{
const AK=n=>'n99_ads_'+n,CK=n=>'n99_cos_'+n;
const hasPass=()=>localStorage.getItem(CK('ragepass'))==='1';
let adOpen=false,pending=false,lastAdAttempt=+(localStorage.getItem(AK('lastAttempt'))||0);
const PRE_AD_PAUSE=4700,SIM_AD_SECONDS=5;
const BEFORE_LINES=['And now, a brief message from the people funding your suffering.','Do not go anywhere. Capitalism has requested a moment.','Please enjoy this advertisement while I review your performance.','We will return shortly to your regularly scheduled disappointment.','A commercial break. Apparently humiliation alone does not pay the bills.','Hold that thought. Someone has paid to interrupt your suffering.','Before we continue, a sponsor would like to capitalize on this emotional moment.','Please hold. Your suffering has attracted commercial interest.'];
const AFTER_LINES=['Welcome back to your suffering.','And we return to the experiment.','Commercial break complete. Your problems remain.','Welcome back. Unfortunately, your score is still here.','Right. Where were we? Ah yes. Struggling.','And we are back. I hope the advertisement gave you time to reflect.','Welcome back. The sponsor believed in you more than I did.','Excellent. Revenue secured. Dignity still pending.'];
let beforeIndex=+(sessionStorage.getItem('n99_ad_before_i')||0),afterIndex=+(sessionStorage.getItem('n99_ad_after_i')||0);
function nextLine(lines,type){let i=type==='before'?beforeIndex:afterIndex,text=lines[i%lines.length];i++;if(type==='before'){beforeIndex=i;sessionStorage.setItem('n99_ad_before_i',String(i))}else{afterIndex=i;sessionStorage.setItem('n99_ad_after_i',String(i))}return text}
function adSpeak(text){
  if(localStorage.getItem('n99_petty_voice')==='0'||!text)return false;
  try{
    window.speechSynthesis?.cancel?.();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-GB';u.rate=.91;u.pitch=.86;u.volume=1;
    window.speechSynthesis.speak(u);
    return true;
  }catch{return false}
}
function beforeAd(){return adSpeak(nextLine(BEFORE_LINES,'before'))}
function afterAd(){return adSpeak(nextLine(AFTER_LINES,'after'))}

function playPlaceholderAd(onComplete=()=>{}){
  if(adOpen)return;
  adOpen=true;
  window.__PETTY_AD_BANTER_LOCK=true;
  // Give normal retry/result handlers a moment to finish, then Petty owns the mic.
  setTimeout(()=>beforeAd(),260);
  setTimeout(()=>{
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:#000;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Chakra Petch,system-ui,sans-serif;text-align:center;padding:24px';
    overlay.innerHTML='<div style="font-size:12px;letter-spacing:2px;color:#9c9ca8;margin-bottom:10px">AD NETWORK NOT CONNECTED YET</div><div id="adTitle" style="font-family:Teko,Arial Black,sans-serif;font-size:26px;margin-bottom:18px">SIMULATED AD — <span id="adCount">'+SIM_AD_SECONDS+'</span>s</div><div id="adSub" style="font-size:11px;color:#7a7a86;max-width:280px">Placeholder for the real mobile ad. It follows the final streak-aware timing rules.</div>';
    document.body.appendChild(overlay);let n=SIM_AD_SECONDS;
    const t=setInterval(()=>{
      n--;
      const el=overlay.querySelector('#adCount');if(el)el.textContent=n;
      if(n<=0){
        clearInterval(t);
        const title=overlay.querySelector('#adTitle'),sub=overlay.querySelector('#adSub');
        if(title)title.innerHTML='AD COMPLETE';
        if(sub)sub.innerHTML='<span style="display:inline-block;margin-top:8px;font-size:14px;color:#fff;font-weight:800;letter-spacing:1px">TAP TO CONTINUE</span>';
        overlay.style.cursor='pointer';
        const finish=e=>{
          e.preventDefault();
          overlay.removeEventListener('pointerup',finish);
          afterAd();
          overlay.remove();
          adOpen=false;
          window.__PETTY_AD_BANTER_LOCK=false;
          onComplete();
        };
        overlay.addEventListener('pointerup',finish,{once:true});
      }
    },1000);
  },PRE_AD_PAUSE);
}
function currentAttempt(){return +(localStorage.getItem('n99_total')||document.querySelector('#tot')?.textContent||0)}
function streak(){return +(localStorage.getItem('n99_currentStreak')||0)}
function updateDue(){if(hasPass())return;const now=currentAttempt(),gap=now-lastAdAttempt,hot=streak()>=2;if(gap>=5&&!hot)pending=true;if(gap>=9)pending=true}
const tot=document.querySelector('#tot');if(tot)new MutationObserver(updateDue).observe(tot,{childList:true,characterData:true,subtree:true});
document.addEventListener('click',e=>{if(!e.target?.matches?.('#retry,#close'))return;updateDue();if(!pending||hasPass()||adOpen)return;const now=currentAttempt(),gap=now-lastAdAttempt;if(streak()>=2&&gap<9)return;pending=false;lastAdAttempt=now;localStorage.setItem(AK('lastAttempt'),String(now));window.__PETTY_AD_BANTER_LOCK=true;setTimeout(()=>playPlaceholderAd(),120)},true);
})();
