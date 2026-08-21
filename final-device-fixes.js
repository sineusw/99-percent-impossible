/* 99% IMPOSSIBLE — final device-pass cleanup
   1) Reaction Test displays ONE timing number only. The old near-miss overlay
      (e.g. "35ms FROM YOUR BEST") looked like a second/conflicting score.
   2) Reaction Test waiting period is silent. One clean GO cue remains, then
      the normal result sound. This avoids the odd ticking/audio behavior.
*/
(()=>{
  'use strict';
  if(typeof rxStart!=='function'||typeof rxHit!=='function')return;

  const baseRxStart=rxStart;
  rxStart=function(){
    const baseTicks=ticks;
    // The random waiting period should not tick. That also keeps Reaction Test
    // primarily visual instead of giving the player an unnecessary rhythm cue.
    ticks=function(mode){
      if(mode==='reaction'){ try{untick()}catch{} return; }
      return baseTicks(mode);
    };
    try{return baseRxStart.apply(this,arguments)}
    finally{ticks=baseTicks}
  };

  const baseRxHit=rxHit;
  rxHit=function(){
    const baseNearReveal=nearReveal;
    // Reaction already has a real score. Never flash a second large number
    // representing distance from the previous PB before showing the score.
    nearReveal=function(kind,label,sub,cb){
      if(kind==='reaction'){ cb(); return; }
      return baseNearReveal(kind,label,sub,cb);
    };
    try{return baseRxHit.apply(this,arguments)}
    finally{nearReveal=baseNearReveal}
  };
})();