import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const script=fs.readFileSync(new URL('../leaderboard-preview.js',import.meta.url),'utf8');
function setup(enabled){const w=new Window({url:'http://localhost/'});w.document.write('<section id="home"></section><div id="modal"><button id="retry">Retry</button></div>');w.N99LeaderboardPreviewEnabled=enabled;w.N99Character={get:()=>w.character||'petty'};vm.runInContext(script,vm.createContext(w));return w;}
const off=setup(false);assert.equal(off.document.querySelector('.rank-reveal'),null);off.close();
const w=setup(true);assert.ok(w.document.querySelector('.leaderboard-preview'));
function result(value){w.dispatchEvent(new w.CustomEvent('n99:result',{detail:value}));return w.N99LeaderboardLine(value);}
const suspicious={rawScore:1,isSuspicious:true};assert.equal(result(suspicious),null);assert.equal(w.document.querySelector('.rank-reveal').textContent,'');
let first,second;
for(const character of ['petty','daisy','mick']){w.character=character;let texts=[];for(let i=0;i<13;i++){const data={game:'timer',rawScore:1,isPerfect:true};const line=result(data);assert.ok(line);texts.push(line);assert.match(w.document.querySelector('.rank-reveal').textContent,/DEMO RANK/);assert.equal(w.N99LeaderboardLine({}),null);}assert.ok(new Set(texts).size>3);if(character==='petty'){first=texts;assert.ok(texts.some(x=>x.includes('ninety-nine')||x.includes('roast ready')||x.includes('clap once')));}else{assert.notDeepEqual(texts,first);}}
const bad={rawScore:NaN};assert.equal(result(bad),null);
w.close();console.log('Leaderboard beta: gating, visible sample labels, invalid-score exclusion, rank milestones, per-character variety and result identity passed');
// Native personalized lines must use the captured device engine, not localhost /api.
const native=new Window({url:'http://localhost/'});
let spoken=null;
native.speechSynthesis={speak:u=>{spoken=u},cancel(){},getVoices:()=>[{lang:'en-AU',name:'Device AU'}]};
native.Capacitor={isNativePlatform:()=>true};
native.N99Character={get:()=> 'mick'};
native.N99Result={game:'timer'};
native.N99LeaderboardLine=()=> 'Top ten, mate. It is Thursday.';
native.fetch=()=>{throw Error('Native leaderboard must not fetch web voice endpoint')};
const nativeContext=vm.createContext(native);
for(const file of ['leaderboard-speech.js','cast-static-audio-v1.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),nativeContext);
const utterance={text:native.N99LeaderboardLine()};native.speechSynthesis.speak(utterance);
assert.equal(spoken,utterance);assert.equal(spoken.lang,'en-AU');
console.log('Native leaderboard commentary reaches the device speech engine');
