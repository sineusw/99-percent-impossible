/* 99% IMPOSSIBLE — Cast picker v1.3.0
   - Petty remains free.
   - Daisy/Mick show verified ownership or $1.99 purchase actions.
   - Purchase flow delegates to N99Entitlements / Stripe Checkout.
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
.cast-menu-backdrop{position:fixed;inset:0;z-index:119;background:#0009;display:flex;align-items:flex-start;justify-content:flex-end;padding:calc(env(safe-area-inset-top) + 62px) 12px 12px;font-family:'Chakra Petch',system-ui}
.cast-menu-backdrop[hidden]{display:none}
.cast-menu{width:min(290px,calc(100vw - 24px));border:1px solid #00d8f675;border-radius:16px;background:#11131af8;padding:12px;box-shadow:0 12px 38px #000c,0 0 20px #00d8f620;color:#fff}
.cast-menu-title{font-size:10px;font-weight:900;letter-spacing:1.5px;color:#00d8f6;margin:0 0 8px}
.cast-choice{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #ffffff20;border-radius:12px;background:#191c25;color:#fff;padding:11px 12px;margin-top:7px;font:900 13px 'Chakra Petch',system-ui;text-align:left;touch-action:manipulation}
.cast-choice[aria-current="true"]{border-color:#00ffa380;box-shadow:inset 0 0 0 1px #00ffa32c}
.cast-choice .cast-price{font-size:10px;letter-spacing:.6px;color:#00ffa3;white-space:nowrap}
.cast-choice.locked .cast-price{color:#ffd166}
.cast-choice:active{filter:brightness(1.18)}
`;
  document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.className='cast-picker';
  btn.setAttribute('aria-label','Change game voice');
  btn.setAttribute('title','Tap to change voice');
  document.body.appendChild(btn);

  const backdrop=document.createElement('div');
  backdrop.className='cast-menu-backdrop';
  backdrop.hidden=true;
  backdrop.innerHTML='<div class="cast-menu" role="dialog" aria-label="Choose game voice"><div class="cast-menu-title">CHOOSE YOUR VOICE</div><div class="cast-options"></div></div>';
  document.body.appendChild(backdrop);
  const options=backdrop.querySelector('.cast-options');

  function owned(c){return c==='petty'||!!window.N99Entitlements?.isOwned?.(c)}
  function current(){const c=state.get();return chars.includes(c)?c:'petty'}
  function sync(){
    btn.innerHTML=`<span class="cast-hint">🎙 TAP TO CHANGE VOICE</span><span class="cast-current"><span>${labels[current()]}</span><span class="cast-arrow">⌄</span></span>`;
    renderMenu();
  }
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
    if(!chars.includes(c)||!owned(c))return false;
    stopVoice();
    if(!state.set(c))return false;
    sync();
    if(announce)preview(c,true);
    return true;
  }
  function renderMenu(){
    if(!options)return;
    options.innerHTML=chars.map(c=>{
      const isOwned=owned(c);
      const right=c==='petty'?'FREE':(isOwned?'OWNED':'🔒 $1.99');
      return `<button class="cast-choice ${isOwned?'':'locked'}" data-cast="${c}" aria-current="${current()===c?'true':'false'}"><span>${labels[c]}</span><span class="cast-price">${right}</span></button>`;
    }).join('');
  }
  function openMenu(){renderMenu();backdrop.hidden=false}
  function closeMenu(){backdrop.hidden=true}

  btn.addEventListener('click',openMenu);
  backdrop.addEventListener('click',async e=>{
    if(e.target===backdrop){closeMenu();return}
    const choice=e.target.closest?.('.cast-choice');
    if(!choice)return;
    const c=choice.dataset.cast;
    if(owned(c)){
      closeMenu();
      setChar(c,true);
      return;
    }
    closeMenu();
    await window.N99Entitlements?.purchase?.(c);
  });
  window.addEventListener('n99:entitlements',sync);
  window.N99Entitlements?.ready?.then(sync).catch(()=>{});
  sync();
  window.N99Cast={get current(){return current()},set:c=>setChar(c,false),announceIntro:()=>preview(current()),stop:stopVoice};
}

initCastPicker();
})();
