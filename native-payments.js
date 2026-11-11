/* iOS ownership comes only from verified StoreKit transactions, never web tokens. */
(()=>{
'use strict';
const cap=window.Capacitor;
if(!(cap?.isNativePlatform?.()||location.protocol==='capacitor:')||cap?.getPlatform?.()==='android')return;
const sdk=cap?.Plugins?.N99StoreKit;
if(!sdk)return; // Existing native purchase gates remain closed without the bridge.
const items=['daisy','mick','cyberpunk','goldonly','synthwave','ragepass'];
let owned=new Set(['petty']),products=new Map(),available=false,busy=false;
const emit=()=>window.dispatchEvent(new CustomEvent('n99:entitlements',{detail:{owned:[...owned]}}));
function apply(data){owned=new Set(['petty',...(data?.owned||[]).filter(item=>items.includes(item))]);emit()}
const service={
  purchasesAvailable:false,isOwned:item=>owned.has(item),getOwned:()=>[...owned],
  price:item=>products.get(item)?.displayPrice,
  async purchase(item){
    if(busy||!available||!products.has(item))return false;
    if(owned.has(item))return true;
    busy=true;
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
    finally{busy=false}
  },
  async restore(){
    if(busy)return false;busy=true;
    try{apply(await sdk.restore());return true}
    catch(error){console.error('[N99 StoreKit]',error?.message);alert('Could not restore Apple purchases. Please try again.');return false}
    finally{busy=false}
  }
};
window.N99Entitlements=service;
service.ready=(async()=>{
  try{
    await sdk.addListener('entitlementsChanged',apply);
    apply(await sdk.entitlements());
    const catalog=await sdk.catalog();
    products=new Map((catalog.products||[]).filter(p=>items.includes(p.item)&&p.id&&p.displayPrice).map(p=>[p.item,p]));
    available=catalog.available===true&&products.size===items.length;
    service.purchasesAvailable=available;emit();
  }catch(error){console.warn('[N99 StoreKit] Native store unavailable',error?.message)}
  return [...owned];
})();
const mountRestore=()=>{
  const button=document.createElement('button');button.id='n99-restore-purchases';button.textContent='RESTORE APPLE PURCHASES';
  button.style.cssText='display:block;margin:12px auto;padding:10px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:8px;font:inherit;font-size:11px';
  button.onclick=async()=>{button.disabled=true;try{if(await service.restore())alert('Apple purchases restored.')}finally{button.disabled=false}};
  const host=document.querySelector('#cosNote');if(host)host.after(button);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountRestore,{once:true});else mountRestore();
})();
