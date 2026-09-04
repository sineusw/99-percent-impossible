/* 99% IMPOSSIBLE — SFX Engine v5.1.0 diagnostic build
   Android native: SoundPool transport plus one-run bridge/load/play diagnostics.
   Web/iOS fallback: existing HTMLAudio bank. */
(()=>{
'use strict';
const SFX_MAP={fail:'/assets/sfx/fail.mp3',win:'/assets/sfx/win.mp3',perfect:'/assets/sfx/perfect.mp3'};
const bank={};
const soundOn=()=>localStorage.getItem('n99_petty_voice')!=='0';
const isNative=()=>!!window.Capacitor?.isNativePlatform?.();
const nativePlugin=()=>window.Capacitor?.Plugins?.N99Sfx||null;
const evidence=[];
let badge=null;

function note(type,data={}){
  const entry={t:new Date().toISOString(),type,...data};
  evidence.push(entry);if(evidence.length>60)evidence.shift();
  window.__N99SfxEvidence={events:evidence,last:entry};
  try{localStorage.setItem('n99_sfx_evidence',JSON.stringify(window.__N99SfxEvidence))}catch{}
  try{console.log('[N99 SFX]',entry)}catch{}
}

function ensureBadge(){
  if(!isNative())return null;
  if(badge?.isConnected)return badge;
  badge=document.createElement('div');
  badge.id='n99-sfx-v14-diagnostic';
  badge.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;max-width:92vw;padding:7px 9px;border-radius:8px;background:rgba(0,0,0,.86);color:#fff;font:11px/1.25 monospace;letter-spacing:.1px;pointer-events:none;white-space:normal;box-shadow:0 1px 5px rgba(0,0,0,.35)';
  badge.textContent='SFX v14 • checking bridge…';
  (document.body||document.documentElement).appendChild(badge);
  return badge;
}
function badgeText(text){const el=ensureBadge();if(el)el.textContent='SFX v14 • '+text}

async function refreshNativeDiagnostics(prefix='diag'){
  const plugin=nativePlugin();
  const visible=!!plugin;
  note('js:plugin-visibility',{visible,type:typeof plugin});
  if(!visible){badgeText('PLUGIN UNAVAILABLE');return null}
  if(typeof plugin.diagnostics!=='function'){
    badgeText('PLUGIN VISIBLE • diagnostics method missing');
    note('js:diagnostics-method-missing');
    return null;
  }
  try{
    const d=await plugin.diagnostics();
    note('native:diagnostics',{prefix,...d});
    badgeText(`PLUGIN ✓ • ${d?.stage||'stage?'} • loaded ${d?.loadedCount??'?'} / ${d?.knownCount??'?'} • stream ${d?.streamId??'?'}`);
    return d;
  }catch(err){
    note('native:diagnostics-rejected',{prefix,error:err?.name||'',message:err?.message||String(err)});
    badgeText('PLUGIN VISIBLE • diagnostics rejected');
    return null;
  }
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
  if(!soundOn()){note('muted',{name});badgeText('MUTED');return false}
  if(!SFX_MAP[name])return false;

  if(isNative()){
    const plugin=nativePlugin();
    note('js:play-attempt',{name,pluginVisible:!!plugin,playType:typeof plugin?.play});
    if(plugin?.play){
      badgeText(`JS CALL ✓ • ${name} • waiting native…`);
      try{
        const p=plugin.play({name});
        p?.then?.(r=>{
          note('native:play:resolved',{name,streamId:r?.streamId??null,stage:r?.stage||''});
          badgeText(`NATIVE PLAY ✓ • ${name} • ${r?.stage||'resolved'} • stream ${r?.streamId??'?'}`);
          refreshNativeDiagnostics('after-play-resolve');
        }).catch?.(err=>{
          note('native:play:rejected',{name,error:err?.name||'',message:err?.message||String(err)});
          badgeText(`NATIVE REJECT • ${name} • ${err?.message||String(err)}`);
          refreshNativeDiagnostics('after-play-reject');
        });
        return true;
      }catch(err){
        note('native:play:threw',{name,error:err?.name||'',message:err?.message||String(err)});
        badgeText(`JS THROW • ${err?.message||String(err)}`);
        return false;
      }
    }
    note('native:plugin-unavailable',{name});
    badgeText('PLUGIN UNAVAILABLE');
  }
  return playWeb(name);
}

function prime(){
  if(isNative()){
    ensureBadge();
    const plugin=nativePlugin();
    note('js:prime',{pluginVisible:!!plugin,pluginType:typeof plugin});
    refreshNativeDiagnostics('prime');
    if(plugin?.play)return true;
  }
  Object.entries(bank).forEach(([name,a])=>{try{a.load();note('web:prime',{name})}catch(err){note('web:prime:error',{name,message:err?.message||String(err)})}});
  return true;
}

window.N99SFX={play,prime,bank,evidence:()=>evidence.slice(),diagnostics:refreshNativeDiagnostics};
window.N99DiscreteSFX={playEarlyFail:()=>play('fail')};
window.audio=function(){return null};
window.tone=function(){return};
window.ticks=function(){if(typeof untick==='function')untick()};
window.failSound=function(){if(typeof untick==='function')untick();return play('fail')};
window.win=function(t){if(typeof untick==='function')untick();return play(t==='perfect'?'perfect':'win')};

if(isNative()){
  const start=()=>{ensureBadge();refreshNativeDiagnostics('startup')};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  setTimeout(()=>refreshNativeDiagnostics('startup+1500ms'),1500);
}
})();
