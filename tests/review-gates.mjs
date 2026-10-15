import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
let checks=0;
function check(name,value){assert.ok(value,name);console.log('PASS',name);checks++}
for(const [query,expected] of [['',false],['?adtest=1',true],['?adtest=1&noads=1',false]]){
 const w=new Window({url:'https://example.test/'+query});const ctx=vm.createContext(w);
 w.document.write('<div id="tot">8</div><div id="modal" class="hide"></div><button id="retry">RETRY</button>');
 vm.runInContext(read('ads.js'),ctx);
 const opened=w.N99Ads.tryOpenPendingAd();
 check('Ad boundary '+(query||'normal play'),opened===expected);
 check('Ad overlay matches explicit opt-in',!!w.document.querySelector('#n99-ad-overlay')===expected);
 w.N99Ads.onAdClose();await w.happyDOM.close();
}
for(const native of [false,true]){
 const w=new Window({url:native?'capacitor://localhost/':'https://example.test/'});const ctx=vm.createContext(w);
 w.localStorage.setItem('n99_entitlement_daisy','saved-token');
 w.fetch=async()=>{throw new Error('offline')};
 vm.runInContext(read('voice-payments.js'),ctx);await w.N99Entitlements.ready;
 check('Offline verification preserves token '+native,w.localStorage.getItem('n99_entitlement_daisy')==='saved-token');
 check('Checkout availability '+native,w.N99Entitlements.purchasesAvailable===!native);
 if(native){
  let requests=0;w.fetch=async()=>{requests++;throw new Error('must not checkout')};
  check('Native purchase rejects without checkout',await w.N99Entitlements.purchase('daisy')===false&&requests===0);
  vm.runInContext(read('cast-select.js'),ctx);vm.runInContext(read('cast-runtime-v1.js'),ctx);vm.runInContext(read('cosmetics.js'),ctx);
  w.document.querySelector('.cast-picker').click();w.document.querySelector('.cos-fab').click();
  check('Native hides unowned premium voices',w.document.querySelectorAll('.cast-choice').length===1);
  check('Native hides purchase buttons and offers',!w.document.querySelector('.cos-btn.buy')&&!w.document.querySelector('.bundle'));
  // A verified provider can continue exposing owned cosmetics; the purchase gate must not hide them.
  const previous=w.N99Entitlements.isOwned;w.N99Entitlements.isOwned=item=>item==='daisy'||item==='cyberpunk'||previous(item);
  w.dispatchEvent(new w.CustomEvent('n99:entitlements'));
  check('Owned native voice stays selectable',!!w.document.querySelector('[data-cast="daisy"]'));
  check('Owned native palette stays selectable',Array.from(w.document.querySelectorAll('.cos-btn')).some(b=>b.textContent==='OWNED · USE'));
 }
 await w.happyDOM.close();
}
console.log(`${checks} review gate checks passed`);
