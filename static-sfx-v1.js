/* 99% IMPOSSIBLE — Safari-safe non-beep SFX
   Uses the game's already-unlocked Web Audio context. No new gesture listeners.
   Synthesized oscillator beeps stay disabled; effects are short filtered-noise impacts. */
(()=>{
'use strict';

let noiseBuffer=null;
function ctx(){
  try{return typeof audio==='function'?audio():null}catch{return null}
}
function ensureNoise(c){
  if(noiseBuffer&&noiseBuffer.sampleRate===c.sampleRate)return noiseBuffer;
  const len=Math.max(1,Math.floor(c.sampleRate*.35));
  const b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  noiseBuffer=b;return b;
}
function burst(c,{type='bandpass',freq=900,q=.7,vol=.05,dur=.055,delay=0}={}){
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=ensureNoise(c);f.type=type;f.frequency.value=freq;f.Q.value=q;
  const t=c.currentTime+delay;
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t+.004);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(f).connect(g).connect(c.destination);src.start(t);src.stop(t+dur+.02);
}
function render(c,name){
  switch(name){
    case 'tick': burst(c,{type:'highpass',freq:2600,vol:.012,dur:.018}); break;
    case 'blind': burst(c,{type:'bandpass',freq:1500,q:.55,vol:.035,dur:.06}); break;
    case 'start': burst(c,{type:'bandpass',freq:1050,q:.5,vol:.03,dur:.04}); break;
    case 'go':
      burst(c,{type:'highpass',freq:1900,vol:.065,dur:.055});
      burst(c,{type:'bandpass',freq:900,q:.45,vol:.035,dur:.08,delay:.018});
      break;
    case 'tap': burst(c,{type:'highpass',freq:3200,vol:.035,dur:.022}); break;
    case 'fail':
      burst(c,{type:'lowpass',freq:420,q:.4,vol:.09,dur:.13});
      burst(c,{type:'bandpass',freq:260,q:.6,vol:.055,dur:.16,delay:.025});
      break;
    case 'win':
      burst(c,{type:'highpass',freq:2100,vol:.04,dur:.055});
      burst(c,{type:'bandpass',freq:1450,q:.5,vol:.045,dur:.075,delay:.055});
      break;
    case 'perfect':
      burst(c,{type:'highpass',freq:1800,vol:.055,dur:.06});
      burst(c,{type:'bandpass',freq:2400,q:.45,vol:.05,dur:.07,delay:.055});
      burst(c,{type:'highpass',freq:3300,vol:.045,dur:.08,delay:.12});
      break;
    default:return false;
  }
  return true;
}
function play(name){
  const c=ctx();if(!c)return false;
  const run=()=>{try{render(c,name)}catch{}};
  if(c.state==='running')run();
  else if(c.resume)c.resume().then(run).catch(()=>{});
  // Known SFX are handled here even if Safari finishes resume asynchronously.
  return ['tick','blind','start','go','tap','fail','win','perfect'].includes(name);
}
function prime(){
  const c=ctx();if(!c)return false;
  try{if(c.state==='suspended')c.resume().catch?.(()=>{})}catch{}
  return true;
}

window.N99SFX={play,prime,bank:{tick:1,blind:1,start:1,go:1,tap:1,fail:1,win:1,perfect:1}};

// Replace only legacy synthesized result/tick sounds. Gameplay/scoring stays untouched.
window.ticks=function(){
  try{untick()}catch{}
  try{window.N99SFX?.play?.('tick')}catch{}
};
window.failSound=function(){
  try{untick()}catch{}
  try{window.N99SFX?.play?.('fail')}catch{}
};
window.win=function(t){
  try{untick()}catch{}
  try{window.N99SFX?.play?.(t==='perfect'?'perfect':'win')}catch{}
};
})();
