/* 99% IMPOSSIBLE — v0.6.3 polish
   - Result card shows the active cast line only (keeps progress delta)
   - Result/pop speaker labels follow the selected cast
   - Ads wait for a natural break and protect hot streaks
   - Petty-only retry extras stay Petty-only so Daisy/Mick never request missing Petty-text MP3s
*/
(()=>{
  const q=s=>document.querySelector(s);
  const currentCastLabel=()=>{
    const c=window.N99Character?.get?.()||'petty';
    if(c==='daisy')return 'DAISY: ';
    if(c==='mick')return 'MICK: ';
    return 'PETTY: ';
  };

  // Override the legacy hard-coded PETTY pseudo-label without touching the voice/audio stack.
  const labelStyle=document.createElement('style');
  labelStyle.textContent=`.petty-aside::before{content:attr(data-cast-label)!important}`;
  document.head.appendChild(labelStyle);

  // Keep the result card clean: once the personality aside arrives, remove the older
  // duplicate roast sentence but preserve useful CLOSER / LAST TIME delta text.
  const mr=q('#mr');
  if(mr){
    const clean=()=>{
      const aside=mr.querySelector('.petty-aside');
      if(!aside)return;
      // Set before paint (MutationObserver microtask) so muted text still names the active cast.
      aside.dataset.castLabel=currentCastLabel();
      [...mr.childNodes].forEach(node=>{
        if(node===aside)return;
        const text=(node.textContent||'').trim();
        if(/CLOSER|LAST TIME|HOLD THE LINE/i.test(text))return;
        node.remove();
      });
    };
    new MutationObserver(()=>queueMicrotask(clean)).observe(mr,{childList:true,subtree:true,characterData:true});
  }

  // Fix any temporary Petty popup attribution at the presentation layer only.
  new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(!(node instanceof Element))continue;
        const pops=node.matches?.('.petty-pop')?[node]:[...node.querySelectorAll?.('.petty-pop')||[]];
        for(const pop of pops){
          pop.textContent=(pop.textContent||'').replace(/^PETTY:\s*/i,currentCastLabel());
        }
      }
    }
  }).observe(document.body,{childList:true,subtree:true});

  // Occasional retry commentary remains Petty-only. Daisy/Mick already have their
  // own generated cast pools and should never be asked to speak Petty-only text.
  let retries=0,lastExtra=0;
  document.addEventListener('click',e=>{
    if(!(e.target?.matches?.('#retry,#primary')))return;
    if((window.N99Character?.get?.()||'petty')!=='petty')return;
    if(!window.PettyPersonality?.speak)return;
    retries++;
    const now=Date.now();
    if(retries<2||now-lastExtra<12000||Math.random()>.38)return;
    lastExtra=now;
    const lines=[
      'Again. Of course.',
      'That confidence recovered suspiciously fast.',
      'One more try. A historically reliable sentence.',
      'Back into the experiment we go.',
      'I see the previous result taught us nothing.',
      'Fine. Run it back.'
    ];
    const text=lines[Math.floor(Math.random()*lines.length)];
    setTimeout(()=>window.PettyPersonality.speak(text),180);
  },true);
})();
