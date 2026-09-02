/* 99% Impossible — native billing adapter.
   The native N99Billing plugin is authoritative for Remove Ads ownership. */
(()=>{
'use strict';
if(window.N99NativeBilling)return;
const PRODUCT_ID='remove_ads_forever';
function plugin(){
  const p=window.Capacitor?.Plugins?.N99Billing;
  if(!p)throw new Error('Native billing plugin unavailable');
  return p;
}
function normalize(r){
  if(!r)return {entitlements:[]};
  if(Array.isArray(r.entitlements))return {entitlements:r.entitlements};
  if(r.owned===true||r.purchased===true)return {entitlements:[PRODUCT_ID]};
  return {entitlements:[]};
}
window.N99NativeBilling={
  async getEntitlements(){return normalize(await plugin().getEntitlements({productId:PRODUCT_ID}));},
  async purchase(id=PRODUCT_ID){
    if(id!==PRODUCT_ID)throw new Error('Unknown product');
    return normalize(await plugin().purchase({productId:PRODUCT_ID}));
  },
  async restorePurchases(){return normalize(await plugin().restorePurchases({productId:PRODUCT_ID}));}
};
})();
