import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),handler=require('../api/cast-voice.js');
const priorFetch=globalThis.fetch,priorKey=process.env.ELEVENLABS_API_KEY;const requests=[];
function response(){return{headers:{},code:0,setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(v){this.body=v;return this},end(){return this},send(v){this.body=v;return this}}}
const host='99-percent-impossible.vercel.app',origin='capacitor://localhost';
process.env.ELEVENLABS_API_KEY='test-only';globalThis.fetch=async(url,opts)=>{requests.push({url,body:JSON.parse(opts.body)});return new Response(new Uint8Array([73,68,51]),{headers:{'Content-Type':'audio/mpeg'}})};
try{
 let r=response();await handler({method:'OPTIONS',headers:{host,origin}},r);assert.equal(r.code,204);assert.equal(r.headers['Access-Control-Allow-Origin'],origin);assert.equal(requests.length,0);
 for(const [character,id] of [['daisy','9QPzUjm1evjwY2ENQBKU'],['mick','YLbQE9U7P1K6rBNJWNSv']]){r=response();await handler({method:'POST',headers:{host,origin},body:{character,text:'Leaderboard line'}},r);assert.equal(r.code,200);assert.equal(r.headers['Access-Control-Allow-Origin'],origin);assert.equal(r.headers['Content-Type'],'audio/mpeg');assert.ok(requests.at(-1).url.includes('/'+id+'?'));assert.equal(requests.at(-1).body.model_id,'eleven_multilingual_v2');assert.equal(requests.at(-1).body.text,'Leaderboard line');}
 const before=requests.length;r=response();await handler({method:'POST',headers:{host,origin:'https://unrelated.example'},body:{character:'mick',text:'x'}},r);assert.equal(r.code,403);assert.equal(requests.length,before);
 r=response();await handler({method:'POST',headers:{host,origin},body:{character:'unknown',text:'x'}},r);assert.equal(r.code,400);assert.equal(requests.length,before);
 r=response();await handler({method:'POST',headers:{host,origin:'https://'+host},body:{character:'daisy',text:'Web line'}},r);assert.equal(r.code,200);
 console.log('Cast API: native CORS/preflight, correct ElevenLabs voice/model per character, web compatibility and invalid caller/character rejection passed');
}finally{globalThis.fetch=priorFetch;if(priorKey===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=priorKey}
