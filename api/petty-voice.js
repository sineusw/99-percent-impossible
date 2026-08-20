const VOICE_ID = 'qxePw1S1QmBgjlU3GIy5';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';
  const host = req.headers.host || '';
  if (origin) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Forbidden' });
    } catch {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Voice service is not configured' });

  const text = String(req.body?.text || '').trim();
  if (!text || text.length > 420) return res.status(400).json({ error: 'Invalid text' });

  try {
    // Flash is ElevenLabs' low-latency model. Petty's lines are short reactions,
    // so prioritize response speed while keeping Older Joe's character settings.
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128&optimize_streaming_latency=4`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.46,
          similarity_boost: 0.84,
          style: 0.38,
          use_speaker_boost: true,
          speed: 0.94
        }
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('ElevenLabs error', r.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'Voice generation failed' });
    }

    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    return res.status(200).send(audio);
  } catch (err) {
    console.error('Petty voice error', err);
    return res.status(500).json({ error: 'Voice generation failed' });
  }
};
