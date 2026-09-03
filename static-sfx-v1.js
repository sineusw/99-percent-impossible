/* 99% IMPOSSIBLE — SFX Engine v5.0.0
   Android native: one preloaded SoundPool transport for fail/win/perfect.
   Web/iOS fallback: existing HTMLAudio bank. No timer-specific fresh Audio objects.
   SFX evidence is scoped locally; no global media prototype patches. */
(()=>{
'use strict';
const SFX_MAP={fail:'/assets/sfx/fail.mp3',win:'/assets/sfx/win.mp3',perfect:'/assets/sfx/perfect.mp3'};
const bank={};
const soundOn=()=>localStorage.getItem('n99_petty_voice')!=='0';
const isNative=()=>!!window.Capacitor?.isNativePlatform?.();
const nativePlugin=()=>window.Capacitor?.Plugins?.N99Sfx||null;
const evidence=[];
function note(type,data={}){
  const entry={t:new Date().toISOString(),type,...data};
  evidence.push(entry);if(evidence.length>30)evidence.shift();
  window.__N99SfxEvidence={events:evidence,last:entry};
  try{localStorage.setItem('n99_sfx_evidence',JSON.stringify(window.__N99SfxEvidence))}catch{}
  try{console.log('[N99 SFX]',entry)}catch{}
}

Object.keys(SFX_MAP).forEach(key=>{
  const a=new Audio();
  a.src=SFX_MAP[key];
  a.preload='auto';
  a.playsInline=true;
  a.setAttribute('playsinline','');
  a.volume=key==='perfect'?.75:.6;
  bank[key]=a;
});

function playWeb(name){
  const sound=bank[name];
  if(!sound)return false;
  try{
    sound.pause();
    sound.currentTime=0;
    const p=sound.play();
    p?.then?.(()=>note('web:play:resolved',{name,src:sound.currentSrc||sound.src||''}))
      .catch?.(err=>note('web:play:rejected',{name,error:err?.name||'',message:err?.message||String(err)}));
    return true;
  }catch(err){
    note('web:play:threw',{name,error:err?.name||'',message:err?.message||String(err)});
    return false;
  }
}

function play(name){
  if(!soundOn()){note('muted',{name});return false}
  if(!SFX_MAP[name])return false;

  if(isNative()){
    const plugin=nativePlugin();
    if(plugin?.play){
      try{
        const p=plugin.play({name});
        p?.then?.(r=>note('native:play:resolved',{name,streamId:r?.streamId||0}))
          .catch?.(err=>note('native:play:rejected',{name,error:err?.name||'',message:err?.message||String(err)}));
        return true;
      }catch(err){
        note('native:play:threw',{name,error:err?.name||'',message:err?.message||String(err)});
        return false;
      }
    }
    note('native:plugin-unavailable',{name});
  }
  return playWeb(name);
}

function prime(){
  if(isNative()&&nativePlugin()?.play){note('native:ready');return true}
  Object.entries(bank).forEach(([name,a])=>{try{a.load();note('web:prime',{name})}catch(err){note('web:prime:error',{name,message:err?.message||String(err)})}});
  return true;
}

window.N99SFX={play,prime,bank,evidence:()=>evidence.slice()};
// Reaction TOO EARLY uses the same fail asset; no fourth sound or transport.
window.N99DiscreteSFX={playEarlyFail:()=>play('fail')};
window.audio=function(){return null};
window.tone=function(){return};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();return play('fail')};
window.win=function(t){if(typeof untick==='function')untick();return play(t==='perfect'?'perfect':'win')};
})();
