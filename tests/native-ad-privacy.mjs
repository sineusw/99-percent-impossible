import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../native-ad-privacy.js',import.meta.url),'utf8');
const flush=async()=>{for(let n=0;n<40;n++)await Promise.resolve()};
const ok={status:'NOT_REQUIRED',canRequestAds:true,privacyOptionsRequirementStatus:'NOT_REQUIRED'};
function setup({native=true,request=async()=>ok,form=async()=>ok,options=async()=>{}}={}){
 const w=new Window({url:'capacitor://localhost/'});w.document.write('<main><section id="home"></section></main>');
 const calls={info:0,form:0,options:0,initialize:0};w.alert=()=>{};
 w.Capacitor={isNativePlatform:()=>native,Plugins:{AdMob:{
  requestConsentInfo:async()=>{calls.info++;return request()},
  showConsentForm:async()=>{calls.form++;return form()},
  showPrivacyOptionsForm:async()=>{calls.options++;return options()},
  initialize:async()=>{calls.initialize++}
 }}};
 vm.runInContext(code,vm.createContext(w));return {w,calls};
}
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS',name)};
{
 const a=setup({native:false});await flush();
 check('Browser never contacts native consent SDK',()=>{assert.equal(a.calls.info,0);assert.equal(a.w.N99AdPrivacy,undefined)});
 await a.w.happyDOM.close();
}
{
 const a=setup();await a.w.N99AdPrivacy.ready;
 check('UMP permits ads without requesting tracking authorization or initializing ads',()=>{assert.equal(a.w.N99AdPrivacy.canRequestAds,true);assert.equal(a.calls.initialize,0);assert.equal(a.calls.form,0)});
 check('Startup restores game interaction and exposes privacy control',()=>{assert.equal(a.w.document.querySelector('main').hasAttribute('inert'),false);assert.ok(a.w.document.querySelector('#n99-ad-privacy'))});
 await a.w.happyDOM.close();
}
{
 let finish;const a=setup({request:async()=>({...ok,status:'REQUIRED',canRequestAds:false,isConsentFormAvailable:true}),form:()=>new Promise(r=>{finish=r})});await flush();
 check('Presented consent form keeps gameplay inert and ads blocked',()=>{assert.equal(a.calls.form,1);assert.equal(a.w.N99AdPrivacy.busy,true);assert.equal(a.w.document.querySelector('main').hasAttribute('inert'),true);assert.equal(a.w.N99AdPrivacy.canRequestAds,false)});
 finish({...ok,canRequestAds:false});await a.w.N99AdPrivacy.ready;
 check('Unavailable ad permission keeps ads off while restoring gameplay',()=>{assert.equal(a.w.N99AdPrivacy.canRequestAds,false);assert.equal(a.w.N99AdPrivacy.busy,false)});
 await a.w.happyDOM.close();
}
{
 let fail=true;const a=setup({request:async()=>{if(fail)throw Error('offline');return ok}});await a.w.N99AdPrivacy.ready;
 check('Consent network failure leaves gameplay available and ads disabled',()=>{assert.equal(a.w.N99AdPrivacy.canRequestAds,false);assert.equal(a.w.N99AdPrivacy.busy,false)});
 fail=false;a.w.document.querySelector('#n99-ad-privacy').click();await flush();
 check('Privacy control can recover after offline startup',()=>assert.equal(a.w.N99AdPrivacy.canRequestAds,true));
 await a.w.happyDOM.close();
}
{
 let allowed=true;const a=setup({request:async()=>({...ok,canRequestAds:allowed,privacyOptionsRequirementStatus:'REQUIRED'}),options:async()=>{allowed=false}});await a.w.N99AdPrivacy.ready;
 a.w.document.querySelector('#n99-ad-privacy').click();await flush();
 check('Changed privacy choices refresh permission and prevent further ads',()=>{assert.equal(a.calls.options,1);assert.equal(a.w.N99AdPrivacy.canRequestAds,false);assert.equal(a.w.N99AdPrivacy.busy,false)});
 await a.w.happyDOM.close();
}
{
 const w=new Window({url:'capacitor://localhost/'});w.document.write('<main><section id="home"></section></main>');
 let timer,resolve,forms=0;
 w.setTimeout=fn=>{timer=fn;return 1};w.clearTimeout=()=>{};
 w.Capacitor={isNativePlatform:()=>true,Plugins:{AdMob:{requestConsentInfo:()=>new Promise(r=>{resolve=r}),showConsentForm:async()=>{forms++}}}};
 vm.runInContext(code,vm.createContext(w));timer();await w.N99AdPrivacy.ready;
 resolve({...ok,status:'REQUIRED',isConsentFormAvailable:true});await flush();
 check('Late consent response after timeout never presents over resumed gameplay',()=>{assert.equal(forms,0);assert.equal(w.N99AdPrivacy.canRequestAds,false);assert.equal(w.N99AdPrivacy.busy,false)});
 await w.happyDOM.close();
}
{
 let second=false,finish;const a=setup({request:async()=>second?({...ok,status:'REQUIRED',canRequestAds:false,isConsentFormAvailable:true}):ok,form:()=>new Promise(r=>{finish=r})});await a.w.N99AdPrivacy.ready;
 let cancelled=0;
 a.w.speechSynthesis={speak(){},cancel(){cancelled++}};
 a.w.PettyPersonality={pools:{interrupt:[{text:'Protected interruption'}]}};
 vm.runInContext(fs.readFileSync(new URL('../petty-priority-v1.js',import.meta.url),'utf8'),vm.createContext(a.w));
 a.w.speechSynthesis.speak({text:'Protected interruption'});
 a.w.speechSynthesis.cancel();assert.equal(cancelled,0);
 second=true;a.w.document.querySelector('#n99-ad-privacy').click();await flush();
 check('Privacy form cancels protected speech and blocks new welcome audio',()=>{assert.equal(cancelled,1);assert.equal(a.w.__PETTY_AD_BANTER_LOCK,true)});
 finish(ok);await flush();
 check('Privacy dismissal restores normal audio priority',()=>assert.equal(a.w.__PETTY_AD_BANTER_LOCK,false));
 await a.w.happyDOM.close();
}
console.log(`${count} native privacy checks passed (mocked UMP; device QA remains required)`);
