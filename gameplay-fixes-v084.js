/* 99% IMPOSSIBLE — v0.8.5 SAFE gameplay fixes
   No MutationObservers and no control overrides.
   - Perfect Stop: two exact-center white guide lines
   - Palette wording: syncs after navigation/theme actions
   - Reaction PB: accepts any legitimately faster recorded time, including <125ms
*/
(()=>{
  'use strict';
  const q=s=>document.querySelector(s);
  const NAMES={default:'GREEN',cyberpunk:'PINK',goldonly:'GOLD',synthwave:'CYAN'};
  const colorName=()=>NAMES[localStorage.getItem('n99_cos_active')||'default']||'GREEN';

  // Visual-only guide overlay. pointer-events:none means it can never block taps.
  const style=document.createElement('style');
  style.textContent=`
    .stopstage .target{position:absolute}
    .stopstage .target::after{
      content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;
      background:linear-gradient(90deg,
        transparent calc(50% - 7px),
        rgba(255,255,255,.98) calc(50% - 7px),rgba(255,255,255,.98) calc(50% - 5px),
        transparent calc(50% - 5px),transparent calc(50% + 5px),
        rgba(255,255,255,.98) calc(50% + 5px),rgba(255,255,255,.98) calc(50% + 7px),
        transparent calc(50% + 7px));
      filter:drop-shadow(0 0 4px rgba(255,255,255,.85));z-index:2
    }`;
  document.head.appendChild(style);

  function syncWords(){
    const name=colorName(),low=name.toLowerCase(),title=q('#title')?.textContent||'';
    if(title==='PERFECT STOP'){
      const p=q('#prompt'),note=q('.stopstage .note'),sl=q('.stopstage .sl');
      if(p)p.textContent=`Tap START, then stop the moving white marker inside the bright ${low} target.`;
      if(note)note.textContent=`WHITE LINE → ${name} TARGET`;
      if(sl&&/WHITE HITS/i.test(sl.textContent))sl.textContent=`TAP STOP WHEN WHITE HITS ${name}`;
    }else if(title==='REACTION TEST'){
      const p=q('#prompt');
      if(p)p.textContent=`Tap START, wait for the entire box to turn bright ${low}, then tap the ${low} box.`;
      const rx=q('.rx div');
      if(rx&&/green|pink|gold|cyan/i.test(rx.textContent))rx.textContent=rx.textContent.replace(/green|pink|gold|cyan/gi,low);
    }
    const card=q('.card[data-g="reaction"] small');
    if(card)card.textContent=`Tap the instant it turns ${low}`;
  }

  // Run only after real user actions; never capture, cancel, prevent, or replace a control event.
  document.addEventListener('click',e=>{
    const el=e.target?.closest?.('.card,.cos-btn,#primary,#retry,#back');
    if(!el)return;
    setTimeout(syncWords,30);
    setTimeout(syncWords,180);

    // PB safety net after a Reaction Test result has had time to render.
    if(el.matches('#primary'))setTimeout(()=>{
      if((q('#mg')?.textContent||'').trim()!=='REACTION TEST')return;
      const text=(q('#ms')?.textContent||'').trim();
      const m=text.match(/^(\d+)ms$/i);if(!m)return;
      const ms=Number(m[1]);if(!Number.isFinite(ms))return;
      const key='n99_reaction_best',raw=localStorage.getItem(key),old=raw===null?Infinity:Number(raw);
      if(ms<old){localStorage.setItem(key,String(ms));const b=q('#best');if(b)b.textContent=ms+'ms';}
    },80);
  });

  syncWords();
})();