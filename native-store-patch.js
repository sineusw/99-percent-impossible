/* 99% IMPOSSIBLE — Android-only store display alignment for Play Console SKUs. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_STORE_PATCH)return;
window.__N99_NATIVE_STORE_PATCH=true;
const style=document.createElement('style');
style.textContent='.cos-card.bundle{display:none!important}';
document.head.appendChild(style);
function patch(){
  document.querySelectorAll('.cast-choice.locked .cast-price').forEach(el=>{if(el.textContent.includes('$1.99'))el.textContent='🔒 $2.99'});
  document.querySelectorAll('.cos-card:not(.bundle) .cos-btn.buy').forEach(el=>{if(/\$1\.99|LOCKED/.test(el.textContent))el.textContent='$0.99'});
  document.querySelectorAll('.cos-note').forEach(el=>{
    if(/RAGE PASS|Buy one palette/i.test(el.textContent))el.textContent='Buy a premium palette for $0.99. Purchases are permanent.';
  });
}
const observer=new MutationObserver(patch);
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
window.addEventListener('n99:entitlements',()=>setTimeout(patch,0));
document.addEventListener('click',()=>setTimeout(patch,0),true);
setTimeout(patch,0);setTimeout(patch,250);
})();
