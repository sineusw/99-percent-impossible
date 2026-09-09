/* 99% IMPOSSIBLE — PB gap result feedback v1
   Shows exact distance from the saved PB on non-PB results only. */
(()=>{
  'use strict';

  const modal=document.querySelector('#modal');
  const result=document.querySelector('#res');
  const game=document.querySelector('#mg');
  const score=document.querySelector('#ms');
  const best=document.querySelector('#best');
  const retry=document.querySelector('#retry');
  if(!modal||!result||!game||!score||!best||!retry)return;

  const gap=document.createElement('div');
  gap.id='pbGap';
  gap.hidden=true;
  gap.setAttribute('aria-live','polite');
  retry.insertAdjacentElement('beforebegin',gap);

  const style=document.createElement('style');
  style.textContent=`
    #pbGap{
      margin:12px 0 2px;
      font-family:'Chakra Petch',system-ui,sans-serif;
      font-size:11px;
      font-weight:900;
      letter-spacing:.9px;
      text-align:center;
      color:#9b9baa;
    }
    #pbGap.close{
      color:#00FFA3;
      text-shadow:0 0 14px rgba(0,255,163,.24);
    }
    #pbGap[hidden]{display:none!important}
  `;
  document.head.appendChild(style);

  const numberFrom=text=>{
    const m=String(text||'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):null;
  };

  function hide(){
    gap.hidden=true;
    gap.classList.remove('close');
    gap.textContent='';
  }

  function render(){
    if(modal.classList.contains('hide'))return hide();
    if(result.querySelector('.new'))return hide();

    const title=String(game.textContent||'').trim();
    const current=numberFrom(score.textContent);
    const pb=numberFrom(best.textContent);
    if(!Number.isFinite(current)||!Number.isFinite(pb)||/TOO EARLY/i.test(score.textContent||''))return hide();

    let value=null,text='',close=false;
    if(title==='PERFECT TIMER'){
      value=Math.max(0,Math.abs(current-1)-Math.abs(pb-1));
      if(value<0.0005)text='MATCHED YOUR PB';
      else text=value.toFixed(3)+'s FROM YOUR PB';
      close=value<=0.010;
    }else if(title==='PERFECT STOP'){
      value=Math.max(0,pb-current);
      if(value<0.05)text='MATCHED YOUR PB';
      else text=value.toFixed(1)+'% FROM YOUR PB';
      close=value<=1.0;
    }else if(title==='REACTION TEST'){
      value=Math.max(0,current-pb);
      if(value<0.5)text='MATCHED YOUR PB';
      else text=Math.round(value)+'ms FROM YOUR PB';
      close=value<=10;
    }else return hide();

    gap.textContent=text;
    gap.classList.toggle('close',close);
    gap.hidden=false;
  }

  const sync=()=>queueMicrotask(render);
  new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  new MutationObserver(sync).observe(result,{childList:true,subtree:true});
  new MutationObserver(sync).observe(best,{childList:true,characterData:true,subtree:true});
  render();
})();
