const CAST={
  daisy:{voiceId:'9QPzUjm1evjwY2ENQBKU',modelId:'eleven_multilingual_v2',settings:{stability:.66,similarity_boost:.76,style:.43,use_speaker_boost:true,speed:1.00}},
  mick:{voiceId:'YLbQE9U7P1K6rBNJWNSv',modelId:'eleven_multilingual_v2',settings:{stability:.50,similarity_boost:.64,style:.85,use_speaker_boost:true,speed:1.01}}
};
module.exports=async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'})}
  const origin=req.headers.origin||'',host=req.headers.host||'';
  if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Forbidden'})}catch{return res.status(403).json({error:'Forbidden'})}}
  const apiKey=process.env.ELEVENLABS_API_KEY;if(!apiKey)return res.status(500).json({error:'Voice service is not configured'});
  const character=String(req.body?.character||'').toLowerCase(),cfg=CAST[character],text=String(req.body?.text||'').trim();
  if(!cfg)return res.status(400).json({error:'Unknown character'});if(!text||text.length>420)return res.status(400).json({error:'Invalid text'});
  try{
    const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}?output_format=mp3_22050_32&optimize_streaming_latency=3`,{method:'POST',headers:{'xi-api-key':apiKey,'Content-Type':'application/json','Accept':'audio/mpeg'},body:JSON.stringify({text,model_id:cfg.modelId,voice_settings:cfg.settings})});
    if(!r.ok){const detail=await r.text();console.error('Cast voice error',character,r.status,detail.slice(0,500));return res.status(502).json({error:'Voice generation failed'})}
    const audio=Buffer.from(await r.arrayBuffer());res.setHeader('Content-Type','audio/mpeg');res.setHeader('Cache-Control','private, max-age=0, no-store');return res.status(200).send(audio)
  }catch(err){console.error('Cast voice error',err);return res.status(500).json({error:'Voice generation failed'})}
};
