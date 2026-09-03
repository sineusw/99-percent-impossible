/* 99% Impossible — native billing adapter.
   The native N99Billing plugin is authoritative for Android one-time purchases.
   Web code uses stable logical entitlement IDs; this layer maps them to Play Console IDs. */
(()=>{
'use strict';
if(window.N99NativeBilling)return;
const LOGICAL_TO_STORE={
  remove_ads_forever:'remove_ads_forever',
  daisy:'unlock_daisy',
  mick:'unlock_mick',
  cyberpunk:'unlock_neon_palette',
  goldonly:'unlock_sunset_palette',
  synthwave:'unlock_midnight_palette'
};
const STORE_TO_LOGICAL=Object.fromEntries(Object.entries(LOGICAL_TO_STORE).map(([logical,store])=>[store,logical]));
function plugin(){
  const p=window.Capacitor?.Plugins?.N99Billing;
  if(!p)throw new Error('Native billing plugin unavailable');
  return p;
}
function normalize(r){
  const raw=Array.isArray(r?.entitlements)?r.entitlements:(r?.owned===true&&r?.productId?[r.productId]:[]);
  return {entitlements:raw.map(id=>STORE_TO_LOGICAL[id]||id).filter(id=>Object.prototype.hasOwnProperty.call(LOGICAL_TO_STORE,id))};
}
window.N99NativeBilling={
  products:Object.keys(LOGICAL_TO_STORE),
  storeProducts:{...LOGICAL_TO_STORE},
  async getEntitlements(){return normalize(await plugin().getEntitlements());},
  async purchase(id){
    const storeId=LOGICAL_TO_STORE[id];
    if(!storeId)throw new Error('Unknown product');
    return normalize(await plugin().purchase({productId:storeId}));
  },
  async restorePurchases(){return normalize(await plugin().restorePurchases());}
};
})();
