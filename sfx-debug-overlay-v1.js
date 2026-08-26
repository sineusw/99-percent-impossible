/* Temporary on-device SFX diagnostic overlay. Remove after Android TOO EARLY diagnosis. */
(()=>{
  'use strict';
  const lines=[];
  function fmt(v){
    if(v instanceof Error)return `${v.name}: ${v.message}`;
    if(typeof v==='string')return v;
    try{return JSON.stringify(v)}catch{return String(v)}
  }
  function add(kind,args){
    const text=args.map(fmt).join(' ');
    if(!text.includes('[EARLY SFX]')&&!text.includes('[SFX AUDIO LOG]'))return;
    lines.push(`${kind}: ${text}`);
    while(lines.length>18)lines.shift();
    render();
  }
  function render(){
    let box=document.getElementById('n99-sfx-debug');
    if(!box){
      box=document.createElement('div');
      box.id='n99-sfx-debug';
      Object.assign(box.style,{position:'fixed',left:'6px',right:'6px',bottom:'6px',zIndex:'999999',maxHeight:'42vh',overflow:'auto',background:'rgba(0,0,0,.92)',color:'#7CFFB2',border:'1px solid #00FFA3',borderRadius:'8px',padding:'8px',font:'11px/1.35 monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',pointerEvents:'none'});
      document.body.appendChild(box);
    }
    box.textContent='SFX DEBUG\n'+lines.join('\n');
  }
  const oldLog=console.log.bind(console),oldWarn=console.warn.bind(console),oldErr=console.error.bind(console);
  console.log=(...args)=>{oldLog(...args);add('LOG',args)};
  console.warn=(...args)=>{oldWarn(...args);add('WARN',args)};
  console.error=(...args)=>{oldErr(...args);add('ERR',args)};
  window.N99SfxDebug={clear(){lines.length=0;render()},lines};
  add('LOG',['[SFX AUDIO LOG] on-device overlay ready']);
})();
