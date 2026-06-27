module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text || text.length > 200) {
    return res.status(400).json({ error: 'Text required, max 200 chars' });
  }

  try {
    const url = 'https://translate.google.com/translate_tts'
      + '?ie=UTF-8&client=tw-ob&tl=zh-CN&q=' + encodeURIComponent(text);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'TTS source error: ' + response.status });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
  } catch (e) {
    return res.status(500).json({ error: 'TTS failed: ' + e.message });
  }
}
