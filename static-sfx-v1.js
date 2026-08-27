/* 99% IMPOSSIBLE — static/local SFX compatibility shim
   Legacy synthesized gameplay/result beeps are intentionally disabled.
   API surface is preserved so existing gameplay callers remain unchanged. */
(()=>{
'use strict';
function play(){return false}
function prime(){return true}
window.N99SFX={play,prime,bank:{}};
window.failSound=function(){try{untick?.()}catch{}};
window.win=function(){try{untick?.()}catch{}};
})();