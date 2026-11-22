import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const w = new Window({url:'http://localhost/'});
w.document.write('<section id="home" class="on"><p class="sub"></p><button data-g="timer"></button></section><button id="back"></button><div id="modal"><button id="retry"></button></div>');
let waiting, submissions=[];
const data = rank => ({authenticated:true,playerID:'real-player',local:{rank,score:60000001},totalPlayers:120,entries:[{rank:1,alias:'<img onerror=bad()>',score:120000002,isYou:false}]});
w.Capacitor={isNativePlatform:()=>true,Plugins:{N99GameCenter:{
 authenticate:async()=>({authenticated:true}),standings:async()=>data(110),resetRun:async()=>{},addListener(){},
 submit: args => { submissions.push(args); return new Promise(resolve=>{waiting=resolve}); }
}}};
w.N99Character={get:()=> 'petty'};
for(const file of ['leaderboard-commentary.js','leaderboard-lines.js','live-leaderboard.js','leaderboard-preview.js']) vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),vm.createContext(w));
const tick=()=>new Promise(r=>setTimeout(r,15));await tick();
assert.equal(w.document.querySelector('#home-rank-value').textContent,'#110');
assert.equal(w.document.querySelector('.live-entries img'),null);
assert.equal(w.document.querySelector('.leaderboard-preview'),null);
function result(attempt){const detail={game:'timer',rawScore:1,attemptNumber:attempt};w.N99Result=detail;w.dispatchEvent(new w.CustomEvent('n99:result',{detail}));return detail;}
const first=result(1);assert.equal(w.N99LeaderboardPending(first),true);waiting(data(99));await tick();
assert.equal(w.N99LeaderboardPending(first),false);assert.ok(w.N99LeaderboardLine(first));assert.equal(w.document.querySelector('#home-rank-value').textContent,'#99');
result(2);const old=waiting;const current=result(3);const latest=waiting;old(data(1));await tick();
assert.equal(w.document.querySelector('#home-rank-value').textContent,'#99');assert.equal(w.N99LeaderboardPending(current),true);
latest(data(98));await tick();assert.equal(w.document.querySelector('#home-rank-value').textContent,'#98');
const invalid={game:'reaction',rawScore:90,isSuspicious:true};w.N99Result=invalid;w.dispatchEvent(new w.CustomEvent('n99:result',{detail:invalid}));assert.equal(submissions.length,3);assert.match(w.document.querySelector('.rank-reveal').textContent,/UNRANKED/);
await w.happyDOM.abort();w.close();
console.log('Live ranks use Game Center data, escape player aliases, ignore stale replies, and exclude suspicious results');
