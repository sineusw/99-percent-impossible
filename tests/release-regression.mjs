import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
let failures=0,checks=0;
function check(name,fn){checks++;try{fn();console.log('PASS',name)}catch(error){failures++;console.error('FAIL',name,error.message)}}
const w=new Window({url:'https://example.test/?noads=1',settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
w.document.write(read('index.html'));
w.localStorage.setItem('n99_petty_voice','0');
w.speechSynthesis={cancel(){},speak(){},getVoices(){return []}};
w.SpeechSynthesisUtterance=function(text){this.text=text};
w.fetch=async()=>{throw new Error('offline test')};
let now=10000,nextFrame;
Object.defineProperty(w.performance,'now',{value:()=>now});
w.requestAnimationFrame=callback=>{nextFrame=callback;return 1};
w.cancelAnimationFrame=()=>{nextFrame=null};
const context=vm.createContext(w),run=code=>vm.runInContext(code,context);
for(const script of w.document.querySelectorAll('script[src]'))run(read(script.getAttribute('src').split('?')[0]));

for(const frameTime of [10500,10700]){
 now=10000;run("document.querySelector('[data-g=stop]').click();stopStart();st.tgt={x:27.2,w:22}");
 now=frameTime;nextFrame(now);
 now=10800;
 const press=new w.Event('touchstart',{bubbles:true,cancelable:true});
 Object.defineProperty(press,'timeStamp',{value:10600});
 w.document.querySelector('#primary').dispatchEvent(press);
 check(`Stop scores physical press with frame at ${frameTime}`,()=>{
  assert.ok(Math.abs(w.N99Result?.percentage-100)<1e-8);
  assert.equal(run('G("stop_attempts")'),frameTime===10500?1:2);
 });
}
now=20000;run("openGame('reaction');rxStart();clearTimeout(st.to);st.ready=1;st.start=20000;rxHit(19999)");
check('Queued pre-GO press remains TOO EARLY',()=>assert.equal(w.document.querySelector('#ms').textContent,'TOO EARLY'));
now=30000;run("openGame('timer');timerStart()");
now=30499;nextFrame(now);
check('Timer remains visible before 0.500 seconds',()=>assert.equal(w.document.querySelector('.num').textContent,'0.499'));
now=30500;nextFrame(now);
check('Timer hides at 0.500 seconds',()=>assert.equal(w.document.querySelector('.num').textContent,'???'));
now=31000;run('timerStop()');
check('Exact 1.000 seconds earns perfect Timer metadata',()=>assert.ok(w.N99Result.isPerfect&&w.N99Result.percentage===100));
now=40000;run("reset();timerStart()");now=41010;run('timerStop();window.nearAttempts=G("total");primary.click();primary.click()');
check('Near-miss reveal locks rapid input',()=>assert.ok(run('st.locked&&G("total")===nearAttempts&&modal.classList.contains("hide")')));
await new Promise(resolve=>setTimeout(resolve,410));
check('Near-miss reveal releases into one result',()=>assert.ok(run('!st.locked&&G("total")===nearAttempts&&!modal.classList.contains("hide")')));
for(const [quality,expectedWidth] of [[89,22],[90,20.4]]){
 run(`document.querySelector('[data-g=stop]').click();stopStart();st.pos=st.tgt.x+st.tgt.w/2+(100-${quality})/2;stopStop();reset();stopStart()`);
 check(`Stop ${quality}% target hit applies correct next tier`,()=>assert.ok(Math.abs(run('st.tgt.w')-expectedWidth)<1e-8));
}
run('st.pos=1;stopStop();reset();stopStart()');
check('Stop miss resets difficulty to baseline',()=>assert.equal(run('st.tgt.w'),22));
check('Commentary never repeats immediately when a small pool is exhausted',()=>{
 const ids=run(`(()=>{const original=Math.random;Math.random=()=>.999;try{const lines=[{id:'audit-a',text:'A'},{id:'audit-b',text:'B'}];return Array.from({length:8},()=>PettyPersonality.choose(lines).id)}finally{Math.random=original}})()`);
 assert.ok(ids.every((id,i)=>i===0||id!==ids[i-1]));
});
await w.happyDOM.close();

// Entitlements resolve asynchronously after cast-select.js has initialized.
const cast=new Window({url:'https://example.test/'}),castContext=vm.createContext(cast);
cast.localStorage.setItem('n99_character','daisy');
let owned=false;
cast.N99Entitlements={isOwned:item=>item==='petty'||owned&&item==='daisy'};
vm.runInContext(read('cast-select.js'),castContext);
check('Unverified saved cast stays locked',()=>assert.equal(cast.N99Character.get(),'petty'));
owned=true;cast.dispatchEvent(new cast.CustomEvent('n99:entitlements'));
check('Verified saved cast is restored after startup',()=>assert.equal(cast.N99Character.get(),'daisy'));
await cast.happyDOM.close();

// Media permission is per reused element. Simulate a browser that rejects
// delayed playback unless that exact element was played inside a gesture.
const audioWindow=new Window({url:'https://example.test/'}),elements=[];
let gesture=false,rejectUnlock=false;
audioWindow.Audio=class {
 constructor(src){this.src=src;this.volume=1;this.currentTime=0;this.allowed=false;this.plays=[];this.sources=[];this.pauses=0;elements.push(this)}
 setAttribute(){}
 pause(){this.pauses++}
 play(){
  this.plays.push(this.volume);
  this.sources.push(this.src);
  if(gesture&&!rejectUnlock)this.allowed=true;
  return this.allowed?Promise.resolve():Promise.reject(new Error('NotAllowedError'));
 }
};
vm.runInContext(read('static-sfx-v1.js'),vm.createContext(audioWindow));
const flush=async()=>{await Promise.resolve();await Promise.resolve()};
gesture=true;audioWindow.dispatchEvent(new audioWindow.Event('pointerdown'));gesture=false;await flush();
check('Every pooled outcome element is warmed silently on a gesture',()=>{
 assert.equal(elements.length,9);
 assert.ok(elements.every(a=>a.allowed&&a.plays.length===1&&a.plays[0]===0&&a.pauses===1&&a.volume>0));
 assert.ok(elements.every(a=>a.sources[0].startsWith('data:audio/wav;')&&a.src.startsWith('/assets/sfx/')));
});
audioWindow.dispatchEvent(new audioWindow.Event('click'));await flush();
check('Compatibility click does not repeat a successful warmup',()=>assert.ok(elements.every(a=>a.plays.length===1)));
for(const name of ['fail','win','perfect']){
 audioWindow.N99SFX.play(name);await flush();
 check(`Delayed ${name} plays through its warmed outcome element`,()=>{
  const a=audioWindow.N99SFX.bank[name].els[0];assert.equal(a.plays.length,2);assert.ok(a.plays[1]>0);
 });
}
audioWindow.localStorage.setItem('n99_petty_voice','0');
check('Muted sound prevents outcome playback',()=>assert.equal(audioWindow.N99SFX.play('fail'),false));
await audioWindow.happyDOM.close();

const retryAudio=new Window({url:'https://example.test/'});
retryAudio.Audio=audioWindow.Audio;
vm.runInContext(read('static-sfx-v1.js'),vm.createContext(retryAudio));
rejectUnlock=true;gesture=true;retryAudio.dispatchEvent(new retryAudio.Event('pointerdown'));gesture=false;await flush();
rejectUnlock=false;gesture=true;retryAudio.dispatchEvent(new retryAudio.Event('pointerdown'));gesture=false;await flush();
check('Rejected media unlock retries on a later gesture',()=>assert.ok(Object.values(retryAudio.N99SFX.bank).every(pool=>pool.els.every(a=>a.allowed&&a.plays.length===2))));
await retryAudio.happyDOM.close();
const racingAudio=new Window({url:'https://example.test/'});
racingAudio.Audio=audioWindow.Audio;
vm.runInContext(read('static-sfx-v1.js'),vm.createContext(racingAudio));
gesture=true;racingAudio.dispatchEvent(new racingAudio.Event('pointerdown'));racingAudio.N99SFX.play('fail');gesture=false;await flush();
check('Priming completion cannot pause or replace a real outcome',()=>{
 const a=racingAudio.N99SFX.bank.fail.els[0];assert.equal(a.pauses,1);assert.equal(a.src,'/assets/sfx/fail.mp3');assert.ok(a.plays[1]>0);
});
await racingAudio.happyDOM.close();

// Verify generated phrase paths without calling the paid speech API.
const phraseWindow=new Window({url:'https://example.test/'}),phraseContext=vm.createContext(phraseWindow);
for(const file of ['cast-audio-available.js','cast-lines.js'])vm.runInContext(read(file),phraseContext);
const library=phraseWindow.N99CastLines;
function hashText(text){let h=0x811c9dc5;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')}
for(const character of ['daisy','mick'])check(`${character} commentary and preview MP3s all exist`,()=>{
 for(const lines of Object.values(library[character])){
  assert.ok(lines.length>0);
  for(const line of lines)assert.ok(fs.statSync(new URL(`../assets/${character}-audio/${hashText(line.text.trim())}.mp3`,import.meta.url)).size>0,line.id);
 }
});
await phraseWindow.happyDOM.close();

for(const character of ['petty','daisy','mick']){
 const priority=new Window({url:'https://example.test/'}),spoken=[];
 let cancellations=0;
 priority.speechSynthesis={speak:u=>spoken.push(u),cancel:()=>{cancellations++}};
 priority.N99Character={get:()=>character};
 priority.PettyPersonality={pools:{interrupt:[{text:'Petty interrupt'}]}};
 priority.N99CastLines={daisy:{interrupt:[{text:'Daisy interrupt'}]},mick:{interrupt:[{text:'Mick interrupt'}]}};
 vm.runInContext(read('petty-priority-v1.js'),vm.createContext(priority));
 const interrupt={text:character[0].toUpperCase()+character.slice(1)+' interrupt'};
 priority.speechSynthesis.speak(interrupt);
 priority.speechSynthesis.speak({text:'Normal result'});priority.speechSynthesis.cancel();
 check(`${character} interruption protects speech from normal gameplay`,()=>assert.ok(spoken.length===1&&cancellations===0));
 priority.__PETTY_AD_BANTER_LOCK=true;priority.speechSynthesis.cancel();
 check(`${character} ad speech retains highest priority`,()=>assert.equal(cancellations,1));
 await priority.happyDOM.close();
}
console.log(`${checks-failures}/${checks} release regression checks passed`);
process.exitCode=failures?1:0;
