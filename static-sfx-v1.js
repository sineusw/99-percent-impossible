/* 99% IMPOSSIBLE — Safari-reliable SFX bank
   HTMLAudioElement pool with tiny generated WAV blobs.
   Mirrors the proven blob-URL playback path used by character voices.
   No new gesture listeners. No Web Audio SFX. No high-pitched synthesized beeps. */
(()=>{
'use strict';

const SR=22050,POOL_SIZE=3,banks={},urls={};
let unlocked=false,seed=99;

function rnd(){seed=(seed*1664525+1013904223)>>>0;return(seed/4294967296)*2-1}
function expEnv(t,d,k=7){return Math.exp(-k*t/Math.max(d,.000001))}
function clamp(v){return Math.max(-1,Math.min(1,v))}
function pcm(dur,fn){
  const n=Math.max(1,Math.floor(SR*dur)),a=new Float32Array(n);let peak=.000001;
  for(let i=0;i<n;i++){const v=fn(i/SR,dur);a[i]=v;peak=Math.max(peak,Math.abs(v))}
  const s=.78/peak;for(let i=0;i<n;i++)a[i]=clamp(a[i]*s);return a;
}
function wavBlob(samples){
  const bytes=44+samples.length*2,b=new ArrayBuffer(bytes),v=new DataView(b);
  const str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  str(0,'RIFF');v.setUint32(4,bytes-8,true);str(8,'WAVE');str(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);
  v.setUint32(28,SR*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);
  let o=44;for(let i=0;i<samples.length;i++,o+=2)v.setInt16(o,Math.round(samples[i]*32767),true);
  return new Blob([b],{type:'audio/wav'});
}
function makeUrl(name,samples){urls[name]=URL.createObjectURL(wavBlob(samples));return urls[name]}

const sources={
  tap:makeUrl('tap',pcm(.12,(t,d)=>rnd()*expEnv(t,d,16)*.60)),
  tick:makeUrl('tick',pcm(.11,(t,d)=>rnd()*expEnv(t,d,20)*.42)),
  start:makeUrl('start',pcm(.22,(t,d)=>Math.sin(2*Math.PI*(120-30*t/d)*t)*expEnv(t,d,8)*.50+rnd()*expEnv(t,d,15)*.25)),
  go:makeUrl('go',pcm(.28,(t,d)=>Math.sin(2*Math.PI*(170+180*t/d)*t)*expEnv(t,d,6)*.28+rnd()*expEnv(t,d,9)*.45)),
  blind:makeUrl('blind',pcm(.30,(t,d)=>rnd()*Math.min(1,t/.04)*expEnv(t,d,6)*.42+Math.sin(2*Math.PI*300*t)*expEnv(t,d,8)*.12)),
  fail:makeUrl('fail',pcm(.42,(t,d)=>Math.sin(2*Math.PI*(110-45*t/d)*t)*expEnv(t,d,5)*.70+rnd()*expEnv(t,d,11)*.20)),
  win:makeUrl('win',pcm(.42,(t,d)=>{const a=Math.sin(2*Math.PI*392*t)*expEnv(t,d,6)*.30,u=t-.10,b=u>=0?Math.sin(2*Math.PI*523.25*u)*Math.exp(-7*u/Math.max(d-.1,.01))*.35:0;return a+b+rnd()*expEnv(t,d,16)*.06})),
  perfect:makeUrl('perfect',pcm(.55,(t,d)=>{let out=0;for(const [delay,freq,amp] of [[0,392,.25],[.09,523.25,.30],[.18,659.25,.32]])if(t>=delay){const u=t-delay;out+=Math.sin(2*Math.PI*freq*u)*Math.exp(-7*u/Math.max(d-delay,.01))*amp}return out+rnd()*expEnv(t,d,18)*.05}))
};

function build(name,url){
  const pool=[];
  for(let i=0;i<POOL_SIZE;i++){
    const a=new Audio(url);a.preload='auto';a.volume=name==='tick'?.22:.62;pool.push(a);
  }
  banks[name]=pool;
}
Object.keys(sources).forEach(n=>build(n,sources[n]));

function unlock(){
  if(unlocked)return true;
  unlocked=true;
  Object.values(banks).flat().forEach(el=>{
    try{
      const p=el.play();if(p&&p.catch)p.catch(()=>{});
      el.pause();el.currentTime=0;
    }catch{}
  });
  return true;
}

function play(name){
  const pool=banks[name];if(!pool)return false;
  if(!unlocked)unlock();
  const el=pool.find(a=>a.paused||a.ended)||pool[0];
  try{
    el.currentTime=0;
    const p=el.play();if(p&&p.catch)p.catch(()=>{});
    return true;
  }catch{return false}
}

window.N99SFX={play,prime:unlock,bank:sources};

// Preserve the existing anti-beep overrides so old Web Audio tones never come back.
window.ticks=function(){try{untick()}catch{}try{window.N99SFX.play('tick')}catch{}};
window.failSound=function(){try{untick()}catch{}try{window.N99SFX.play('fail')}catch{}};
window.win=function(t){try{untick()}catch{}try{window.N99SFX.play(t==='perfect'?'perfect':'win')}catch{}};
})();
