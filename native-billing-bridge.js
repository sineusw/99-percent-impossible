/* 99% Impossible — native billing adapter.
   The native N99Billing plugin is authoritative for Android one-time purchases. */
(()=>{
'use strict';
if(window.N99NativeBilling)return;
const PRODUCTS=new Set(['remove_ads_forever','daisy','mick','cyberpunk','goldonly','synthwave','ragepass']);
function plugin(){
  const p=window.Capacitor?.Plugins?.N99Billing;
  if(!p)throw new Error('Native billing plugin unavailable');
  return p;
}
function normalize(r){
  if(!r)return {entitlements:[]};
  if(Array.isArray(r.entitlements))return {entitlements:r.entitlements};
  if(r.owned===true&&r.productId)return {entitlements:[r.productId]};
  return {entitlements:[]};
}
window.N99NativeBilling={
  products:[...PRODUCTS],
  async getEntitlements(){return normalize(await plugin().getEntitlements());},
  async purchase(id){
    if(!PRODUCTS.has(id))throw new Error('Unknown product');
    return normalize(await plugin().purchase({productId:id}));
  },
  async restorePurchases(){return normalize(await plugin().restorePurchases());}
};
})();
