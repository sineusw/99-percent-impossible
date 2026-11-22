import {Window} from 'happy-dom';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w=new Window({url:'http://localhost/'});w.document.write('<section id="home" class="on"><div class="stats"></div></section><section id="game"><div class="stats"></div></section>');
const frames=[];w.requestAnimationFrame=fn=>frames.push(fn);
vm.runInContext(fs.readFileSync(new URL('../layout-polish-v1.js',import.meta.url),'utf8'),vm.createContext(w));
for(let i=0;i<12;i++){w.document.body.appendChild(w.document.createElement('i'));await new Promise(r=>setTimeout(r,1));}
assert.equal(frames.length,1,'Mutations before a paint must queue only one controls layout');
frames.shift()();w.document.body.appendChild(w.document.createElement('i'));await new Promise(r=>setTimeout(r,1));assert.equal(frames.length,1,'A later frame must still be scheduled');
await w.happyDOM.abort();w.close();console.log('Layout mutations coalesce to one controls placement per frame');
