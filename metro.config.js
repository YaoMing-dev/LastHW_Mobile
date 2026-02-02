// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');
const url = require('url');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add CORS proxy middleware to Metro dev server
// This intercepts /genius-proxy/* requests and forwards them to api.genius.com
config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  if (originalEnhanceMiddleware) {
    middleware = originalEnhanceMiddleware(middleware, server);
  }

  return (req, res, next) => {
    // Shutdown endpoint - kills Metro dev server and closes app
    if (req.url && req.url.startsWith('/shutdown')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      console.log('[Shutdown] Exiting Metro dev server...');
      setTimeout(() => process.exit(0), 500);
      return;
    }

    // Intercept /genius-proxy/* requests
    if (req.url && req.url.startsWith('/genius-proxy/')) {
      const targetPath = req.url.replace('/genius-proxy', '');
      const targetUrl = `https://api.genius.com${targetPath}`;

      console.log('[Genius Proxy]', targetUrl.substring(0, 80));

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsed = url.parse(targetUrl);
      const options = {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.path,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SongFinder/1.0',
        },
      };

      const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('[Genius Proxy] Error:', err.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.end();
      return;
    }

    // Pass through all other requests to Metro
    middleware(req, res, next);
  };
};

module.exports = config;
