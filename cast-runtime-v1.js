/* 99% IMPOSSIBLE — Cast picker UI + immediate selected-cast intro on user gesture. */
(()=>{if(window.__N99_CAST_V1)return;window.__N99_CAST_V1=true;const state=window.N99Character;if(!state)return;
const chars=['petty','daisy','mick'],labels={petty:'😈 PETTY',daisy:'🌼 DAISY',mick:'🇦🇺 MICK'};
const style=document.createElement('style');style.textContent=`
.cast-picker{position:fixed;right:12px;top:calc(env(safe-area-inset-top) + 10px);z-index:80;border:1px solid #00d8f680;border-radius:14px;background:linear-gradient(180deg,#171922f5,#0d0e12f5);color:#fff;padding:8px 11px 9px;min-width:116px;font-family:'Chakra Petch',system-ui;box-shadow:0 0 0 1px #ffffff10,0 5px 18px #0009,0 0 16px #00d8f626;touch-action:manipulation;text-align:left}
.cast-picker .cast-hint{display:block;color:#00d8f6;font-size:9px;font-weight:900;line-height:1;letter-spacing:1.25px;margin-bottom:5px}
.cast-picker .cast-current{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:900;line-height:1;letter-spacing:.45px}
.cast-picker .cast-arrow{color:#00ffa3;font-size:13px;line-height:1}
.cast-picker:active{transform:translateY(1px);filter:brightness(1.12)}
`;document.head.appendChild(style);const btn=document.createElement('button');btn.className='cast-picker';btn.setAttribute('aria-label','Change game voice');btn.setAttribute('title','Tap to change voice');document.body.appendChild(btn);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function current(){const c=state.get();return chars.includes(c)?c:'petty'}
function sync(){btn.innerHTML=`<span class="cast-hint">🎙 TAP TO CHANGE VOICE</span><span class="cast-current"><span>${labels[current()]}</span><span class="cast-arrow">↻</span></span>`}
function speakCastIntro(c){if(c!=='daisy'&&c!=='mick')return;const pool=window.N99CastLines?.[c]?.intro||[];const line=pool.length?pick(pool):null;if(!line?.text)return;window.__N99_CAST_WELCOME_SAID=true;try{window.PettyPersonality?.speak?.(line.text,true,'welcome')}catch{}}
function setChar(c,announce=false){if(!chars.includes(c))return;try{speechSynthesis.cancel()}catch{}state.set(c);sync();if(announce)speakCastIntro(c)}
btn.onclick=()=>setChar(chars[(chars.indexOf(current())+1)%chars.length],true);sync();
window.N99Cast={get current(){return current()},set:c=>setChar(c,false),announceIntro:()=>speakCastIntro(current())};
})();
