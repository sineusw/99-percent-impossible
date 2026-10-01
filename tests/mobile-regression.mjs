import {Window} from 'happy-dom';
import vm from 'node:vm';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2] || new URL('..', import.meta.url).pathname);
const w=new Window({url:'http://localhost/?noads=1',settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
const ctx=vm.createContext(w);const evaluate=s=>vm.runInContext(s,ctx);
w.document.write(fs.readFileSync(path.join(root,'index.html'),'utf8'));
w.localStorage.setItem('n99_petty_voice','0');
evaluate('var speechSynthesis={cancel(){},speak(){},getVoices(){return []},addEventListener(){}};var SpeechSynthesisUtterance=function(text){this.text=text}');
for(const s of w.document.querySelectorAll('script[src]')){const name=s.getAttribute('src').split('?')[0];try{evaluate(fs.readFileSync(path.join(root,name),'utf8'))}catch(e){throw new Error('Failed to load '+name,{cause:e})}}
const results=[];const check=(name,value)=>{results.push({name,passed:!!value});console.log(value?'PASS':'FAIL',name)};
const run=s=>evaluate(s),sleep=ms=>new Promise(r=>setTimeout(r,ms));
run(`document.querySelector('[data-g="reaction"]').click()`);await sleep(250);
check('Reaction first tap opens immediately with muted audio',run('st.g==="reaction"'));
run(`openGame('reaction');rxStart();clearTimeout(st.to);st.ready=1;st.start=performance.now()-200;window.pressArgument=null;const origHit=rxHit;rxHit=function(ts){window.pressArgument=ts;return origHit(ts)};play.dispatchEvent(new Event('touchstart',{bubbles:true,cancelable:true}))`);
check('Reaction handler forwards physical timestamp',typeof w.pressArgument==='number');
check('Scored reaction restores primary retry',run('!primary.disabled'));
check('Reaction tap counts once',w.localStorage.getItem('n99_reaction_attempts')==='1');
run(`reset();openGame('timer');nearReveal('timer','NEAR','TEST',()=>modal.classList.remove('hide'));back.click()`);await sleep(500);
check('Leaving a pending result prevents stale modal',run('modal.classList.contains("hide")'));
run(`openGame('timer');timerStart();window.savedTotal=G('total');dispatchEvent(new Event('pagehide'))`);
check('Background cancels run without counting attempt',run('!st.run&&G("total")===savedTotal'));
run(`openGame('stop');stopStart()`);await sleep(50);run('stopStop()');await sleep(450);
check('Perfect Stop produces a result',run('!modal.classList.contains("hide")&&!st.run'));
run(`reset();openGame('timer');primary.click()`);
check('Native button click starts timer',run('st.run===1'));
run(`primary.dispatchEvent(new Event('touchstart',{bubbles:true,cancelable:true}));primary.dispatchEvent(new Event('pointerup',{bubbles:true,cancelable:true}));primary.click()`);
check('Touch STOP plus release counts only once',w.localStorage.getItem('n99_timer_attempts')==='1');
run(`reset();primary.click()`);
check('First START after touch/retry is not swallowed',run('st.run===1'));
run(`primary.click()`);await sleep(450);
check('Keyboard-style activation also stops timer',run('!st.run&&!modal.classList.contains("hide")'));
run(`reset();nearReveal('timer','NEAR','TEST',()=>modal.classList.remove('hide'));dispatchEvent(new Event('pagehide'))`);await sleep(450);
check('Background cancels pending result and releases lock',run('!st.locked&&modal.classList.contains("hide")'));
run(`openGame('reaction');rxStart()`);
check('Reaction has no misleading active START button',run('primary.disabled'));
run(`rxHit(performance.now())`);
check('False start restores retry control',run('!primary.disabled&&primary.textContent==="TRY AGAIN"'));
// Integrity regressions run through the full production script stack.
const reactionAt=ms=>run(`openGame('reaction');rxStart();clearTimeout(st.to);st.ready=1;st.start=performance.now();rxHit(st.start+${ms})`);
run("S('reaction_best',200);S('currentStreak',3)");
reactionAt(80);
check('Suspicious reaction preserves PB and cannot advance streak',run("G('reaction_best')===200&&G('currentStreak')===0&&!N99Result.isPB&&N99Result.isSuspicious"));
check('Suspicious 100 percent has no earned share or NEW PB',run("copyBtn.hidden&&!res.querySelector('.new')"));
reactionAt(100);
check('100ms boundary remains a legitimate elite PB',run("G('reaction_best')===100&&N99Result.isPB&&!N99Result.isSuspicious&&!copyBtn.hidden"));
run("localStorage.removeItem(K('reaction_best'));S('reaction_attempts',7)");
reactionAt(300);
check('First stored PB after earlier attempts does not earn sharing',run("N99Result.isPB&&!N99Result.hadPreviousPB&&copyBtn.hidden"));
reactionAt(280);
check('Improved existing PB earns sharing below 99 percent immediately',run("N99Result.isPB&&N99Result.hadPreviousPB&&!copyBtn.hidden"));
run("openGame('timer');timerStart();st.start=performance.now()-1000;timerStop()");
check('Timer perfect publishes explicit metadata and earns sharing',run("N99Result.game==='timer'&&N99Result.percentage>=99&&!copyBtn.hidden"));
run("openGame('stop');stopStart();st.pos=st.tgt.x+st.tgt.w/2;stopStop()");
check('Stop center hit publishes perfect result and earns sharing',run("N99Result.game==='stop'&&N99Result.isPerfect&&N99Result.percentage===100&&!copyBtn.hidden"));
for(const mode of ['timer','stop','reaction']){
  run(`openGame('${mode}');${mode==='reaction'?'rx':mode}Start();window.beforeInterrupt=localStorage.getItem('n99_total');dispatchEvent(new Event('pagehide'))`);
  check(`${mode} background cancellation clears active state neutrally`,run("!st.run&&!st.ready&&!st.locked&&N99Result===null&&localStorage.getItem('n99_total')===beforeInterrupt"));
}
for(const mode of ['timer','stop','reaction']){
  run(`openGame('${mode}');${mode==='reaction'?'rx':mode}Start();window.beforeInterrupt=G('total');Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);
  check(`${mode} hidden document cancels without counting`,run("!st.run&&G('total')===beforeInterrupt"));
  run("Object.defineProperty(document,'hidden',{configurable:true,value:false})");
}
reactionAt(200);
w.navigator.share=async data=>{w.sharedPayload=data};
await run('copyBtn.onclick()');
check('Share payload uses explicit result metadata',w.sharedPayload?.text==='I got 200ms (99.0%) on REACTION TEST in 99% IMPOSSIBLE. Beat me.');
console.log(JSON.stringify(results));await w.happyDOM.abort();w.close();process.exit(results.some(r=>!r.passed)?1:0);
