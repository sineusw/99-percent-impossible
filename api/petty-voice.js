const VOICE_ID = 'qxePw1S1QmBgjlU3GIy5';

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';
  const nativeOrigins = new Set(['capacitor://localhost','http://localhost','https://localhost']);

  if (origin) {
    let allowed = false;
    try {
      allowed = new URL(origin).host === host || nativeOrigins.has(origin);
    } catch {}
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Voice service is not configured' });

  const text = String(req.body?.text || '').trim();
  if (!text || text.length > 420) return res.status(400).json({ error: 'Invalid text' });

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_22050_32&optimize_streaming_latency=4`, {
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
          stability: 0.43,
          similarity_boost: 0.84,
          style: 0.42,
          use_speaker_boost: true,
          speed: 0.96
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
