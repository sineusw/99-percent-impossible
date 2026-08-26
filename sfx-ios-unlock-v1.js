/* 99% IMPOSSIBLE — discrete HTMLAudioElement SFX v1.0.4-ab
   A/B diagnostic: dedicated Reaction TOO EARLY element temporarily uses known-good success asset.
   Dedicated shared SFX element plus dedicated preloaded fail element for Reaction TOO EARLY.
   48kHz / 16-bit / mono PCM WAV clips with 5ms tail fade.
   No AudioContext. No Timer/Stop ticks. No high-pitched Reaction GO beep. */
(()=>{
'use strict';
const SR=48000;
function wavData(duration,sample){
  const n=Math.max(1,Math.round(SR*duration)),bytes=44+n*2,b=new ArrayBuffer(bytes),v=new DataView(b);
  const str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  str(0,'RIFF');v.setUint32(4,bytes-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);v.setUint32(28,SR*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);
  const attack=Math.round(SR*.002),fade=Math.round(SR*.005);
  for(let i=0;i<n;i++){
    const t=i/SR,e=Math.max(0,Math.min(1,i/Math.max(1,attack),(n-1-i)/Math.max(1,fade))),x=Math.max(-1,Math.min(1,sample(t,duration)*e));
    v.setInt16(44+i*2,Math.round(x*32767),true);
  }
  const u=new Uint8Array(b);let bin='';for(let i=0;i<u.length;i+=0x8000)bin+=String.fromCharCode(...u.subarray(i,i+0x8000));
  return'data:audio/wav;base64,'+btoa(bin);
}
const SFX={
  tap:wavData(.030,(t,d)=>.52*Math.sin(2*Math.PI*180*t)*Math.exp(-5*t/d)+.16*Math.sin(2*Math.PI*320*t)*Math.exp(-6*t/d)),
  go:wavData(.040,(t,d)=>.42*Math.sin(2*Math.PI*220*t)*Math.exp(-7*t/d)+.13*Math.sin(2*Math.PI*440*t)*Math.exp(-8*t/d)),
  success:wavData(.120,(t,d)=>(.22*Math.sin(2*Math.PI*261.63*t)+.20*Math.sin(2*Math.PI*329.63*t)+.18*Math.sin(2*Math.PI*392*t))*Math.exp(-2.2*t/d)),
  fail:wavData(.100,(t,d)=>.58*Math.sin(2*Math.PI*(110-55*t/d)*t)*Math.exp(-4*t/d))
};
const a=document.createElement('audio');
a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.style.display='none';document.body?.appendChild(a);

// A/B TEST ONLY: use known-good success asset on the dedicated TOO EARLY element.
const earlyFail=document.createElement('audio');
earlyFail.preload='auto';earlyFail.playsInline=true;earlyFail.setAttribute('playsinline','');earlyFail.style.display='none';earlyFail.src=SFX.success;earlyFail.volume=.85;document.body?.appendChild(earlyFail);
try{earlyFail.load()}catch{}

const SILENT=wavData(.120,()=>0);
let primed=false,priming=false,holding=false;
function prime(){
  if(primed||priming||holding)return;
  priming=true;
  try{
    a.loop=true;a.src=SILENT;a.currentTime=0;a.volume=.01;
    const p=a.play();
    p?.then?.(()=>{primed=true;priming=false;holding=true;console.log('[SFX AUDIO LOG] gesture prime resolved')})
      .catch?.(e=>{priming=false;holding=false;console.warn('[SFX AUDIO LOG] gesture prime rejected',e)});
  }catch(e){priming=false;holding=false;console.warn('[SFX AUDIO LOG] gesture prime threw',e)}
}
addEventListener('pointerdown',prime,{capture:true});
addEventListener('touchstart',prime,{capture:true,passive:true});
function snapshot(){return{paused:a.paused,ended:a.ended,readyState:a.readyState,networkState:a.networkState,currentSrc:a.currentSrc,currentTime:a.currentTime}}
function play(name,volume=1){
  const src=SFX[name];if(!src)return;
  try{
    console.log('[SFX AUDIO LOG]',name,'BEFORE',snapshot());
    a.loop=false;holding=false;a.pause();a.src=src;a.currentTime=0;a.volume=volume;
    console.log('[SFX AUDIO LOG]',name,'src set');
    console.log('[SFX AUDIO LOG]',name,'currentTime reset');
    const p=a.play();
    console.log('[SFX AUDIO LOG]',name,'play called');
    p?.then?.(()=>{primed=true;console.log('[SFX AUDIO LOG]',name,'play resolved');console.log('[SFX AUDIO LOG]',name,'AFTER',snapshot())})
      .catch?.(e=>console.warn('[SFX AUDIO LOG]',name,'play rejected',e));
    return p;
  }catch(e){console.warn('[SFX AUDIO LOG]',name,'play threw',e)}
}
function playEarlyFail(volume=.85){
  try{
    earlyFail.pause();
    earlyFail.currentTime=0;
    earlyFail.volume=volume;
    console.log('[EARLY SFX] dedicated fail element play called',{paused:earlyFail.paused,readyState:earlyFail.readyState,currentTime:earlyFail.currentTime});
    const p=earlyFail.play();
    p?.then?.(()=>console.log('[EARLY SFX] dedicated fail play resolved',{paused:earlyFail.paused,readyState:earlyFail.readyState,currentTime:earlyFail.currentTime}))
      .catch?.(e=>console.warn('[EARLY SFX] dedicated fail play rejected',e));
    return p;
  }catch(e){console.warn('[EARLY SFX] dedicated fail play threw',e)}
}
window.N99DiscreteSFX={prime,play,playEarlyFail,format:'48kHz-16bit-mono-wav'};
window.tone=function(){play('tap',.48)};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();setTimeout(()=>play('fail',.72),20)};
window.win=function(){if(typeof untick==='function')untick();setTimeout(()=>play('success',.72),20)};
})();