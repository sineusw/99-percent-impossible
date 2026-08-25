/* 99% IMPOSSIBLE — PB chase label v1
   Reuses the existing rendered PB source (#best -> app.js pb()) rather than tracking a second best-score state. */
(()=>{
'use strict';
const label=document.querySelector('#pbChase');
const bestEl=document.querySelector('#best');
if(!label||!bestEl)return;
function render(){
  const g=typeof st!=='undefined'?st.g:null;
  const value=String(bestEl.textContent||'').trim();
  label.classList.remove('has-pb');
  if(!g){label.textContent='BEAT YOUR BEST';return}
  if(!value||value==='—'){
    label.textContent='SET YOUR FIRST BEST';
    return;
  }
  label.classList.add('has-pb');
  label.textContent='PB '+value+' · BEAT IT';
}
new MutationObserver(render).observe(bestEl,{childList:true,characterData:true,subtree:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-g]'))queueMicrotask(render)},true);
render();
})();
