/* v0.6.4 — one button, one tap, one voice state; re-arm selected cast on unmute */
(()=>{
  const KEY='n99_petty_voice';
  const old=document.querySelector('.petty-voice');
  if(!old)return;

  // Replace the original control entirely so none of its old click/double-tap
  // listeners can interfere with the simple ON/OFF behavior.
  const btn=old.cloneNode(false);
  btn.className='petty-voice petty-voice-simple';
  btn.removeAttribute('style');
  btn.setAttribute('aria-label','Toggle Petty voice');
  old.replaceWith(btn);

  const on=()=>localStorage.getItem(KEY)!=='0';
  const sync=()=>{
    const enabled=on();
    btn.textContent=enabled?'🔊':'🔇';
    btn.classList.toggle('off',!enabled);
    btn.title=enabled?'Petty Voice: ON':'Petty Voice: OFF';
    btn.setAttribute('aria-pressed',enabled?'true':'false');
  };

  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    const enabled=!on();
    localStorage.setItem(KEY,enabled?'1':'0');
    if(enabled){
      const cast=window.N99Character?.get?.()||'petty';
      if(cast==='daisy'||cast==='mick'){
        try{window.N99CastStaticAudio?.unlock?.(cast)}catch{}
      }else{
        try{window.unlockPettyVoice?.()}catch{}
      }
    }else{
      try{window.speechSynthesis?.cancel?.()}catch{}
    }
    sync();
  });
  sync();
})();
