/* 99% IMPOSSIBLE — premium purchases + signed web entitlements / native Play Billing. */
(()=>{
'use strict';
if(window.N99Entitlements)return;
const BUYER_KEY='n99_buyer_key';
const TOKEN_PREFIX='n99_entitlement_';
const premium=['daisy','mick','cyberpunk','goldonly','synthwave','ragepass'];
const voices=new Set(['daisy','mick']);
const owned=new Set(['petty']);
let readyResolve;const ready=new Promise(resolve=>{readyResolve=resolve});
const isNative=()=>!!window.Capacitor?.isNativePlatform?.();
const nativeBridge=()=>window.N99NativeBilling||null;
function randomBuyerKey(){try{const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}catch{return `${Date.now()}-${Math.random()}-${Math.random()}`;}}
function buyerKey(){let key=localStorage.getItem(BUYER_KEY);if(!key||key.length<20){key=randomBuyerKey();localStorage.setItem(BUYER_KEY,key)}return key;}
async function post(url,body){const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let data={};try{data=await response.json()}catch{}if(!response.ok)throw new Error(data?.error||`http_${response.status}`);return data;}
function emit(){window.dispatchEvent(new CustomEvent('n99:entitlements',{detail:{owned:[...owned]}}));}
function absorbNative(result){for(const item of result?.entitlements||[])if(premium.includes(item))owned.add(item);emit();return [...owned];}
async function verifySaved(item){const token=localStorage.getItem(`${TOKEN_PREFIX}${item}`);if(!token)return false;try{const data=await post('/api/verify-entitlement',{token,buyerKey:buyerKey()});if(data.ok&&(data.item===item||data.cast===item)){owned.add(item);return true}}catch{}localStorage.removeItem(`${TOKEN_PREFIX}${item}`);owned.delete(item);return false;}
async function processReturn(){const url=new URL(location.href);const state=url.searchParams.get('purchase');const sessionId=url.searchParams.get('session_id');if(state!=='success'||!sessionId)return null;try{const data=await post('/api/verify-purchase',{session_id:sessionId,buyerKey:buyerKey()});const item=data.item||data.cast;if(data.ok&&premium.includes(item)&&data.token){localStorage.setItem(`${TOKEN_PREFIX}${item}`,data.token);owned.add(item);if(voices.has(item))localStorage.setItem('n99_character',item);emit();return item}}catch(err){console.error('[N99 PAYMENTS] purchase verification failed',err?.message||err)}finally{['purchase','cast','item','session_id'].forEach(k=>url.searchParams.delete(k));history.replaceState({},'',url.pathname+url.search+url.hash)}return null;}
async function purchase(item){
  if(!premium.includes(item))return false;if(owned.has(item))return true;
  if(isNative()){
    try{
      const bridge=nativeBridge();if(!bridge)throw new Error('Google Play billing is unavailable.');
      const result=await bridge.purchase(item);absorbNative(result);
      if(owned.has(item)){if(voices.has(item))localStorage.setItem('n99_character',item);return true}
      throw new Error('Purchase was not completed.');
    }catch(err){console.error('[N99 PAYMENTS] native purchase failed',err?.message||err);alert(err?.message||'Checkout is unavailable right now. Please try again.');return false}
  }
  try{const data=await post('/api/create-checkout',{item,buyerKey:buyerKey()});if(!data.url)throw new Error('missing_checkout_url');location.assign(data.url);return true}catch(err){console.error('[N99 PAYMENTS] checkout failed',err?.message||err);alert('Checkout is unavailable right now. Please try again.');return false;}
}
window.N99Entitlements={ready,isOwned:item=>item==='petty'||owned.has(item),purchase,getOwned:()=>[...owned]};
(async()=>{
  if(isNative()){
    const bridge=nativeBridge();
    if(bridge){try{absorbNative(await bridge.getEntitlements())}catch(err){console.error('[N99 PAYMENTS] native entitlement init failed',err?.message||err)}}
    readyResolve([...owned]);return;
  }
  buyerKey();await Promise.all(premium.map(verifySaved));await processReturn();emit();readyResolve([...owned]);
})().catch(err=>{console.error('[N99 PAYMENTS] entitlement init failed',err?.message||err);readyResolve([...owned])});
})();
