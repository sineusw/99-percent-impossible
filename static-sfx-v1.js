/* 99% IMPOSSIBLE — gameplay SFX disabled
   Petty voice stays enabled; timer/stop/reaction beeps, ticks, fail/win tones are intentionally silent. */
(()=>{
'use strict';
function silenceLegacyAudio(){
  try{if(typeof st!=='undefined'&&st.tick){clearInterval(st.tick);st.tick=0}}catch{}
}
const silent=()=>{silenceLegacyAudio();return false};
window.N99SFX={play:silent,prime:()=>{},bank:{}};
// app.js resolves these globals at call time, so this disables result tones too.
window.ticks=silent;
window.untick=silenceLegacyAudio;
window.failSound=silent;
window.win=silent;
})();