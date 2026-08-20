/* v0.6.2 — simple one-tap Petty voice toggle */
(()=>{
  const KEY='n99_petty_voice';
  const old=document.querySelector('.petty-voice');
  if(!old)return;
  old.style.display='none';

  const btn=document.createElement('button');
  btn.className='petty-voice petty-voice-simple';
  btn.style.display='block';
  btn.setAttribute('aria-label','Toggle Petty voice');
  document.body.appendChild(btn);

  const on=()=>localStorage.getItem(KEY)!=='0';
  const sync=()=>{
    btn.textContent=on()?'🔊':'🔇';
    btn.classList.toggle('off',!on());
    btn.title=on()?'Petty Voice: ON':'Petty Voice: OFF';
    btn.setAttribute('aria-pressed',on()?'true':'false');
  };

  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    const next=!on();
    localStorage.setItem(KEY,next?'1':'0');
    if(!next)try{window.speechSynthesis?.cancel?.()}catch{}
    sync();
  });
  sync();
})();
