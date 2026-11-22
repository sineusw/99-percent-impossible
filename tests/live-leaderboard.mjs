import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const w = new Window({url:'http://localhost/'});
w.document.write('<section id="home" class="on"><p class="sub"></p><button data-g="timer"></button></section><button id="back"></button><div id="modal"><div id="mg">PERFECT TIMER</div><div id="ms"></div><div id="mm"></div><div id="mr"></div><div id="att"></div><button id="retry"></button></div>');
let waiting, submissions=[];
const data = rank => ({authenticated:true,playerID:'real-player',local:{rank,score:60000001},totalPlayers:120,entries:[{rank:1,alias:'<img onerror=bad()>',score:120000002,isYou:false}]});
w.Capacitor={isNativePlatform:()=>true,Plugins:{N99GameCenter:{
 authenticate:async()=>({authenticated:true}),standings:async()=>data(110),resetRun:async()=>{},addListener(){},
 submit: args => { submissions.push(args); return new Promise(resolve=>{waiting=resolve}); }
}}};
w.N99Character={get:()=> 'petty'};
for(const file of ['leaderboard-commentary.js','leaderboard-lines.js','live-leaderboard.js','leaderboard-preview.js']) vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),vm.createContext(w));
const said=[];
w.speechSynthesis={speak:u=>{said.push(u.text);u.onend?.()},cancel(){},getVoices:()=>[]};
w.SpeechSynthesisUtterance=function(text){this.text=text};
vm.runInContext(fs.readFileSync(new URL('../petty.js',import.meta.url),'utf8'),vm.createContext(w));
const tick=()=>new Promise(r=>setTimeout(r,15));await tick();
assert.equal(w.document.querySelector('#home-rank-value').textContent,'#110');
assert.equal(w.document.querySelector('.live-entries img'),null);
assert.equal(w.document.querySelector('.leaderboard-preview'),null);
function result(attempt){w.document.querySelector('#ms').textContent='1.000s';w.document.querySelector('#att').textContent=String(attempt);const detail={game:'timer',rawScore:1,attemptNumber:attempt};w.N99Result=detail;w.dispatchEvent(new w.CustomEvent('n99:result',{detail}));return detail;}
const first=result(1);assert.equal(w.N99LeaderboardPending(first),true);await tick();assert.equal(said.length,0);waiting(data(99));await tick();
assert.equal(said.length,1);assert.equal(w.document.querySelector('#mr').textContent,said.at(-1));assert.equal(w.N99LeaderboardPending(first),false);assert.ok(w.N99LeaderboardLine(first));assert.equal(w.document.querySelector('#home-rank-value').textContent,'#99');
result(2);const old=waiting;const current=result(3);const latest=waiting;old(data(1));await tick();
assert.equal(w.document.querySelector('#home-rank-value').textContent,'#99');assert.equal(w.N99LeaderboardPending(current),true);
latest(data(98));await tick();assert.equal(w.document.querySelector('#home-rank-value').textContent,'#98');
const beforeDrops=said.length;
const drop1=result(4);waiting(data(105));await tick();assert.equal(w.N99LeaderboardLine(drop1),'');assert.equal(said.length,beforeDrops);assert.equal(w.document.querySelector('#mr').textContent,'');
const drop2=result(5);waiting(data(110));await tick();assert.ok(w.N99LeaderboardLine(drop2));assert.equal(said.length,beforeDrops+1);assert.equal(w.document.querySelector('#mr').textContent,said.at(-1));
const invalid={game:'reaction',rawScore:90,isSuspicious:true};w.N99Result=invalid;w.dispatchEvent(new w.CustomEvent('n99:result',{detail:invalid}));assert.equal(submissions.length,5);assert.match(w.document.querySelector('.rank-reveal').textContent,/UNRANKED/);
await w.happyDOM.abort();w.close();
console.log('Live ranks use Game Center data, escape player aliases, ignore stale replies, and exclude suspicious results');
