/* 99% IMPOSSIBLE — native lifetime remove-ads entitlement.
   Product: REMOVE ADS FOREVER — $7.99
   Source of truth is the platform billing bridge; no localStorage purchase state. */
(()=>{
'use strict';
if(window.N99NoAds)return;

const PRODUCT_ID='remove_ads_forever';
let active=false;
let readyResolve;
const ready=new Promise(resolve=>{readyResolve=resolve});

function bridge(){return window.N99NativeBilling||null}
function available(){
  const b=bridge();
  return !!(b&&typeof b.getEntitlements==='function'&&typeof b.purchase==='function'&&typeof b.restorePurchases==='function');
}
function owns(result){
  if(!result)return false;
  if(result.removeAds===true)return true;
  if(Array.isArray(result.entitlements)&&result.entitlements.includes(PRODUCT_ID))return true;
  if(result.entitlements&&result.entitlements[PRODUCT_ID]===true)return true;
  if(result.products&&result.products[PRODUCT_ID]?.owned===true)return true;
  return false;
}
function setActive(next,source='native'){
  const changed=active!==!!next;
  active=!!next;
  if(changed)window.dispatchEvent(new CustomEvent('n99:noads',{detail:{active,source,productId:PRODUCT_ID}}));
  syncUI();
  return active;
}
async function refresh(){
  if(!available()){setActive(false,'unavailable');return false}
  try{return setActive(owns(await bridge().getEntitlements()),'refresh')}
  catch{return setActive(false,'refresh-error')}
}
async function purchase(){
  if(!available())throw new Error('Native billing is unavailable.');
  const result=await bridge().purchase(PRODUCT_ID);
  if(owns(result))return setActive(true,'purchase');
  return refresh();
}
async function restore(){
  if(!available())throw new Error('Native billing is unavailable.');
  const result=await bridge().restorePurchases();
  if(owns(result))return setActive(true,'restore');
  return refresh();
}

let wrap,buy,restoreBtn,status;
function syncUI(){
  if(!wrap)return;
  if(active){buy.textContent='ADS REMOVED ✓';buy.disabled=true;restoreBtn.hidden=true;status.textContent='Lifetime purchase active on this store account.'}
  else{buy.textContent='REMOVE ADS FOREVER — $7.99';buy.disabled=false;restoreBtn.hidden=false;status.textContent='One-time purchase. Automatic ads only; optional rewarded ads stay voluntary.'}
}
function mountUI(){
  if(!available()||document.getElementById('n99-remove-ads'))return;
  const home=document.getElementById('home');
  if(!home)return;
  wrap=document.createElement('div');
  wrap.id='n99-remove-ads';
  wrap.style.cssText='margin:14px 0 0;padding:12px;border:1px solid #ffffff20;border-radius:13px;background:#101117;color:#fff;font-family:Chakra Petch,system-ui;text-align:center';
  wrap.innerHTML='<button id="n99-remove-ads-buy" type="button" style="width:100%;border:1px solid #00d8f670;border-radius:10px;background:#171922;color:#fff;padding:11px 10px;font:900 11px Chakra Petch,system-ui;letter-spacing:.7px;touch-action:manipulation">REMOVE ADS FOREVER — $7.99</button><div id="n99-remove-ads-status" style="margin-top:8px;color:#9c9ca8;font-size:9px;line-height:1.35"></div><button id="n99-remove-ads-restore" type="button" style="margin-top:7px;border:0;background:transparent;color:#00d8f6;font:800 9px Chakra Petch,system-ui;letter-spacing:.7px;text-decoration:underline">RESTORE PURCHASE</button>';
  home.appendChild(wrap);
  buy=wrap.querySelector('#n99-remove-ads-buy');
  restoreBtn=wrap.querySelector('#n99-remove-ads-restore');
  status=wrap.querySelector('#n99-remove-ads-status');
  buy.addEventListener('click',async()=>{buy.disabled=true;status.textContent='Opening store…';try{await purchase()}catch(e){status.textContent=e?.message||'Purchase was not completed.'}finally{syncUI()}});
  restoreBtn.addEventListener('click',async()=>{restoreBtn.disabled=true;status.textContent='Checking purchases…';try{const ok=await restore();if(!ok)status.textContent='No Remove Ads purchase found for this store account.'}catch(e){status.textContent=e?.message||'Restore failed.'}finally{restoreBtn.disabled=false;syncUI()}});
  syncUI();
}

window.N99NoAds={
  productId:PRODUCT_ID,
  ready,
  available,
  isActive:()=>active,
  refresh,
  purchase,
  restore
};

(async()=>{
  await refresh();
  readyResolve(active);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI,{once:true});else mountUI();
})();
})();
