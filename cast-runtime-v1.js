/* 99% IMPOSSIBLE — Cast picker v1.2.1
   - Bounded retry if N99Character is not ready yet (Android-safe init).
   - Immediate selected-voice preview on the same user gesture.
   - Uses verified generated intro assets; no new preview MP3 dependency.
   - No gameplay SFX changes. */
(()=>{
'use strict';
if(window.__N99_CAST_V1)return;
let retries=0;
const chars=['petty','daisy','mick'];
const labels={petty:'😈 PETTY',daisy:'🌼 DAISY',mick:'🇦🇺 MICK'};
const PETTY_PREVIEW='Alright. Show me something.';
const voiceEnabled=()=>localStorage.getItem('n99_petty_voice')!=='0';

function initCastPicker(){
  if(window.__N99_CAST_V1)return;
  const existing=document.querySelector('.cast-picker');
  if(existing){window.__N99_CAST_V1=true;return}
  const state=window.N99Character;
  if(!state||!document.body){
    if(retries++<40){setTimeout(initCastPicker,50);return}
    console.warn('[N99 CAST] N99Character/body never initialized — picker aborted');
    return;
  }

  window.__N99_CAST_V1=true;
  const style=document.createElement('style');
  style.textContent=`
.cast-picker{position:fixed;right:12px;top:calc(env(safe-area-inset-top) + 10px);z-index:80;border:1px solid #00d8f680;border-radius:14px;background:linear-gradient(180deg,#171922f5,#0d0e12f5);color:#fff;padding:8px 11px 9px;min-width:116px;font-family:'Chakra Petch',system-ui;box-shadow:0 0 0 1px #ffffff10,0 5px 18px #0009,0 0 16px #00d8f626;touch-action:manipulation;text-align:left}
.cast-picker .cast-hint{display:block;color:#00d8f6;font-size:9px;font-weight:900;line-height:1;letter-spacing:1.25px;margin-bottom:5px}
.cast-picker .cast-current{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:900;line-height:1;letter-spacing:.45px}
.cast-picker .cast-arrow{color:#00ffa3;font-size:13px;line-height:1}
.cast-picker:active{transform:translateY(1px);filter:brightness(1.12)}
`;
  document.head.appendChild(style);
  const btn=document.createElement('button');
  btn.className='cast-picker';
  btn.setAttribute('aria-label','Change game voice');
  btn.setAttribute('title','Tap to change voice');
  document.body.appendChild(btn);

  function current(){const c=state.get();return chars.includes(c)?c:'petty'}
  function sync(){btn.innerHTML=`<span class="cast-hint">🎙 TAP TO CHANGE VOICE</span><span class="cast-current"><span>${labels[current()]}</span><span class="cast-arrow">↻</span></span>`}
  function stopVoice(){
    try{if(window.N99CastStaticAudio?.stop)return window.N99CastStaticAudio.stop()}catch{}
    try{window.speechSynthesis?.cancel?.()}catch{}
  }
  function preview(c,alreadyStopped=false){
    if(!voiceEnabled())return false;
    if(!alreadyStopped)stopVoice();
    if(c==='daisy'||c==='mick'){
      const line=window.N99CastLines?.[c]?.intro?.[0];
      if(!line?.text)return false;
      window.__N99_CAST_WELCOME_SAID=true;
      return !!window.N99CastStaticAudio?.playText?.(c,line.text);
    }
    if(c==='petty'){
      try{window.unlockPettyAudio?.()}catch{}
      try{return !!window.PettyPersonality?.speak?.(PETTY_PREVIEW,true,'preview')}catch{return false}
    }
    return false;
  }
  function setChar(c,announce=false){
    if(!chars.includes(c))return;
    stopVoice();
    state.set(c);
    sync();
    if(announce)preview(c,true);
  }

  btn.addEventListener('click',()=>{
    const next=chars[(chars.indexOf(current())+1)%chars.length];
    setChar(next,true);
  });
  sync();
  window.N99Cast={get current(){return current()},set:c=>setChar(c,false),announceIntro:()=>preview(current()),stop:stopVoice};
}

initCastPicker();
})();
