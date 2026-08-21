/* Device-pass only: verify greeting cutoff + theme dispatch without touching production. */
(()=>{
  const pp=window.PettyPersonality;
  if(pp&&pp.interruptAndSpeak&&!pp.__deviceGreetingWrap){
    pp.__deviceGreetingWrap=true;
    const original=pp.interruptAndSpeak.bind(pp);
    pp.interruptAndSpeak=function(text,kind='normal'){
      const onHome=document.querySelector('#home')?.classList.contains('on');
      if(onHome&&kind==='normal'&&!window.__N99_GREETING_DIRECT){
        window.__N99_GREETING_DIRECT=true;
        try{window.speechSynthesis?.cancel?.()}catch{}
        try{
          const u=new SpeechSynthesisUtterance(text);
          u.lang='en-GB';u.rate=.99;u.pitch=.86;u.volume=1;
          u.onend=u.onerror=()=>{window.__N99_GREETING_DIRECT=false};
          window.speechSynthesis?.speak?.(u);
          return true;
        }catch{window.__N99_GREETING_DIRECT=false}
      }
      return original(text,kind);
    };
  }

  document.addEventListener('pointerdown',e=>{
    if(!window.__N99_GREETING_DIRECT)return;
    if(!e.target?.closest?.('[data-g],#primary,#retry'))return;
    try{window.speechSynthesis?.cancel?.()}catch{}
    window.__N99_GREETING_DIRECT=false;
  },true);

  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('.cos-btn'))return;
    setTimeout(()=>{
      const cos=window.N99Cosmetics;
      const id=cos?.activeId?.()||'default';
      const targetName=cos?.THEMES?.[id]?.targetName||'GREEN';
      window.dispatchEvent(new CustomEvent('n99:themechange',{detail:{id,targetName}}));
    },25);
  },false);
})();