/* 99% IMPOSSIBLE — native API bridge.
   Capacitor bundles run from a local origin, so selected server APIs are routed to production. */
(()=>{
'use strict';
if(!window.Capacitor?.isNativePlatform?.()||window.__N99_NATIVE_API_BRIDGE)return;
window.__N99_NATIVE_API_BRIDGE=true;
const PROD='https://99-percent-impossible.vercel.app';
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init)=>{
  try{
    if(typeof input==='string'&&input.startsWith('/api/petty-voice')) input=PROD+input;
    else if(input instanceof Request&&new URL(input.url,location.href).pathname==='/api/petty-voice'){
      input=new Request(PROD+'/api/petty-voice',input);
    }
  }catch{}
  return nativeFetch(input,init);
};
window.N99_API_ORIGIN=PROD;
})();
