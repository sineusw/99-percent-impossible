/* 99% IMPOSSIBLE — Cast picker UI only. Speech stays on Petty's proven machinery. */
(()=>{if(window.__N99_CAST_V1)return;window.__N99_CAST_V1=true;const state=window.N99Character;if(!state)return;
const chars=['petty','daisy','mick'],labels={petty:'😈 PETTY',daisy:'🌼 DAISY',mick:'🇦🇺 MICK'};
const style=document.createElement('style');style.textContent=`.cast-picker{position:fixed;right:12px;top:calc(env(safe-area-inset-top) + 10px);z-index:80;border:1px solid #ffffff2b;border-radius:999px;background:#101116eF;color:#fff;padding:8px 11px;font:800 11px/1 'Chakra Petch',system-ui;letter-spacing:.5px;box-shadow:0 4px 16px #0008;touch-action:manipulation}`;document.head.appendChild(style);const btn=document.createElement('button');btn.className='cast-picker';btn.setAttribute('aria-label','Change game voice');document.body.appendChild(btn);
function current(){const c=state.get();return chars.includes(c)?c:'petty'}function sync(){btn.textContent=labels[current()]}function setChar(c){if(!chars.includes(c))return;try{speechSynthesis.cancel()}catch{}state.set(c);sync()}btn.onclick=()=>setChar(chars[(chars.indexOf(current())+1)%chars.length]);sync();
window.N99Cast={get current(){return current()},set:setChar};
})();
