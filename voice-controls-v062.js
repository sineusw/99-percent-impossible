/* v0.6.5 — explicit SOUND ON/OFF utility control; re-arm selected cast on unmute */
(()=>{
  const KEY='n99_petty_voice';
  const old=document.querySelector('.petty-voice');
  if(!old)return;
  const btn=old.cloneNode(false);
  btn.className='petty-voice petty-voice-simple';
  btn.removeAttribute('style');
  btn.setAttribute('aria-label','Toggle game voice sound');
  old.replaceWith(btn);
  const on=()=>localStorage.getItem(KEY)!=='0';
  const sync=()=>{
    const enabled=on();
    btn.innerHTML=`<span class="utility-icon">${enabled?'🔊':'🔇'}</span><span class="utility-copy"><span class="utility-label">SOUND</span><span class="utility-value utility-state">${enabled?'ON':'OFF'}</span></span>`;
    btn.classList.toggle('off',!enabled);
    btn.title=enabled?'Sound: ON':'Sound: OFF';
    btn.setAttribute('aria-pressed',enabled?'true':'false');
  };
  btn.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    const enabled=!on();localStorage.setItem(KEY,enabled?'1':'0');
    if(enabled){const cast=window.N99Character?.get?.()||'petty';if(cast==='daisy'||cast==='mick'){try{window.N99CastStaticAudio?.unlock?.(cast)}catch{}}else{try{window.unlockPettyVoice?.()}catch{}}}else{try{window.speechSynthesis?.cancel?.()}catch{}}
    sync();
  });
  sync();
})();