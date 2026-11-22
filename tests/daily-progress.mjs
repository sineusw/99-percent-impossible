import {Window} from 'happy-dom';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),rules=require('../daily-progress.js');
const day='2026-11-22',goals=rules.goals(day);
assert.equal(new Set(goals.map(g=>g.game)).size,3);
assert.equal(rules.qualifies(goals[0],{game:'timer',rawScore:1}),true);
assert.equal(rules.qualifies(goals[0],{game:'timer',rawScore:1,isSuspicious:true}),false);
assert.equal(rules.qualifies(goals[1],{game:'stop',rawScore:101}),false);
assert.equal(rules.qualifies(goals[2],{game:'reaction',rawScore:99}),false);
assert.equal(rules.qualifies(goals[2],{game:'reaction',rawScore:100}),true);
let now=new Date(2026,10,22,12).getTime();
function setup(saved){const w=new Window({url:'http://localhost/'});w.Date=class extends Date{constructor(...args){super(...(args.length?args:[now]))}};w.document.write('<section id="home"><p class="sub"></p><button class="card" data-g="timer"></button><button class="card" data-g="stop"></button><button class="card" data-g="reaction"></button></section>');if(saved)w.localStorage.setItem('n99-daily-progress-v1',saved);vm.runInContext(fs.readFileSync(new URL('../daily-progress.js',import.meta.url),'utf8'),vm.createContext(w));return w;}
const w=setup();let clicks=0;w.document.querySelector('[data-g=timer]').onclick=()=>clicks++;w.document.querySelector('.daily-goal button').click();assert.equal(clicks,1);
function send(game,rawScore,other={}){w.dispatchEvent(new w.CustomEvent('n99:result',{detail:{game,rawScore,...other}}));}
send('reaction',70,{isSuspicious:true});assert.equal(w.document.querySelector('progress').value,0);
send('timer',1);send('timer',1);assert.equal(w.document.querySelector('progress').value,1);
send('stop',100);send('reaction',200);assert.equal(w.document.querySelector('progress').value,3);
let stored=JSON.parse(w.localStorage.getItem('n99-daily-progress-v1'));assert.equal(stored.completedTotal,1);
send('reaction',200);assert.equal(JSON.parse(w.localStorage.getItem('n99-daily-progress-v1')).completedTotal,1);
const restored=setup(w.localStorage.getItem('n99-daily-progress-v1'));assert.equal(restored.document.querySelector('progress').value,3);
now+=3*86400000;w.dispatchEvent(new w.Event('focus'));assert.equal(w.document.querySelector('progress').value,0);assert.match(w.document.querySelector('.daily-title').textContent,/Challenge Finisher/);
assert.equal(JSON.parse(w.localStorage.getItem('n99-daily-progress-v1')).completedTotal,1);
const broken=setup('{"day":"bad","done":["reaction","reaction","invented"],"completedTotal":-20}');assert.equal(broken.document.querySelector('progress').value,0);
for(const x of [w,restored,broken]){await x.happyDOM.abort();x.close();}
console.log('Daily goals exclude suspicious scores, count once, persist, reset by local date, preserve earned progress and open existing games');
