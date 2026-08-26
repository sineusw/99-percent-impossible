/* Temporary on-device SFX diagnostic overlay. Remove after Android TOO EARLY diagnosis. */
(()=>{
  'use strict';
  const lines=[];
  function sanitizeString(s){
    if(typeof s!=='string')return s;
    if(s.startsWith('data:audio/'))return '[audio-data-uri]';
    if(s.length>180)return s.slice(0,177)+'...';
    return s;
  }
  function fmt(v){
    if(v instanceof Error)return `${v.name}: ${v.message}`;
    if(typeof v==='string')return sanitizeString(v);
    try{
      const seen=new WeakSet();
      return JSON.stringify(v,(k,val)=>{
        if(typeof val==='string')return sanitizeString(val);
        if(val&&typeof val==='object'){
          if(seen.has(val))return '[circular]';
          seen.add(val);
        }
        return val;
      });
    }catch{return sanitizeString(String(v))}
  }
  function add(kind,args){
    const raw=args.map(a=>typeof a==='string'?a:'').join(' ');
    const isEarly=raw.includes('[EARLY SFX]');
    const isFail=raw.includes('[SFX AUDIO LOG]')&&raw.includes('fail');
    if(!isEarly&&!isFail)return;
    if(isEarly&&raw.includes('transport exists?'))lines.length=0;
    const text=args.map(fmt).join(' ');
    lines.push(`${kind}: ${text}`);
    while(lines.length>10)lines.shift();
    render();
  }
  function render(){
    let box=document.getElementById('n99-sfx-debug');
    if(!box){
      box=document.createElement('div');
      box.id='n99-sfx-debug';
      Object.assign(box.style,{position:'fixed',left:'6px',right:'6px',bottom:'6px',zIndex:'999999',maxHeight:'34vh',overflow:'auto',background:'rgba(0,0,0,.94)',color:'#7CFFB2',border:'1px solid #00FFA3',borderRadius:'8px',padding:'8px',font:'12px/1.4 monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',pointerEvents:'none'});
      document.body.appendChild(box);
    }
    box.textContent='TOO EARLY SFX DEBUG\n'+(lines.length?lines.join('\n'):'Trigger TOO EARLY once...');
  }
  const oldLog=console.log.bind(console),oldWarn=console.warn.bind(console),oldErr=console.error.bind(console);
  console.log=(...args)=>{oldLog(...args);add('LOG',args)};
  console.warn=(...args)=>{oldWarn(...args);add('WARN',args)};
  console.error=(...args)=>{oldErr(...args);add('ERR',args)};
  window.N99SfxDebug={clear(){lines.length=0;render()},lines};
  render();
})();
