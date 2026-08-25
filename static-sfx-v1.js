/* 99% IMPOSSIBLE — static/local HTML-audio SFX v1
   Critical cues use prebuilt in-memory WAV blobs + pooled HTMLAudioElement playback.
   No network, no Web Audio dependency, no scoring dependency. */
(()=>{
'use strict';
const SR=22050,POOLS=3;
function wavBlob(freq,dur=.09,vol=.75,kind='sine'){
  const n=Math.max(1,Math.floor(SR*dur)),bytes=44+n*2,b=new ArrayBuffer(bytes),v=new DataView(b);
  const s=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
  s(0,'RIFF');v.setUint32(4,36+n*2,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);v.setUint32(28,SR*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){
    const t=i/SR,ph=(t*freq)%1;
    let x=kind==='square'?(ph<.5?1:-1):kind==='triangle'?(1-4*Math.abs(ph-.5)):Math.sin(Math.PI*2*freq*t);
    const fade=Math.max(0,Math.min(1,i/(SR*.005),(n-i-1)/(SR*.008)));
    v.setInt16(44+i*2,Math.max(-32767,Math.min(32767,Math.round(x*vol*fade*32767))),true);
  }
  return new Blob([b],{type:'audio/wav'});
}
const SPEC={
  start:[440,.09,.8,'sine'],
  go:[980,.10,.9,'sine'],
  tap:[1200,.05,.75,'square'],
  early:[240,.16,.85,'square'],
  fail:[180,.18,.85,'square'],
  win:[760,.16,.8,'triangle']
};
const bank={};
for(const [name,args] of Object.entries(SPEC)){
  const url=URL.createObjectURL(wavBlob(...args));
  bank[name]={i:0,els:Array.from({length:POOLS},()=>{const a=new Audio(url);a.preload='auto';a.load();return a})};
}
function play(name){
  const p=bank[name]||bank.tap;if(!p)return false;
  const a=p.els[p.i++%p.els.length];
  try{a.pause();a.currentTime=0;const pr=a.play();pr?.catch?.(()=>{});return true}catch{return false}
}
function prime(){for(const p of Object.values(bank))for(const a of p.els)try{a.load()}catch{}}
window.N99SFX={play,prime,bank};
// Result feedback for all three games now uses the reliable HTML-audio path.
window.failSound=function(){try{untick?.()}catch{};play('fail')};
window.win=function(){try{untick?.()}catch{};play('win')};
})();