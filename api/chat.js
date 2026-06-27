const https = require('https');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'API key not configured. Set OPENROUTER_API_KEY in Vercel environment variables.' } });
    return;
  }

  const payload = JSON.stringify(req.body);

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'HTTP-Referer': req.headers.referer || 'https://claude-quella.vercel.app',
      'X-Title': 'xiaoke'
    }
  };

  const proxyReq = https.request(options, function (proxyRes) {
    let body = '';
    proxyRes.on('data', function (chunk) { body += chunk; });
    proxyRes.on('end', function () {
      try {
        const data = JSON.parse(body);
        res.status(proxyRes.statusCode).json(data);
      } catch (e) {
        res.status(502).json({ error: { message: 'Invalid response from API' } });
      }
    });
  });

  proxyReq.on('error', function (e) {
    res.status(502).json({ error: { message: 'Proxy error: ' + e.message } });
  });

  proxyReq.write(payload);
  proxyReq.end();
};
