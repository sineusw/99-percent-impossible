/* 99% IMPOSSIBLE — Stripe voice-pack purchases + signed entitlements. */
(()=>{
'use strict';
if(window.N99Entitlements)return;

const BUYER_KEY='n99_buyer_key';
const TOKEN_PREFIX='n99_entitlement_';
const premium=['daisy','mick'];
const owned=new Set(['petty']);
let readyResolve;
const ready=new Promise(resolve=>{readyResolve=resolve});

function randomBuyerKey(){
  try{
    const bytes=new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }catch{
    return `${Date.now()}-${Math.random()}-${Math.random()}`;
  }
}

function buyerKey(){
  let key=localStorage.getItem(BUYER_KEY);
  if(!key||key.length<20){key=randomBuyerKey();localStorage.setItem(BUYER_KEY,key)}
  return key;
}

async function post(url,body){
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  let data={};
  try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data?.error||`http_${response.status}`);
  return data;
}

function emit(){
  window.dispatchEvent(new CustomEvent('n99:entitlements',{detail:{owned:[...owned]}}));
}

async function verifySaved(cast){
  const token=localStorage.getItem(`${TOKEN_PREFIX}${cast}`);
  if(!token)return false;
  try{
    const data=await post('/api/verify-entitlement',{token,buyerKey:buyerKey()});
    if(data.ok&&data.cast===cast){owned.add(cast);return true}
  }catch{}
  localStorage.removeItem(`${TOKEN_PREFIX}${cast}`);
  owned.delete(cast);
  return false;
}

async function processReturn(){
  const url=new URL(location.href);
  const state=url.searchParams.get('purchase');
  const sessionId=url.searchParams.get('session_id');
  if(state!=='success'||!sessionId)return null;
  try{
    const data=await post('/api/verify-purchase',{session_id:sessionId,buyerKey:buyerKey()});
    if(data.ok&&premium.includes(data.cast)&&data.token){
      localStorage.setItem(`${TOKEN_PREFIX}${data.cast}`,data.token);
      owned.add(data.cast);
      localStorage.setItem('n99_character',data.cast);
      emit();
      return data.cast;
    }
  }catch(err){
    console.error('[N99 PAYMENTS] purchase verification failed',err?.message||err);
  }finally{
    url.searchParams.delete('purchase');
    url.searchParams.delete('cast');
    url.searchParams.delete('session_id');
    history.replaceState({},'',url.pathname+url.search+url.hash);
  }
  return null;
}

async function purchase(cast){
  if(!premium.includes(cast))return false;
  if(owned.has(cast))return true;
  try{
    const data=await post('/api/create-checkout',{cast,buyerKey:buyerKey()});
    if(!data.url)throw new Error('missing_checkout_url');
    location.assign(data.url);
    return true;
  }catch(err){
    console.error('[N99 PAYMENTS] checkout failed',err?.message||err);
    alert('Checkout is unavailable right now. Please try again.');
    return false;
  }
}

window.N99Entitlements={
  ready,
  isOwned:cast=>cast==='petty'||owned.has(cast),
  purchase,
  getOwned:()=>[...owned]
};

(async()=>{
  buyerKey();
  await Promise.all(premium.map(verifySaved));
  await processReturn();
  emit();
  readyResolve([...owned]);
})().catch(err=>{
  console.error('[N99 PAYMENTS] entitlement init failed',err?.message||err);
  readyResolve([...owned]);
});
})();
