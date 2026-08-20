/* 99% IMPOSSIBLE — v0.8.4 gameplay fixes
   - Restore exact-center double white guide in Perfect Stop
   - Keep palette color wording synced everywhere
   - Force every faster Reaction Test time to become the saved PB (no floor/cap)
*/
(()=>{
  const q=s=>document.querySelector(s);
  const THEME_NAMES={default:'GREEN',cyberpunk:'PINK',goldonly:'GOLD',synthwave:'CYAN'};
  const activeName=()=>THEME_NAMES[localStorage.getItem('n99_cos_active')||'default']||'GREEN';

  const style=document.createElement('style');
  style.textContent=`
    .target::after{
      content:'';
      position:absolute;
      inset:0;
      pointer-events:none;
      background:
        linear-gradient(90deg,
          transparent calc(50% - 6px),
          rgba(255,255,255,.98) calc(50% - 6px),
          rgba(255,255,255,.98) calc(50% - 4px),
          transparent calc(50% - 4px),
          transparent calc(50% + 4px),
          rgba(255,255,255,.98) calc(50% + 4px),
          rgba(255,255,255,.98) calc(50% + 6px),
          transparent calc(50% + 6px)
        );
      filter:drop-shadow(0 0 4px rgba(255,255,255,.8));
      border-radius:inherit;
    }
  `;
  document.head.appendChild(style);

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function syncWords(){
    const name=activeName(), low=name.toLowerCase();
    const title=q('#title')?.textContent||'';
    if(title==='PERFECT STOP'){
      setText(q('#prompt'),'Tap START, then stop the moving white marker inside the bright '+low+' target.');
      setText(q('.stopstage .note'),'WHITE LINE → '+name+' TARGET');
      const sl=q('.stopstage .sl');
      if(sl&&/WHITE HITS/i.test(sl.textContent))setText(sl,'TAP STOP WHEN WHITE HITS '+name);
    }
    if(title==='REACTION TEST'){
      setText(q('#prompt'),'Tap START, wait for the entire box to turn bright '+low+', then tap the '+low+' box.');
      const rx=q('.rx');
      if(rx){
        const div=rx.querySelector('div');
        if(div&&/GREEN/i.test(div.textContent))div.textContent=div.textContent.replace(/GREEN/gi,name);
      }
      const p=q('#primary');
      if(p&&/GREEN/i.test(p.textContent))p.textContent=p.textContent.replace(/GREEN/gi,name);
    }
    const card=q('.card[data-g="reaction"] small');
    setText(card,'Tap the instant it turns '+low);
  }

  // Re-sync after game redraws and palette changes without changing controls.
  const root=q('#game');
  if(root)new MutationObserver(()=>requestAnimationFrame(syncWords)).observe(root,{childList:true,subtree:true,attributes:true});
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('.cos-btn,.card,#retry,#primary'))setTimeout(syncWords,0);
  },true);

  // PB safety net: any legitimately displayed faster reaction time becomes the saved best.
  // There is intentionally NO 125ms floor and NO lower clamp.
  let lastSeen='';
  function syncReactionPB(){
    if((q('#mg')?.textContent||'')!=='REACTION TEST')return;
    const s=(q('#ms')?.textContent||'').trim();
    if(!/^\d+ms$/i.test(s)||s===lastSeen)return;
    lastSeen=s;
    const ms=Number.parseInt(s,10);
    if(!Number.isFinite(ms))return;
    const key='n99_reaction_best',raw=localStorage.getItem(key),old=raw===null?Infinity:Number(raw);
    if(ms<old){
      localStorage.setItem(key,String(ms));
      setText(q('#best'),ms+'ms');
      const lvl=q('.head .lvl');
      if(lvl)setText(lvl,'TARGET '+ms+'ms');
    }
  }
  const modal=q('#modal');
  if(modal)new MutationObserver(()=>queueMicrotask(syncReactionPB)).observe(modal,{attributes:true,childList:true,subtree:true,characterData:true});

  syncWords();
})();