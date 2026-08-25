import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'assets','petty-audio');
const SOURCE=await fs.readFile(path.join(ROOT,'petty.js'),'utf8');
const ENDPOINT='https://99-percent-impossible.vercel.app/api/petty-voice';
const ORIGIN='https://99-percent-impossible.vercel.app';

function hashText(text){
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,0x01000193);
  }
  return (h>>>0).toString(16).padStart(8,'0');
}

// Inventory every literal Petty line declared through L(id, text). This keeps the
// static library tied to the same source of truth the game uses at runtime.
const rows=[];
const re=/L\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*\)/g;
for(const m of SOURCE.matchAll(re)){
  const id=m[1];
  const text=m[2].replace(/\\'/g,"'").trim();
  if(text)rows.push({id,text});
}

const unique=[];
const seen=new Set();
for(const row of rows){
  if(!seen.has(row.text)){seen.add(row.text);unique.push(row)}
}
await fs.mkdir(OUT,{recursive:true});

const manifest=[];
let made=0,skipped=0;
for(const [i,row] of unique.entries()){
  const hash=hashText(row.text),file=`${hash}.mp3`,dest=path.join(OUT,file);
  try{
    const stat=await fs.stat(dest);
    skipped++;
    manifest.push({...row,hash,file,bytes:stat.size,existing:true});
    continue;
  }catch{}

  const r=await fetch(ENDPOINT,{
    method:'POST',
    headers:{Origin:ORIGIN,'Content-Type':'application/json'},
    body:JSON.stringify({text:row.text})
  });
  if(!r.ok)throw new Error(`Petty voice ${r.status} for ${row.id}: ${(await r.text()).slice(0,300)}`);
  const audio=Buffer.from(await r.arrayBuffer());
  if(audio.length<500)throw new Error(`Petty voice payload too small for ${row.id}`);
  await fs.writeFile(dest,audio);
  made++;
  manifest.push({...row,hash,file,bytes:audio.length,existing:false});
  process.stdout.write(`\r${i+1}/${unique.length} generated=${made} existing=${skipped}`);
  await new Promise(r=>setTimeout(r,150));
}

await fs.writeFile(path.join(OUT,'manifest-all.json'),JSON.stringify({
  batch:'all-literal-petty-lines',
  count:manifest.length,
  generatedAt:new Date().toISOString(),
  generated:made,
  reused:skipped,
  lines:manifest
},null,2)+'\n');
console.log(`\nDone. ${manifest.length} total Petty lines; ${made} new clips; ${skipped} reused.`);
