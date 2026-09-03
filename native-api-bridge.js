/* 99% IMPOSSIBLE — native API bridge.
   Capacitor bundles run from a local origin, so selected server APIs are routed to the stable production API. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_API_BRIDGE)return;
window.__N99_NATIVE_API_BRIDGE=true;
const API_ORIGIN='https://99-percent-impossible.vercel.app';
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init)=>{
  try{
    if(typeof input==='string'&&input.startsWith('/api/petty-voice')) input=API_ORIGIN+input;
    else if(input instanceof Request&&new URL(input.url,location.href).pathname==='/api/petty-voice'){
      input=new Request(API_ORIGIN+'/api/petty-voice',input);
    }
  }catch{}
  return nativeFetch(input,init);
};
window.N99_API_ORIGIN=API_ORIGIN;
})();
