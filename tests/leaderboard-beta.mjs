import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const script=fs.readFileSync(new URL('../leaderboard-preview.js',import.meta.url),'utf8');
function setup(enabled,savedStep){const w=new Window({url:'http://localhost/'});w.document.write('<section id="home"></section><div id="modal"><button id="retry">Retry</button></div>');if(savedStep!==undefined)w.localStorage.setItem('n99-leaderboard-demo-step-v1',String(savedStep));w.N99LeaderboardPreviewEnabled=enabled;w.N99Character={get:()=>w.character||'petty'};vm.runInContext(fs.readFileSync(new URL('../leaderboard-commentary.js',import.meta.url),'utf8'),vm.createContext(w));vm.runInContext(script,vm.createContext(w));return w;}
const off=setup(false);assert.equal(off.document.querySelector('.rank-reveal'),null);off.close();
const w=setup(true);assert.ok(w.document.querySelector('.leaderboard-preview'));
function result(value){w.dispatchEvent(new w.CustomEvent('n99:result',{detail:value}));return w.N99LeaderboardLine(value);}
const suspicious={rawScore:1,isSuspicious:true};assert.equal(result(suspicious),null);assert.match(w.document.querySelector('.rank-reveal').textContent,/UNRANKED ATTEMPT/);assert.equal(w.document.querySelector('.rank-current').textContent,'#1204');
let first,second;
for(const character of ['petty','daisy','mick']){w.character=character;let texts=[];let drops=0;for(let i=0;i<39;i++){const data={game:'timer',rawScore:1,isPerfect:true};const line=result(data);if(w.document.querySelector('.rank-reveal').dataset.direction==='down'){drops++;assert.equal(line==='',drops%2===1);}else assert.notEqual(line,undefined);texts.push(line);assert.match(w.document.querySelector('.rank-reveal').textContent,/DEMO RANK/);assert.equal(w.N99LeaderboardLine({}),null);}assert.ok(new Set(texts).size>3);if(character==='petty'){first=texts;assert.ok(texts.some(x=>x?.includes('ninety-nine')||x?.includes('roast ready')||x?.includes('clap once')));}else{assert.notDeepEqual(texts,first);}}
const bad={rawScore:NaN};assert.equal(result(bad),null);
w.close();console.log('Leaderboard beta: gating, visible sample labels, invalid-score exclusion, rank milestones, per-character variety and result identity passed');
// Dynamic cast lines must use the actual character API on native and web.
for(const nativeApp of [true,false])for(const character of ['daisy','mick']){
 const cast=new Window({url:'http://localhost/'}),calls=[],audios=[];let deviceSpeech=0;
 cast.speechSynthesis={speak(){deviceSpeech++},cancel(){},getVoices:()=>[]};
 cast.Capacitor={isNativePlatform:()=>nativeApp};cast.N99Character={get:()=>character};cast.N99Result={};
 cast.N99LeaderboardLine=()=> 'Up the leaderboard!';
 cast.Audio=class{constructor(src){this.src=src;this.played=0;audios.push(this)}setAttribute(){}pause(){}play(){this.played++;this.onplay?.();return Promise.resolve()}};
 cast.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true,blob:async()=>new cast.Blob([new Uint8Array([73,68,51])],{type:'audio/mpeg'})}};
 vm.runInContext(fs.readFileSync(new URL('../cast-static-audio-v1.js',import.meta.url),'utf8'),vm.createContext(cast));
 for(let i=0;i<2;i++){cast.speechSynthesis.speak({text:cast.N99LeaderboardLine()});for(let tries=0;tries<40&&!audios.at(-1).played;tries++)await new Promise(r=>setTimeout(r,2));assert.equal(audios.at(-1).played,1);assert.match(audios.at(-1).src,/^data:audio/);}
 assert.equal(calls.length,1);assert.equal(calls[0].url,nativeApp?'https://99-percent-impossible.vercel.app/api/cast-voice':'/api/cast-voice');assert.equal(calls[0].body.character,character);assert.equal(calls[0].body.text,'Up the leaderboard!');assert.equal(deviceSpeech,0);
 cast.speechSynthesis.speak({text:'A prerecorded game line'});assert.ok(audios.at(-1).src.startsWith('/assets/'+character+'-audio/'));assert.equal(calls.length,1);
 await cast.happyDOM.abort();cast.close();
}
console.log('Daisy/Mick native and web rank audio uses real character API, validates/caches audio and preserves normal static playback');

// Petty's rank changes must bypass device TTS and reach his actual audio transport.
const petty=new Window({url:'http://localhost/'});let pettyAudio=null;
petty.speechSynthesis={speak:u=>{pettyAudio=u},cancel(){},getVoices:()=>[]};
petty.Capacitor={isNativePlatform:()=>true};petty.N99Character={get:()=> 'petty'};
petty.N99Result={};petty.N99LeaderboardLine=()=> 'Somebody just lost their seat.';
petty.N99LeaderboardSpeech={speak(){throw Error('Petty was incorrectly sent to device TTS')}};
vm.runInContext(fs.readFileSync(new URL('../cast-static-audio-v1.js',import.meta.url),'utf8'),vm.createContext(petty));
const pettyLine={text:petty.N99LeaderboardLine()};petty.speechSynthesis.speak(pettyLine);
assert.equal(pettyAudio,pettyLine);petty.close();
console.log('Petty rank changes retain the real Petty audio transport');
// Exercise the actual caption/speech consumer, including silent drops.
const paired=setup(true);paired.document.querySelector('#modal').insertAdjacentHTML('afterbegin','<div id="mg">PERFECT TIMER</div><div id="ms"></div><div id="mm"></div><div id="mr"></div><div id="att"></div>');
const said=[];
paired.speechSynthesis={speak:u=>{said.push(u.text);u.onend?.()},cancel(){},getVoices:()=>[]};
paired.SpeechSynthesisUtterance=function(text){this.text=text};
vm.runInContext(fs.readFileSync(new URL('../petty.js',import.meta.url),'utf8'),vm.createContext(paired));
for(let i=0;i<26;i++){
 const value={game:'timer',rawScore:1.1};paired.N99Result=value;
 paired.dispatchEvent(new paired.CustomEvent('n99:result',{detail:value}));
 const expected=paired.N99LeaderboardLine(value),before=said.length;
 paired.document.querySelector('#ms').textContent='1.100s';paired.document.querySelector('#att').textContent=String(i+1);
 await new Promise(resolve=>setTimeout(resolve,10));
 if(expected===''){assert.equal(said.length,before);assert.equal(paired.document.querySelector('#mr').textContent,'');}
 else if(expected===null){assert.equal(said.length,before+1);assert.equal(paired.document.querySelector('#mr').textContent,said.at(-1));}else {assert.equal(said.at(-1),expected);assert.equal(paired.document.querySelector('#mr').textContent,expected);}
}
paired.close();console.log('Actual result captions match spoken rank lines; alternate drops are silent without a generic fallback');
const {createRequire}=await import('node:module');
const {create}=createRequire(import.meta.url)('../leaderboard-commentary.js');
const field=create();assert.deepEqual([field('p',500,499).type,field('p',499,498).type,field('p',498,497).type,field('p',497,496).type],['rank','roast','rank','roast']);
const hundred=create();let rank=101;const mix=[];for(let i=0;i<6;i++){mix.push(hundred('p',rank,rank-1).type);rank--;}assert.deepEqual(mix,['rank','rank','roast','rank','rank','roast']);
const ten=create();const topTen=[];for(let r=11;r>1;r--)topTen.push(ten('p',r,r-1).type);assert.deepEqual(topTen.slice(0,9),['rank','rank','roast','rank','rank','roast','rank','rank','roast']);
const run=create();run('p',400,399);run('p',399,398);assert.equal(run('p',398,397).streak,3);assert.equal(run('p',397,400).type,'silent');assert.equal(run('p',400,399).streak,1);assert.equal(run('p',399,401).type,'rank');
assert.equal(run('other-game',399,401).type,'silent');assert.equal(run('p',0,1),null);
console.log('Cadence verified: alternating field, two-thirds top100, two-thirds including top10, consecutive climbs, and independent alternate drops');
const previewMix=setup(true);const previewLines=[];for(let i=0;i<4;i++){const d={game:'timer',rawScore:1};previewMix.dispatchEvent(new previewMix.CustomEvent('n99:result',{detail:d}));previewLines.push(previewMix.N99LeaderboardLine(d));}
assert.ok(previewLines[0]);assert.equal(previewLines[1],null);assert.match(previewLines[2],/keep climbing|habit|three moves up/);assert.equal(previewLines[3],null);previewMix.close();
console.log('Visible preview applies the cadence and sustained-climb reaction');
const instant=setup(true);assert.equal(instant.document.querySelector('.rank-current').textContent,'#1204');
instant.document.querySelector('.rank-reveal').getBoundingClientRect=()=>{throw Error('Synchronous layout forced during result')};
for(const detail of [{game:'reaction',rawScore:null},{game:'reaction',rawScore:70,isSuspicious:true}]){instant.dispatchEvent(new instant.CustomEvent('n99:result',{detail}));assert.equal(instant.document.querySelector('.rank-current').textContent,'#1204');assert.match(instant.document.querySelector('.rank-reveal').textContent,/UNRANKED ATTEMPT/);assert.equal(instant.N99LeaderboardLine(detail),null);}
instant.dispatchEvent(new instant.CustomEvent('n99:result',{detail:{game:'reaction',rawScore:250}}));assert.equal(instant.document.querySelector('.rank-current').textContent,'#984');instant.close();
console.log('Cold start and false starts keep rank visible; invalid attempts do not move rank; no forced layout read');

const homeRank=setup(true);assert.equal(homeRank.document.querySelector('#home-rank-value').textContent,'#1,204');
homeRank.dispatchEvent(new homeRank.CustomEvent('n99:result',{detail:{game:'timer',rawScore:1.1}}));assert.equal(homeRank.document.querySelector('#home-rank-value').textContent,'#984');
const savedStep=homeRank.localStorage.getItem('n99-leaderboard-demo-step-v1');homeRank.dispatchEvent(new homeRank.CustomEvent('n99:result',{detail:{game:'reaction',rawScore:null}}));assert.equal(homeRank.document.querySelector('#home-rank-value').textContent,'#984');homeRank.close();
const restoredRank=setup(true,savedStep);assert.equal(restoredRank.document.querySelector('#home-rank-value').textContent,'#984');assert.equal(restoredRank.document.querySelector('.rank-current').textContent,'#984');restoredRank.close();
const badSavedRank=setup(true,'bad');assert.equal(badSavedRank.document.querySelector('#home-rank-value').textContent,'#1,204');badSavedRank.close();
console.log('Home rank updates immediately, survives reopening, and ignores unranked attempts or invalid saved data');
