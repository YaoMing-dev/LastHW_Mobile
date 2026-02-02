// Simple local CORS proxy for development
// Run: node cors-proxy.js
// This proxies requests to api.genius.com to avoid CORS issues on web

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the target URL from query param
  const parsed = url.parse(req.url, true);
  const targetUrl = parsed.query.url;

  if (!targetUrl) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing ?url= parameter' }));
    return;
  }

  console.log('[CORS Proxy]', targetUrl.substring(0, 80) + '...');

  const targetParsed = url.parse(targetUrl);

  const options = {
    hostname: targetParsed.hostname,
    port: 443,
    path: targetParsed.path,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'SongFinder/1.0',
    },
  };

  // Forward Authorization header if present
  if (req.headers.authorization) {
    options.headers['Authorization'] = req.headers.authorization;
  }

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[CORS Proxy] Error:', err.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`[CORS Proxy] Running on http://localhost:${PORT}`);
  console.log(`[CORS Proxy] Usage: http://localhost:${PORT}/?url=https://api.genius.com/search?q=test&access_token=TOKEN`);
});
