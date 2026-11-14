import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const items=['daisy','mick','cyberpunk','goldonly','synthwave','ragepass'];
const catalog=(selected=items)=>({available:selected.length>0,canMakePayments:true,products:selected.map(item=>({item,id:'existing.'+item,displayPrice:'€2.49'}))});
const flush=async()=>{for(let n=0;n<50;n++)await Promise.resolve()};
function setup({fetchCatalog=async()=>catalog(),entitlements=async()=>({owned:[]}),purchase=async()=>({status:'cancelled'}),listen=async()=>{}}={}){
 const w=new Window({url:'capacitor://localhost/'}),calls={catalog:0,purchase:0};let update;
 w.alert=()=>{};w.localStorage.setItem('n99_petty_voice','0');w.N99AdConfig={mode:'test'};
 w.document.write('<main><section id="home"></section></main><div id="cosNote"></div>');
 w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{N99StoreKit:{
  addListener:async(_,fn)=>{update=fn;return listen()},entitlements,
  catalog:async()=>{calls.catalog++;return fetchCatalog()},
  purchase:async({item})=>{calls.purchase++;return purchase(item)},restore:async()=>({owned:[]})
 }}};
 const ctx=vm.createContext(w);vm.runInContext(read('native-payments.js'),ctx);
 return {w,calls,ctx,get update(){return update},ui(){for(const file of ['cast-select.js','cosmetics.js','cast-runtime-v1.js'])vm.runInContext(read(file),ctx)}};
}
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS',name)};
{
 const a=setup({entitlements:async()=>{throw Error('ownership unavailable')},listen:async()=>{throw Error('listener unavailable')}});await a.w.N99Entitlements.ready;
 check('Ownership/listener failure does not skip the Apple catalog',()=>{assert.equal(a.calls.catalog,1);assert.equal(a.w.N99Entitlements.catalogState,'ready');assert.equal(a.w.N99Entitlements.isAvailable('daisy'),true);assert.equal(a.w.N99Entitlements.isOwned('daisy'),false)});await a.w.happyDOM.close();
}
{
 const a=setup({fetchCatalog:async()=>catalog([])});await a.w.N99Entitlements.ready;a.ui();
 a.w.document.querySelector('.cast-picker').click();a.w.document.querySelector('.cos-fab').click();await flush();
 check('Empty Apple catalog keeps every pack visible with purchases disabled',()=>{assert.equal(a.w.document.querySelectorAll('.cast-choice').length,3);assert.equal(a.w.document.querySelectorAll('.cast-choice:disabled').length,2);assert.equal(a.w.document.querySelectorAll('.cos-card').length,5);assert.equal(a.w.document.querySelectorAll('.cos-btn.buy:disabled').length,4)});
 check('Unavailable native packs never show invented fallback prices',()=>{assert.ok(!a.w.document.querySelector('.cast-options').textContent.includes('$1.99'));assert.ok(!a.w.document.querySelector('#cosThemeList').textContent.includes('$3.99'));assert.match(a.w.document.querySelector('.cast-store-note').textContent,/could not load/)});
 assert.equal(await a.w.N99Entitlements.purchase('daisy'),false);
 check('Empty catalog cannot unlock content or call a purchase',()=>{assert.equal(a.calls.purchase,0);assert.equal(a.w.N99Entitlements.isOwned('daisy'),false)});await a.w.happyDOM.close();
}
{
 let full=false;const a=setup({fetchCatalog:async()=>catalog(full?items:['daisy','cyberpunk'])});await a.w.N99Entitlements.ready;
 check('Partial catalog enables only the exact Apple-returned products',()=>{assert.equal(a.w.N99Entitlements.catalogState,'partial');assert.equal(a.w.N99Entitlements.isAvailable('daisy'),true);assert.equal(a.w.N99Entitlements.isAvailable('mick'),false);assert.equal(a.w.N99Entitlements.price('daisy'),'€2.49')});
 full=true;await a.w.N99Entitlements.refreshCatalog();
 check('Retry recovers all packs without an app reinstall',()=>{assert.equal(a.w.N99Entitlements.catalogState,'ready');assert.equal(a.w.N99Entitlements.isAvailable('mick'),true)});await a.w.happyDOM.close();
}
{
 let resolve;const a=setup({fetchCatalog:()=>new Promise(r=>{resolve=r})});await flush();const first=a.w.N99Entitlements.refreshCatalog(),second=a.w.N99Entitlements.refreshCatalog();
 check('Concurrent catalog retries share one request',()=>{assert.equal(first,second);assert.equal(a.calls.catalog,1)});resolve(catalog());await a.w.N99Entitlements.ready;await a.w.happyDOM.close();
}
{
 let resolve;const a=setup({purchase:()=>new Promise(r=>{resolve=r})});await a.w.N99Entitlements.ready;a.ui();
 const pending=a.w.N99Entitlements.purchase('daisy');a.update({owned:['daisy']});
 check('Early verified ownership update does not re-enable a second purchase while Apple is busy',()=>{assert.equal(a.w.N99Entitlements.busy,true);assert.equal(a.w.document.querySelector('[data-cast="mick"]').disabled,true)});
 assert.equal(await a.w.N99Entitlements.purchase('mick'),false);resolve({status:'purchased',owned:['daisy']});await pending;
 check('Finishing a purchase re-enables other loaded packs',()=>{assert.equal(a.w.N99Entitlements.busy,false);assert.equal(a.w.document.querySelector('[data-cast="mick"]').disabled,false);assert.equal(a.calls.purchase,1)});await a.w.happyDOM.close();
}
{
 let failed=true;const a=setup({fetchCatalog:async()=>{if(failed)throw Error('offline');return catalog()}});await a.w.N99Entitlements.ready;
 check('Catalog error is recorded without granting ownership',()=>{assert.equal(a.w.N99Entitlements.catalogState,'unavailable');assert.equal(a.w.N99Entitlements.diagnostics.errorMessage,'offline');assert.equal(a.w.N99Entitlements.isOwned('daisy'),false)});
 failed=false;await a.w.N99Entitlements.refreshCatalog();check('A later catalog request succeeds after network failure',()=>assert.equal(a.w.N99Entitlements.isAvailable('daisy'),true));await a.w.happyDOM.close();
}
{
 const a=setup({fetchCatalog:async()=>({...catalog(),available:false,canMakePayments:false}),entitlements:async()=>({owned:['daisy']})});await a.w.N99Entitlements.ready;a.ui();
 check('Payment restrictions keep new purchases disabled and owned voices usable',()=>{assert.equal(a.w.N99Entitlements.catalogState,'restricted');assert.equal(a.w.N99Entitlements.isAvailable('mick'),false);assert.equal(a.w.document.querySelector('[data-cast="daisy"]').disabled,false)});await a.w.happyDOM.close();
}
{
 let initial;const a=setup({entitlements:()=>new Promise(resolve=>{initial=resolve})});await flush();
 a.update({owned:['daisy']});initial({owned:[]});await a.w.N99Entitlements.ready;
 check('Late startup ownership cannot erase a newer verified transaction update',()=>assert.equal(a.w.N99Entitlements.isOwned('daisy'),true));await a.w.happyDOM.close();
}
{
 let resolve,calls=0;const a=setup({fetchCatalog:()=>++calls===1?new Promise(r=>{resolve=r}):Promise.resolve(catalog())});
 const timers=new Map();let next=100000;
 a.w.setTimeout=(fn,ms)=>{timers.set(++next,{fn,ms});return next};a.w.clearTimeout=id=>timers.delete(id);
 await flush();[...timers.values()].find(timer=>timer.ms===20000).fn();await a.w.N99Entitlements.ready;
 resolve(catalog());await flush();
 check('Late catalog response after timeout cannot overwrite the recovered request state',()=>assert.equal(a.w.N99Entitlements.catalogState,'unavailable'));
 await a.w.N99Entitlements.refreshCatalog();check('Timed-out catalog can be retried successfully',()=>assert.equal(a.w.N99Entitlements.catalogState,'ready'));await a.w.happyDOM.close();
}
console.log(`${count} native catalog recovery checks passed`);
