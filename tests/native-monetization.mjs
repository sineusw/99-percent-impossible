import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
let count=0;
const check=(label,fn)=>{fn();count++;console.log('PASS',label)};
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve()};
function adWindow({pass=false,prepare=async()=>{}}={}){
 const w=new Window({url:'capacitor://localhost/?adtest=1'}),events={},timers=new Map();
 let next=0,shows=0,removed=0,initializes=0;
 w.document.write('<div id="tot">8</div><div id="modal" class="hide"></div><button id="retry">RETRY</button>');
 w.localStorage.setItem('n99_petty_voice','0');
 w.N99Entitlements={isOwned:()=>pass};
 w.setTimeout=(fn,ms)=>{timers.set(++next,{fn,ms});return next};w.clearTimeout=id=>timers.delete(id);
 w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{AdMob:{
  addListener:async(event,fn)=>{events[event]=fn;return {remove:async()=>{removed++;delete events[event]}}},
  initialize:async()=>{initializes++},prepareInterstitial:prepare,showInterstitial:async()=>{shows++}
 }}};
 vm.runInContext(read('ads.js'),vm.createContext(w));
 return {w,events,timers,get shows(){return shows},get removed(){return removed},get initializes(){return initializes}};
}
{
 const a=adWindow();a.w.N99Ads.tryOpenPendingAd();a.w.N99Ads.forceOpenOrSkipAd();a.w.N99Ads.forceOpenOrSkipAd();await flush();
 check('One native presentation despite repeated force-open',()=>assert.equal(a.shows,1));
 check('Presented ad stays locked without gameplay timeout',()=>{assert.equal(a.w.N99Ads.boundaryLocked,true);assert.ok(![...a.timers.values()].some(t=>t.ms===15000))});
 a.events.interstitialAdDismissed();await flush();
 check('Dismissal releases controls and removes all listeners',()=>{assert.equal(a.w.N99Ads.boundaryLocked,false);assert.equal(a.removed,3)});
 a.w.N99Ads.onAdClose();check('Duplicate callback stays harmless',()=>assert.equal(a.w.N99Ads.adOpen,false));
 await a.w.happyDOM.close();
}
{
 let resolve;const a=adWindow({prepare:()=>new Promise(r=>{resolve=r})});
 a.w.N99Ads.tryOpenPendingAd();a.w.N99Ads.forceOpenOrSkipAd();await flush();
 [...a.timers.values()].find(t=>t.ms===15000).fn();resolve();await flush();
 check('Late load after timeout never presents over a new round',()=>{assert.equal(a.shows,0);assert.equal(a.w.N99Ads.boundaryLocked,false);assert.equal(a.removed,3)});
 await a.w.happyDOM.close();
}
{
 const a=adWindow();vm.runInContext('var st={run:true,locked:false}',vm.createContext(a.w));
 check('Active gameplay is not an ad boundary',()=>assert.equal(a.w.N99Ads.tryOpenPendingAd(),false));await a.w.happyDOM.close();
 const b=adWindow({pass:true});check('Verified Rage Pass blocks even test retry ads',()=>assert.equal(b.w.N99Ads.tryOpenPendingAd(),false));await b.w.happyDOM.close();
}
{
 const a=adWindow({prepare:async()=>{throw new Error('no fill')}});
 a.w.N99Ads.tryOpenPendingAd();a.w.N99Ads.forceOpenOrSkipAd();await flush();
 check('No-fill releases native retry lock',()=>{assert.equal(a.w.N99Ads.boundaryLocked,false);assert.equal(a.shows,0);assert.equal(a.removed,3)});await a.w.happyDOM.close();
}
const items=['daisy','mick','cyberpunk','goldonly','synthwave','ragepass'];
for(const catalogAvailable of [true,false]){
 const w=new Window({url:'capacitor://localhost/'});let listener,requests=0,restores=0,status='cancelled';
 w.alert=()=>{};w.fetch=async()=>{requests++;throw new Error('native must not use web checkout')};
 w.localStorage.setItem('n99_entitlement_daisy','untrusted-web-token');
 w.document.write('<div id="cosNote"></div>');
 w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{N99StoreKit:{
  addListener:async(_,fn)=>{listener=fn;return {remove:async()=>{}}},
  entitlements:async()=>({owned:[]}),
  catalog:async()=>({available:catalogAvailable,products:items.map(item=>({item,id:'existing.'+item,displayPrice:'€2.49'}))}),
  purchase:async({item})=>({status,owned:status==='purchased'?[item]:[]}),
  restore:async()=>{restores++;return {owned:['ragepass','daisy']}}
 }}};
 const ctx=vm.createContext(w);vm.runInContext(read('native-payments.js'),ctx);vm.runInContext(read('voice-payments.js'),ctx);
 await w.N99Entitlements.ready;
 check('Native offers depend on Apple catalog '+catalogAvailable,()=>assert.equal(w.N99Entitlements.purchasesAvailable,catalogAvailable));
 check('Web token never unlocks native voice '+catalogAvailable,()=>assert.equal(w.N99Entitlements.isOwned('daisy'),false));
 if(catalogAvailable){
  check('StoreKit supplies localized price',()=>assert.equal(w.N99Entitlements.price('daisy'),'€2.49'));
  check('Cancelled purchase does not unlock',()=>assert.equal(w.N99Entitlements.isOwned('mick'),false));
  assert.equal(await w.N99Entitlements.purchase('mick'),false);
  status='pending';assert.equal(await w.N99Entitlements.purchase('mick'),false);
  check('Pending approval stays locked',()=>assert.equal(w.N99Entitlements.isOwned('mick'),false));
  status='purchased';assert.equal(await w.N99Entitlements.purchase('mick'),true);
  check('Verified purchase unlocks and selects voice',()=>{assert.equal(w.N99Entitlements.isOwned('mick'),true);assert.equal(w.localStorage.getItem('n99_character'),'mick')});
 }
 await w.N99Entitlements.restore();
 check('Restore uses Apple current ownership '+catalogAvailable,()=>{assert.equal(restores,1);assert.equal(w.N99Entitlements.isOwned('ragepass'),true);assert.equal(w.N99Entitlements.isOwned('mick'),false)});
 vm.runInContext(read('cosmetics.js'),ctx);
 check('Restored Rage Pass unlocks all three palettes '+catalogAvailable,()=>{for(const item of ['cyberpunk','goldonly','synthwave']){w.N99Cosmetics.applyTheme(item);assert.equal(w.N99Cosmetics.activeId(),item)}});
 listener({owned:[]});
 check('Revocation removes premium ownership '+catalogAvailable,()=>{assert.equal(w.N99Entitlements.isOwned('ragepass'),false);assert.equal(w.N99Cosmetics.activeId(),'default')});
 check('iOS never calls Stripe APIs '+catalogAvailable,()=>assert.equal(requests,0));
 await w.happyDOM.close();
}
console.log(`${count} native monetization checks passed (mocked SDKs; not physical-device validation)`);
