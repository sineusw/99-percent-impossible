/* 99% IMPOSSIBLE — earned native Share Result loop.
   Shows only for meaningful results; native share sheet first, clipboard fallback. */
(()=>{
  'use strict';

  const modal=document.querySelector('#modal');
  const button=document.querySelector('#copy');
  const retry=document.querySelector('#retry');
  if(!modal||!button||!retry)return;

  const style=document.createElement('style');
  style.textContent=`
    #copy.n99-share-result{
      display:block;
      width:100%;
      margin:10px 0 0;
      padding:11px 14px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,.14);
      background:rgba(255,255,255,.055);
      color:#fff;
      font-family:'Chakra Petch',system-ui,sans-serif;
      font-size:12px;
      font-weight:900;
      letter-spacing:1px;
      touch-action:manipulation;
    }
    #copy.n99-share-result[hidden]{display:none!important}
    #copy.n99-share-result:active{transform:translateY(1px);filter:brightness(1.16)}
  `;
  document.head.appendChild(style);
  button.classList.add('n99-share-result');
  retry.insertAdjacentElement('afterend',button);

  function qualifies(){
    if(modal.classList.contains('hide'))return false;
    const result=window.N99Result;
    if(!result||result.isSuspicious||!Number.isFinite(result.rawScore))return false;
    return (Number.isFinite(result.percentage)&&result.percentage>=99)||
      (result.isPB&&result.hadPreviousPB);
  }

  function payload(){
    const result=window.N99Result;
    const title={timer:'PERFECT TIMER',stop:'PERFECT STOP',reaction:'REACTION TEST'}[result.game];
    const scoreText=result.game==='timer'?result.rawScore.toFixed(3)+'s':
      result.game==='stop'?result.rawScore.toFixed(1)+'%':Math.round(result.rawScore)+'ms';
    const pctText=result.game==='stop'?'':` (${result.percentage.toFixed(1)}%)`;
    const text=`I got ${scoreText}${pctText} on ${title} in 99% IMPOSSIBLE. Beat me.`;
    const isNative=!!window.Capacitor?.isNativePlatform?.()||location.protocol==='capacitor:';
    const url=isNative?'https://99-percent-impossible.vercel.app/':location.origin+location.pathname;
    return {title:'99% IMPOSSIBLE',text,url};
  }

  async function copyFallback(data){
    const value=`${data.text} ${data.url}`;
    try{
      await navigator.clipboard.writeText(value);
      return true;
    }catch{
      const area=document.createElement('textarea');
      area.value=value;
      area.setAttribute('readonly','');
      area.style.position='fixed';
      area.style.opacity='0';
      document.body.appendChild(area);
      area.select();
      let ok=false;
      try{ok=document.execCommand('copy')}catch{}
      area.remove();
      return ok;
    }
  }

  function sync(){
    const show=qualifies();
    button.hidden=!show;
    button.setAttribute('aria-hidden',show?'false':'true');
    if(show)button.textContent=navigator.share?'SHARE RESULT':'COPY RESULT';
  }

  button.onclick=async()=>{
    if(!qualifies())return;
    const data=payload();
    if(navigator.share){
      try{
        await navigator.share(data);
        button.textContent='SHARED ✓';
        navigator.vibrate?.(20);
        return;
      }catch(err){
        if(err?.name==='AbortError')return;
      }
    }
    const ok=await copyFallback(data);
    button.textContent=ok?'COPIED ✓':'COPY FAILED — PRESS & HOLD';
    if(ok)navigator.vibrate?.(20);
  };

  new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  window.addEventListener('n99:result',sync);
  sync();
})();
