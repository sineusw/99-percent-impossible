import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';import {webcrypto} from 'node:crypto';import {Window} from 'happy-dom';
const source=fs.readFileSync(new URL('../voice-cache.js',import.meta.url),'utf8');
const records=new Map();let loads=0;
const store={match:async r=>records.get(r.url)?.clone(),put:async(r,v)=>records.set(r.url,v.clone()),delete:async r=>records.delete(r.url||r),keys:async()=>[...records.keys()].map(k=>new Request(k))};
function runtime(caches={open:async()=>store}){const window={caches,crypto:webcrypto};vm.runInNewContext(source,{window,Request,Response,TextEncoder,Uint8Array,Date,Map});return window.N99VoiceCache;}
const load=async()=>{loads++;return new Blob(['real-audio'],{type:'audio/mpeg'})};
let cache=runtime();await Promise.all([cache.audio('petty','Hello',load),cache.audio('petty','Hello',load)]);assert.equal(loads,1);
cache=runtime();await cache.audio('petty','Hello',load);assert.equal(loads,1);
await cache.audio('daisy','Hello',load);assert.equal(loads,2);
const first=[...records.keys()][0],old=records.get(first);records.set(first,new Response(await old.blob(),{headers:{'Content-Type':'audio/mpeg','X-N99-Created':String(Date.now()-8*86400000)}}));await cache.audio('petty','Hello',load);assert.equal(loads,3);
for(let i=0;i<28;i++)await cache.audio('petty','Line '+i,load);assert.equal(records.size,24);
cache=runtime({open:async()=>{throw Error('quota')}});await cache.audio('mick','Works without storage',load);
await assert.rejects(cache.audio('mick','Bad',async()=>new Blob(['html'],{type:'text/html'})));
const w=new Window({url:'http://localhost/'});let requests=[],said=[];w.document.write('<div id="modal" class="hide"></div>');w.preloadPettyVoice=async text=>{requests.push(text);return true};w.unlockPettyAudio=()=>{};w.PettyPersonality={speakWelcome:t=>said.push(t)};vm.runInContext(fs.readFileSync(new URL('../petty-v6.js',import.meta.url),'utf8'),vm.createContext(w));assert.equal(requests.length,0);w.dispatchEvent(new w.Event('pointerdown'));w.dispatchEvent(new w.Event('touchstart'));await new Promise(r=>setTimeout(r,150));assert.equal(requests.length,1);assert.deepEqual(said,requests);await w.happyDOM.abort();w.close();
console.log('Voice cache reuses audio across launches, isolates characters, expires and bounds storage, tolerates storage failure; welcome generates only the actual spoken line after interaction');
