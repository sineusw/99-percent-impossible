// Reuse real character audio across launches without contacting a service on cache hits.
(() => {
  const name='n99-voice-audio-v1',maxEntries=24,maxBytes=256*1024,ttl=7*86400000;
  const pending=new Map();
  async function audio(character,text,load){
    const id=character+'\0'+text;
    if(pending.has(id))return pending.get(id);
    const task=(async()=>{
      let cache,request;
      try{
        if(window.caches&&window.crypto?.subtle){
          const hash=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));
          const hex=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
          request=new Request(`https://n99-audio-cache.invalid/${character}/${hex}`);
          cache=await window.caches.open(name);
          const hit=await cache.match(request);
          if(hit){
            const created=Number(hit.headers.get('X-N99-Created'));
            const blob=await hit.blob();
            if(created>0&&Date.now()-created>=0&&Date.now()-created<ttl&&blob.size>0&&blob.size<=maxBytes&&blob.type.startsWith('audio/'))return blob;
            await cache.delete(request);
          }
        }
      }catch{cache=null;}
      const blob=await load();
      if(!blob?.size||!blob.type?.startsWith('audio/'))throw new Error('Invalid voice audio');
      if(cache&&request&&blob.size<=maxBytes){
        try{
          await cache.put(request,new Response(blob,{headers:{'Content-Type':blob.type,'X-N99-Created':String(Date.now())}}));
          const keys=await cache.keys();
          for(const key of keys.slice(0,Math.max(0,keys.length-maxEntries)))await cache.delete(key);
        }catch{} // Storage restrictions must never prevent speech.
      }
      return blob;
    })().finally(()=>pending.delete(id));
    pending.set(id,task);return task;
  }
  window.N99VoiceCache={audio};
})();
