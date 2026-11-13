/* iOS ownership comes only from verified StoreKit transactions, never web tokens. */
(()=>{
'use strict';
const cap=window.Capacitor;
if(!(cap?.isNativePlatform?.()||location.protocol==='capacitor:')||cap?.getPlatform?.()==='android')return;
const sdk=cap?.Plugins?.N99StoreKit;
if(!sdk)return; // Existing native purchase gates remain closed without the bridge.
const items=['daisy','mick','cyberpunk','goldonly','synthwave','ragepass'];
let owned=new Set(['petty']),products=new Map(),available=false,busy=false,purchasingItem=null;
let refreshing=null,catalogState='loading',diagnostics={},ownershipRevision=0;
const emit=()=>window.dispatchEvent(new CustomEvent('n99:entitlements',{detail:{owned:[...owned]}}));
function apply(data){ownershipRevision++;owned=new Set(['petty',...(data?.owned||[]).filter(item=>items.includes(item))]);emit()}
const service={
  purchasesAvailable:false,isOwned:item=>owned.has(item),getOwned:()=>[...owned],
  isAvailable:item=>available&&products.has(item),
  get busy(){return busy},get purchasingItem(){return purchasingItem},
  get catalogState(){return catalogState},get diagnostics(){return {...diagnostics}},
  get storeMessage(){return catalogState==='loading'?'Loading Apple prices…':catalogState==='restricted'?'In-app purchases are disabled on this device.':catalogState==='partial'?'Some packs are unavailable from Apple. You can retry.':catalogState==='ready'?'Apple purchases unlock permanently.':'The Apple store could not load the packs. Please retry.'},
  price:item=>products.get(item)?.displayPrice,
  refreshCatalog(){
    if(refreshing)return refreshing;
    if(busy)return Promise.resolve(false);
    catalogState='loading';emit();
    refreshing=Promise.resolve().then(async()=>{
      try{
        let timer,catalog;
        try{catalog=await Promise.race([sdk.catalog(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Apple store request timed out')),20000)})])}
        finally{clearTimeout(timer)}
        products=new Map((catalog.products||[]).filter(p=>items.includes(p.item)&&p.id&&p.displayPrice).map(p=>[p.item,p]));
        available=catalog.available===true&&products.size>0;
        service.purchasesAvailable=available;
        catalogState=catalog.canMakePayments===false?'restricted':available?(products.size===items.length?'ready':'partial'):'unavailable';
        diagnostics={...catalog,products:undefined,returnedCount:products.size,missingItems:items.filter(item=>!products.has(item))};
      }catch(error){
        available=false;service.purchasesAvailable=false;products.clear();catalogState='unavailable';
        diagnostics={returnedCount:0,errorMessage:error?.message||'Catalog request failed'};
        console.warn('[N99 StoreKit] Native store unavailable',error?.message);
      }
      return available;
    }).finally(()=>{refreshing=null;emit()});
    return refreshing;
  },
  async purchase(item){
    if(busy||!available||!products.has(item))return false;
    if(owned.has(item))return true;
    busy=true;purchasingItem=item;emit();
    try{
      const result=await sdk.purchase({item});
      if(result.status==='purchased'){
        apply(result);
        if(['daisy','mick'].includes(item)&&owned.has(item)){
          localStorage.setItem('n99_character',item);emit();
        }
        return owned.has(item);
      }
      if(result.status==='pending')alert('Your purchase is awaiting Apple approval. It will unlock after approval.');
      return false;
    }catch(error){console.error('[N99 StoreKit]',error?.message);alert('Apple purchase is unavailable right now. Please try again.');return false}
    finally{busy=false;purchasingItem=null;emit()}
  },
  async restore(){
    if(busy)return false;busy=true;emit();
    try{apply(await sdk.restore());return true}
    catch(error){console.error('[N99 StoreKit]',error?.message);alert('Could not restore Apple purchases. Please try again.');return false}
    finally{busy=false;emit()}
  }
};
window.N99Entitlements=service;
service.ready=(async()=>{
  const ownership=(async()=>{
    try{await sdk.addListener('entitlementsChanged',apply)}catch(error){console.warn('[N99 StoreKit] Updates unavailable',error?.message)}
    try{const revision=ownershipRevision,initial=await sdk.entitlements();if(revision===ownershipRevision)apply(initial)}catch(error){console.warn('[N99 StoreKit] Ownership unavailable',error?.message)}
  })();
  await Promise.all([ownership,service.refreshCatalog()]);
  return [...owned];
})();
const retryMissing=()=>{if(!available||products.size<items.length)service.refreshCatalog()};
window.addEventListener('n99:store-open',retryMissing);
window.addEventListener('online',retryMissing);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')retryMissing()});
for(const delay of [5000,30000])setTimeout(retryMissing,delay);
const mountRestore=()=>{
  const button=document.createElement('button');button.id='n99-restore-purchases';button.textContent='RESTORE APPLE PURCHASES';
  button.style.cssText='display:block;margin:12px auto;min-height:44px;padding:10px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:8px;font:inherit;font-size:11px';
  button.onclick=async()=>{button.disabled=true;try{if(await service.restore())alert('Apple purchases restored.')}finally{button.disabled=false}};
  const host=document.querySelector('#cosNote');if(host)host.after(button);
  if(host){
    const status=document.createElement('p');status.id='n99-store-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;line-height:1.5';
    const retry=document.createElement('button');retry.id='n99-retry-store';retry.textContent='RETRY APPLE STORE';retry.style.cssText=button.style.cssText;
    retry.onclick=()=>service.refreshCatalog();
    const detail=document.createElement('button');detail.id='n99-store-details';detail.textContent='STORE DETAILS';detail.style.cssText=button.style.cssText;
    detail.onclick=()=>{const d=service.diagnostics;alert('Apple store: '+catalogState+'\nBuild: '+(d.build||'unknown')+'\nProducts: '+(d.returnedCount||0)+' / 6\nPayments allowed: '+(d.canMakePayments??'unknown')+'\nReceipt: '+(d.receiptKind||'unknown')+'\nMissing: '+(d.missingItems||[]).join(', ')+'\nError: '+(d.errorDomain?d.errorDomain+' '+d.errorCode:d.errorMessage||'none'))};
    host.after(status,retry,detail);
    const sync=()=>{status.textContent=service.storeMessage;retry.hidden=catalogState==='ready';retry.disabled=catalogState==='loading'||busy;detail.hidden=window.N99AdConfig?.mode!=='test'};
    window.addEventListener('n99:entitlements',sync);sync();
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountRestore,{once:true});else mountRestore();
})();
