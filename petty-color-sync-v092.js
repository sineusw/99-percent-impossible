/* 99% IMPOSSIBLE — Petty palette-aware wording v0.9.2
   Keeps Petty's color-specific phrases matched to the active cosmetic theme.
*/
(()=>{
  'use strict';
  const COLORS=/\b(green|pink|gold|cyan)\b/gi;

  function activeColor(){
    const cos=window.N99Cosmetics;
    const id=cos?.activeId?.()||'default';
    return (cos?.THEMES?.[id]?.targetName||'GREEN').toLowerCase();
  }

  function syncPools(){
    const pp=window.PettyPersonality;
    if(!pp?.pools)return;
    const color=activeColor();
    Object.values(pp.pools).forEach(pool=>{
      if(!Array.isArray(pool))return;
      pool.forEach(line=>{
        if(!line||typeof line.text!=='string')return;
        if(!line.__colorTemplate)line.__colorTemplate=line.text;
        line.text=line.__colorTemplate.replace(COLORS,color);
      });
    });
  }

  // Keep displayed lines paired with the audio already requested for them.
  function sync(){syncPools()}

  setTimeout(sync,0);
  setTimeout(sync,250);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('.cos-btn')){
      setTimeout(sync,10);
      setTimeout(sync,100);
    }
  },false);

  window.N99PettyColorSync={sync,activeColor};
})();