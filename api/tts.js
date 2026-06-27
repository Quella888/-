module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text || text.length > 2000) {
    return res.status(400).json({ error: 'Text required, max 2000 chars' });
  }

  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
    const tts = new MsEdgeTTS();
    await tts.setMetadata("zh-CN-YunxiNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const bufferResult = await new Promise((resolve, reject) => {
      const chunks = [];
      const stream = tts.toStream(text);
      stream.on('data', (chunk) => {
        if (Buffer.isBuffer(chunk)) chunks.push(chunk);
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', bufferResult.length);
    res.status(200).send(bufferResult);
  } catch (e) {
    return res.status(500).json({ error: 'TTS failed: ' + e.message });
  }
}
