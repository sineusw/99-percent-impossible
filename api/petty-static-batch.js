module.exports = async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.ELEVENLABS_API_KEY;
  if(!apiKey) return res.status(500).json({error:'Voice service is not configured'});
  const text=String(req.query?.text||'').trim();
  if(!text||text.length>420) return res.status(400).json({error:'Invalid text'});
  const voiceId='qxePw1S1QmBgjlU3GIy5';
  try{
    const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32&optimize_streaming_latency=4`,{
      method:'POST',headers:{'xi-api-key':apiKey,'Content-Type':'application/json','Accept':'audio/mpeg'},
      body:JSON.stringify({text,model_id:'eleven_flash_v2_5',voice_settings:{stability:.43,similarity_boost:.84,style:.42,use_speaker_boost:true,speed:.96}})
    });
    if(!r.ok) return res.status(502).json({error:'Voice generation failed',status:r.status,detail:(await r.text()).slice(0,300)});
    const audio=Buffer.from(await r.arrayBuffer());
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({text,contentType:'audio/mpeg',base64:audio.toString('base64')});
  }catch(err){return res.status(500).json({error:'Voice generation failed',detail:String(err?.message||err)})}
};
