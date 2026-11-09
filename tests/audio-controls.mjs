import {Window} from 'happy-dom';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
let failed=0,count=0;
function check(name,fn){count++;try{fn();console.log('PASS',name)}catch(e){failed++;console.error('FAIL',name,e.message)}}
for(const mode of ['interrupt','welcome']){
 const w=new Window({url:'https://example.test/'}),ctx=vm.createContext(w);let cancelled=0,stopped=0;
 w.document.write('<button class="petty-voice">Sound</button>');
 w.speechSynthesis={cancel(){cancelled++},speak(){}};
 w.N99SFX={stop(){stopped++}};
 w.PettyPersonality={pools:{interrupt:[{text:'Complaint'}]},speak(text){w.speechSynthesis.cancel();w.speechSynthesis.speak({text});return true}};
 for(const file of ['petty-priority-v1.js','petty-welcome-nocancel-v1.js','voice-controls-v062.js'])vm.runInContext(read(file),ctx);
 if(mode==='interrupt')w.speechSynthesis.speak({text:'Complaint'});else w.PettyPersonality.speakWelcome('Welcome');
 const before=cancelled;w.document.querySelector('.petty-voice-simple').click();
 check(`Mute cancels ${mode} protection immediately`,()=>assert.equal(cancelled,before+1));
 check(`Mute stops active outcome sounds during ${mode}`,()=>assert.equal(stopped,1));
 await w.happyDOM.close();
}
const w=new Window({url:'https://example.test/'}),ctx=vm.createContext(w),spoken=[];
w.localStorage.setItem('n99_petty_voice','0');
w.PettyPersonality={speak:t=>spoken.push(t),speakWelcome:t=>spoken.push(t)};
w.preloadPettyVoice=async()=>true;w.unlockPettyAudio=()=>{};
vm.runInContext(read('petty-v6.js'),ctx);await Promise.resolve();
w.dispatchEvent(new w.Event('pointerdown'));
await new Promise(resolve=>setTimeout(resolve,140));
check('Muted first gesture cannot force a welcome',()=>assert.equal(spoken.length,0));
w.localStorage.setItem('n99_petty_voice','1');w.dispatchEvent(new w.Event('pointerdown'));
w.localStorage.setItem('n99_petty_voice','0');
await new Promise(resolve=>setTimeout(resolve,140));
check('Queued welcome respects a later mute',()=>assert.equal(spoken.length,0));
await w.happyDOM.close();
console.log(`${count-failed}/${count} audio control checks passed`);process.exitCode=failed?1:0;
