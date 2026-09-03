/* 99% IMPOSSIBLE — earned native Share Result loop.
   Shows only for meaningful results; native share sheet first, clipboard fallback. */
(()=>{
  'use strict';

  const modal=document.querySelector('#modal');
  const button=document.querySelector('#copy');
  const retry=document.querySelector('#retry');
  const result=document.querySelector('#res');
  const game=document.querySelector('#mg');
  const score=document.querySelector('#ms');
  const meta=document.querySelector('#mm');
  const attempts=document.querySelector('#att');
  if(!modal||!button||!retry||!result||!game||!score||!meta)return;

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
    #copy.n99-share-result:active{transform:translateY(1px);filter:brightness(1.16)}
  `;
  document.head.appendChild(style);
  button.classList.add('n99-share-result');
  retry.insertAdjacentElement('afterend',button);

  const numericPercent=text=>{
    const m=String(text||'').match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    return m?Number(m[1]):null;
  };

  function qualifies(){
    if(modal.classList.contains('hide'))return false;
    const title=(game.textContent||'').trim();
    const scoreText=(score.textContent||'').trim();
    if(!title||!scoreText||/TOO EARLY/i.test(scoreText))return false;

    const isPB=!!result.querySelector('.new');
    const attemptCount=Number.parseInt(attempts.textContent||'0',10)||0;
    let pct=null;
    if(title==='PERFECT STOP')pct=numericPercent(scoreText);
    else pct=numericPercent(meta.textContent);

    const notable=Number.isFinite(pct)&&pct>=99;
    return notable||(isPB&&attemptCount>1);
  }

  function payload(){
    const title=(game.textContent||'99% IMPOSSIBLE').trim();
    const scoreText=(score.textContent||'').trim();
    let pct=numericPercent(title==='PERFECT STOP'?scoreText:meta.textContent);
    const pctText=Number.isFinite(pct)&&!scoreText.includes('%')?` (${pct.toFixed(1)}%)`:'';
    const text=`I got ${scoreText}${pctText} on ${title} in 99% IMPOSSIBLE. Beat me.`;
    const url=location.origin+location.pathname;
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
  new MutationObserver(sync).observe(result,{childList:true,subtree:true});
  sync();
})();
