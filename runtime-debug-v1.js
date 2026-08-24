/* 99% IMPOSSIBLE — temporary runtime diagnostics v1.1
   Enabled only with ?debug=1. Observes state; does not change gameplay/ad logic.
   Collapsed by default so device testing is not obstructed. */
(()=>{
'use strict';
const qs=new URLSearchParams(location.search);if(qs.get('debug')!=='1')return;
const lines=[];let shell=null,panel=null,pre=null,badge=null,expanded=false;
function stamp(){return performance.now().toFixed(1)}
function safe(v){try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}}
function refreshBadge(){if(badge)badge.textContent='DBG '+lines.length}
function log(tag,msg,data){const text=`${stamp()} [${tag}] ${msg}${data===undefined?'':' '+safe(data)}`;lines.push(text);if(lines.length>160)lines.shift();console.log(text,data===undefined?'':data);refreshBadge();if(pre){pre.textContent=lines.join('\n');pre.scrollTop=pre.scrollHeight}}
function setExpanded(next){expanded=!!next;if(!shell)return;panel.style.display=expanded?'block':'none';badge.style.display=expanded?'none':'block';shell.style.pointerEvents='none'}
function ensurePanel(){if(shell)return;shell=document.createElement('div');shell.id='n99-runtime-debug-shell';shell.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace';
 badge=document.createElement('button');badge.id='n99-debug-badge';badge.type='button';badge.textContent='DBG 0';badge.style.cssText='position:absolute;right:10px;bottom:10px;pointer-events:auto;border:1px solid #00ffa3;background:rgba(0,0,0,.82);color:#9fffcf;border-radius:999px;padding:8px 10px;font:700 11px/1 system-ui;box-shadow:0 4px 18px rgba(0,0,0,.35)';badge.onclick=e=>{e.preventDefault();e.stopPropagation();setExpanded(true)};
 panel=document.createElement('div');panel.id='n99-runtime-debug';panel.style.cssText='display:none;position:absolute;left:8px;right:8px;bottom:8px;max-height:46vh;pointer-events:auto;background:rgba(0,0,0,.96);color:#9fffcf;border:1px solid #00ffa3;border-radius:12px;font:10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;padding:34px 8px 8px;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.6)';panel.innerHTML='<div style="position:absolute;top:8px;left:10px;font-weight:800;color:#fff">DEBUG MODE</div><button id="n99-debug-collapse" style="position:absolute;top:5px;right:64px;font:10px system-ui;padding:4px 7px">HIDE</button><button id="n99-debug-copy" style="position:absolute;top:5px;right:8px;font:10px system-ui;padding:4px 7px">COPY</button><pre style="margin:0;max-height:38vh;overflow:auto;-webkit-overflow-scrolling:touch;white-space:pre-wrap;word-break:break-word"></pre>';
 shell.appendChild(badge);shell.appendChild(panel);document.body.appendChild(shell);pre=panel.querySelector('pre');panel.querySelector('#n99-debug-collapse').onclick=e=>{e.preventDefault();e.stopPropagation();setExpanded(false)};panel.querySelector('#n99-debug-copy').onclick=e=>{e.preventDefault();e.stopPropagation();navigator.clipboard?.writeText(lines.join('\n')).catch(()=>{}};log('DBG','enabled',{adtest:qs.get('adtest'),noads:qs.get('noads')});setExpanded(false)}
function gameState(){const s=typeof st!=='undefined'?st:null,a=window.N99Ads;return{g:s?.g,run:s?.run,ready:s?.ready,locked:s?.locked,total:+(localStorage.getItem('n99_total')||0),streak:+(localStorage.getItem('n99_currentStreak')||0),pending:a?.pending,adOpen:a?.adOpen,claimed:a?.adBoundaryClaimed,adOpened:a?.adOpened,claiming:a?.claimInProgress,visible:document.visibilityState,modalHidden:document.querySelector('#modal')?.classList.contains('hide')}}
function audioState(){const c=typeof st!=='undefined'?st.ctx:null;return{exists:!!c,state:c?.state||'none',currentTime:c?.currentTime}}
function changed(a,b){return JSON.stringify(a)!==JSON.stringify(b)}
function install(){ensurePanel();log('STATE','initial',gameState());log('AUDIO','initial',audioState());
 let last=gameState(),lastAudio=audioState();setInterval(()=>{const n=gameState(),au=audioState();if(changed(last,n)){log('STATE','transition',n);last=n}if(changed(lastAudio,au)){log('AUDIO','transition',au);lastAudio=au}},100);
 const play=document.querySelector('#play');if(play){const input=e=>{if(typeof st==='undefined'||st.g!=='reaction')return;const raw=Number(e.timeStamp),now=performance.now(),norm=window.N99ReactionScoring?.normalizePressTime?.(raw);log('RXINPUT',e.type,{raw,perfNow:now,normalized:norm,rawMinusNow:raw-now,pointerType:e.pointerType||'touch',run:st.run,ready:st.ready,locked:st.locked})};play.addEventListener('touchstart',input,{capture:true,passive:true});play.addEventListener('pointerdown',input,{capture:true,passive:true})}
 document.addEventListener('click',e=>{if(!e.target?.matches?.('#retry,#close,#primary'))return;log('CLICK',e.target.id+' sync',gameState());queueMicrotask(()=>log('CLICK',e.target.id+' after microtasks',gameState()))},true);
 document.addEventListener('visibilitychange',()=>log('VIS',document.visibilityState,gameState()));
 window.addEventListener('n99:reaction-result',e=>log('RXRESULT','result',e.detail));
 if(typeof window.tone==='function'){const oldTone=window.tone;window.tone=function(...args){log('AUDIO','tone()', {f:args[0],dur:args[1],type:args[2],ctx:audioState()});return oldTone.apply(this,args)}}
 if(typeof window.rxStart==='function'){const oldStart=window.rxStart;window.rxStart=function(...args){log('RX','rxStart before',{state:gameState(),audio:audioState()});const out=oldStart.apply(this,args);log('RX','rxStart after',{state:gameState(),audio:audioState()});return out}}
 if(typeof window.rxHit==='function'){const oldHit=window.rxHit;window.rxHit=function(...args){log('RX','rxHit before',{pressTime:args[0],perfNow:performance.now(),go:typeof st!=='undefined'?st.start:null,audio:audioState()});const out=oldHit.apply(this,args);log('RX','rxHit after',{result:window.N99ReactionResult,state:gameState(),audio:audioState()});return out}}
 const origResume=typeof st!=='undefined'&&st.ctx?.resume?st.ctx.resume:null;log('DBG','hooks installed',{toneWrapped:typeof window.tone==='function',rxStartWrapped:typeof window.rxStart==='function',rxHitWrapped:typeof window.rxHit==='function',resumePresent:!!origResume});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.N99RuntimeDebug={log,lines,state:gameState,audio:audioState,expand:()=>setExpanded(true),collapse:()=>setExpanded(false)};
})();
