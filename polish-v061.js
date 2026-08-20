/* 99% IMPOSSIBLE — v0.6.1 polish
   - Result card shows Petty's line only (keeps progress delta)
   - Ads wait for a natural break and protect hot streaks
   - Petty gets more opportunities to comment without overlapping speech
*/
(()=>{
  const q=s=>document.querySelector(s);

  // Keep the result card clean: once Petty's aside arrives, remove the older
  // duplicate roast sentence but preserve useful CLOSER / LAST TIME delta text.
  const mr=q('#mr');
  if(mr){
    const clean=()=>{
      const aside=mr.querySelector('.petty-aside');
      if(!aside)return;
      [...mr.childNodes].forEach(node=>{
        if(node===aside)return;
        const text=(node.textContent||'').trim();
        if(/CLOSER|LAST TIME|HOLD THE LINE/i.test(text))return;
        node.remove();
      });
    };
    new MutationObserver(()=>queueMicrotask(clean)).observe(mr,{childList:true,subtree:true,characterData:true});
  }

  // More Petty: occasional retry commentary. Uses the existing personality
  // engine, so on-screen text and spoken text stay identical.
  let retries=0,lastExtra=0;
  document.addEventListener('click',e=>{
    if(!(e.target?.matches?.('#retry,#primary')))return;
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
