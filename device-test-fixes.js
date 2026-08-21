/* Combined device-pass integration fixes: preserve Petty intro + theme dispatch. */
(()=>{
  const pp=window.PettyPersonality;
  let greetingActive=false;
  let greetingStartedAt=0;

  // Petty v6 calls interruptAndSpeak from the first real user gesture.
  // Treat that first home-screen line as a greeting so it can actually be
  // heard instead of being cancelled by the same tap that opened a game.
  if(pp&&pp.interruptAndSpeak&&!pp.__combinedGreetingWrap){
    pp.__combinedGreetingWrap=true;
    const original=pp.interruptAndSpeak.bind(pp);
    pp.interruptAndSpeak=function(text,kind='normal'){
      const onHome=document.querySelector('#home')?.classList.contains('on');
      const isGreeting=onHome&&kind==='normal'&&!greetingActive;
      if(isGreeting){
        greetingActive=true;
        greetingStartedAt=performance.now();
        try{window.preloadPettyVoice?.(text)}catch{}
        const ok=original(text,'greeting');
        // Failsafe: release greeting state even if a browser never returns an
        // audio end event. The next gameplay tap can still cancel it cleanly.
        setTimeout(()=>{greetingActive=false},12000);
        return ok;
      }
      return original(text,kind);
    };
  }

  // Do NOT cancel on the game-card tap: that is the gesture that unlocks and
  // starts the intro on iPhone. Cancel only when the player actually presses
  // START/TRY AGAIN, and never count this intro cancellation as Petty being
  // interrupted repeatedly.
  document.addEventListener('pointerdown',e=>{
    if(!greetingActive)return;
    if(!e.target?.closest?.('#primary,#retry'))return;
    // Ignore an impossible same-event echo right after the greeting starts.
    if(performance.now()-greetingStartedAt<120)return;
    try{window.speechSynthesis?.cancel?.()}catch{}
    greetingActive=false;
  },true);

  // Emit one canonical theme-change event for anything that wants to react to
  // palette changes. Existing color-sync behavior remains untouched.
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