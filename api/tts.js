import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export default async function handler(req, res) {
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
    const tts = new MsEdgeTTS();
    await tts.setMetadata("zh-CN-YunxiNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const readable = tts.toStream(text);

    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
  } catch (e) {
    return res.status(500).json({ error: 'TTS failed: ' + e.message });
  }
}
