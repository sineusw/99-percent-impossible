import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'assets','petty-audio');
const API_KEY=process.env.ELEVENLABS_API_KEY;
const VOICE_ID=process.env.PETTY_VOICE_ID||'qxePw1S1QmBgjlU3GIy5';
if(!API_KEY)throw new Error('ELEVENLABS_API_KEY is required');

function hashText(text){
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,0x01000193);
  }
  return (h>>>0).toString(16).padStart(8,'0');
}

async function read(name){return fs.readFile(path.join(ROOT,name),'utf8')}
async function readOptional(name){try{return await read(name)}catch{return ''}}

function extractLCalls(src){
  const out=[];
  const re=/L\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*\)/g;
  for(const m of src.matchAll(re))out.push({id:m[1],text:m[2].replace(/\\'/g,"'")});
  return out;
}

function evalArrayLiteral(lit){return vm.runInNewContext('('+lit+')')}

function extractConstArray(src,name){
  const m=src.match(new RegExp(`const\\s+${name}=([\\s\\S]*?]);`));
  return m?evalArrayLiteral(m[1]):[];
}

function extractNamedObjectArrays(src,names){
  const out=[];
  for(const name of names){
    const m=src.match(new RegExp(`const\\s+${name}=([\\s\\S]*?]);`));
    if(!m)continue;
    try{
      const rows=evalArrayLiteral(m[1]);
      rows.forEach((x,i)=>{if(x?.text)out.push({id:x.id||`${name}-${i+1}`,text:x.text})});
    }catch{}
  }
  return out;
}

function extractGreetingLines(src){
  const lines=[];
  for(const m of src.matchAll(/p\.push\(([^;]+)\);/g)){
    try{lines.push(...vm.runInNewContext('['+m[1]+']'))}catch{}
  }
  for(const m of src.matchAll(/\?\s*(\[[^\]]*\])/g)){
    try{lines.push(...evalArrayLiteral(m[1]))}catch{}
  }
  return lines.filter(x=>typeof x==='string'&&x.length>3);
}

async function inventory(){
  const [petty,interrupt,ads,greetings,reactionNext]=await Promise.all([
    read('petty.js'),
    read('petty-interrupt-lines-v091.js'),
    read('ads.js'),
    read('petty-v6.js'),
    readOptional('reaction-next.js')
  ]);
  const rows=[
    ...extractLCalls(petty).map(x=>({...x,source:'petty.js'})),
    ...extractLCalls(interrupt).map(x=>({...x,source:'petty-interrupt-lines-v091.js'})),
    ...extractConstArray(ads,'BEFORE_LINES').map((text,i)=>({id:`ad-before-${i+1}`,text,source:'ads.js'})),
    ...extractConstArray(ads,'AFTER_LINES').map((text,i)=>({id:`ad-after-${i+1}`,text,source:'ads.js'})),
    ...extractGreetingLines(greetings).map((text,i)=>({id:`greeting-${i+1}`,text,source:'petty-v6.js'})),
    ...extractNamedObjectArrays(reactionNext,['suspiciousPetty','elitePetty','fastPetty']).map(x=>({...x,source:'reaction-next.js'}))
  ];
  const seen=new Set();
  return rows.filter(r=>{
    r.text=String(r.text||'').trim();
    if(!r.text||seen.has(r.text))return false;
    seen.add(r.text);return true;
  });
}

async function generate(text){
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_22050_32&optimize_streaming_latency=4`,{
    method:'POST',
    headers:{'xi-api-key':API_KEY,'Content-Type':'application/json','Accept':'audio/mpeg'},
    body:JSON.stringify({
      text,
      model_id:'eleven_flash_v2_5',
      voice_settings:{stability:.43,similarity_boost:.84,style:.42,use_speaker_boost:true,speed:.96}
    })
  });
  if(!r.ok)throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0,500)}`);
  return Buffer.from(await r.arrayBuffer());
}

await fs.mkdir(OUT,{recursive:true});
const lines=await inventory();
const manifest=[];
let made=0,skipped=0;
for(const [i,row] of lines.entries()){
  const hash=hashText(row.text),file=`${hash}.mp3`,dest=path.join(OUT,file);
  try{await fs.access(dest);skipped++}
  catch{
    const audio=await generate(row.text);
    await fs.writeFile(dest,audio);
    made++;
  }
  manifest.push({...row,hash,file});
  process.stdout.write(`\r${i+1}/${lines.length} generated=${made} existing=${skipped}`);
}
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify({voiceId:VOICE_ID,count:manifest.length,generatedAt:new Date().toISOString(),lines:manifest},null,2)+'\n');
console.log(`\nDone. ${manifest.length} unique Petty lines; ${made} new clips; ${skipped} already present.`);
