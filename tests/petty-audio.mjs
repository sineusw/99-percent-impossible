import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const handler=require('../api/petty-voice.js');
let count=0;
function ok(name,fn){fn();count++;console.log('PASS',name)}
function response(){return {headers:{},code:0,setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(v){this.body=v;return this},end(){return this},send(v){this.body=v;return this}}}
const origin='capacitor://localhost',host='99-percent-impossible.vercel.app';
let res=response();await handler({method:'OPTIONS',headers:{origin,host}},res);
ok('Native preflight allowed without invoking voice generation',()=>{assert.equal(res.code,204);assert.equal(res.headers['Access-Control-Allow-Origin'],origin)});
res=response();await handler({method:'POST',headers:{origin:'https://unrelated.example',host},body:{text:'Hello'}},res);
ok('Unrelated cross-origin caller rejected',()=>assert.equal(res.code,403));
const savedFetch=globalThis.fetch,savedKey=process.env.ELEVENLABS_API_KEY;
process.env.ELEVENLABS_API_KEY='test-key';globalThis.fetch=async()=>new Response(new Uint8Array([73,68,51]),{headers:{'Content-Type':'audio/mpeg'}});
try{
res=response();await handler({method:'POST',headers:{origin,host},body:{text:'Hello'}},res);
ok('Native POST returns audio with matching CORS origin',()=>{assert.equal(res.code,200);assert.equal(res.headers['Access-Control-Allow-Origin'],origin);assert.equal(res.headers['Content-Type'],'audio/mpeg')});
res=response();await handler({method:'POST',headers:{origin:'https://'+host,host},body:{text:'Hello'}},res);
ok('Existing same-origin web voice still works',()=>assert.equal(res.code,200));
}finally{globalThis.fetch=savedFetch;if(savedKey===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=savedKey}
const source=fs.readFileSync(new URL('../petty-static-audio.js',import.meta.url),'utf8');
for(const native of [true,false]){
const w=new Window({url:native?'capacitor://localhost':'https://'+host});
w.speechSynthesis={cancel(){},speak(){}};
w.Capacitor={isNativePlatform:()=>native};
const requests=[];w.fetch=async(url)=>{requests.push(url);return new Response(new Uint8Array([73,68,51]),{headers:{'Content-Type':'audio/mpeg'}})};
vm.runInContext(source,vm.createContext(w));
assert.equal(await w.preloadPettyVoice('Hello'),true);
ok((native?'Native':'Web')+' transport uses correct endpoint',()=>assert.equal(requests[0],native?'https://'+host+'/api/petty-voice':'/api/petty-voice'));
await w.preloadPettyVoice('Hello');ok('Successful preload is reused',()=>assert.equal(requests.length,1));
w.fetch=async()=>new Response('<html>no backend</html>',{headers:{'Content-Type':'text/html'}});
ok('HTML response cannot be cached as playable audio',()=>{});assert.equal(await w.preloadPettyVoice('Bad'),false);
w.fetch=async()=>new Response(new Uint8Array([73,68,51]),{headers:{'Content-Type':'audio/mpeg'}});
assert.equal(await w.preloadPettyVoice('Bad'),true);ok('Failed audio request can be retried',()=>{});
await w.happyDOM.abort();w.close();
}
console.log(count+' audio checks passed');
