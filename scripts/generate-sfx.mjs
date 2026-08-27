import fs from 'node:fs/promises';
import path from 'node:path';

const key=process.env.ELEVENLABS_API_KEY;
if(!key)throw new Error('ELEVENLABS_API_KEY is required');

const outDir=path.join(process.cwd(),'assets','sfx');
await fs.mkdir(outDir,{recursive:true});

const sounds={
  start:{duration_seconds:0.45,text:'Short soft arcade UI start impact, warm low-mid click with a tiny whoosh, tactile and clean, no voice, no music, no electronic beep, no piercing high frequency.'},
  go:{duration_seconds:0.55,text:'Short energetic arcade GO cue, punchy soft whoosh plus impact, exciting but not harsh, no voice, no music, no electronic beep, no piercing high frequency.'},
  tap:{duration_seconds:0.25,text:'Very short tactile mobile game tap click, soft mechanical snap, dry and satisfying, no voice, no music, no electronic beep, no piercing high frequency.'},
  tick:{duration_seconds:0.22,text:'Very short muted mechanical timer tick, subtle dry click, low volume feel, no voice, no music, no electronic beep, no piercing high frequency.'},
  blind:{duration_seconds:0.50,text:'Short soft transition cue for a hidden timer, gentle airy whoosh with a warm muted chime texture, no voice, no music bed, no electronic beep, no piercing high frequency.'},
  fail:{duration_seconds:0.65,text:'Short arcade failure impact, low bassy thud with a soft descending texture, disappointing but not annoying, no buzzer, no electronic beep, no voice, no music.'},
  win:{duration_seconds:0.70,text:'Short satisfying arcade success cue, warm bright chime and soft impact, celebratory but restrained, no voice, no music bed, no piercing electronic beep.'},
  perfect:{duration_seconds:0.95,text:'Short premium arcade perfect-success flourish, layered warm chimes, soft impact and tiny sparkle, exciting and polished, no voice, no music bed, no piercing high-pitched beep.'}
};

for(const [name,spec] of Object.entries(sounds)){
  const file=path.join(outDir,`${name}.mp3`);
  try{await fs.access(file);console.log(`skip ${name}.mp3 (exists)`);continue}catch{}
  console.log(`generating ${name}.mp3`);
  const r=await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',{
    method:'POST',
    headers:{'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},
    body:JSON.stringify({text:spec.text,duration_seconds:spec.duration_seconds,prompt_influence:0.45})
  });
  if(!r.ok)throw new Error(`${name}: ${r.status} ${await r.text()}`);
  const buf=Buffer.from(await r.arrayBuffer());
  if(buf.length<500)throw new Error(`${name}: generated file unexpectedly small (${buf.length} bytes)`);
  await fs.writeFile(file,buf);
  console.log(`wrote ${name}.mp3 (${buf.length} bytes)`);
}
