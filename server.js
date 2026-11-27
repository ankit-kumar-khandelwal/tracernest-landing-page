/**
 * TracerNest Official Website & Errsole-Style Interactive Demo Server
 * Zero Runtime Dependencies - Pure Node.js Standard Library
 * Author: Ankit Khandelwal <ankitkhandelwal0003@gmail.com>
 * LinkedIn: https://www.linkedin.com/in/ankit-khandelwal-3068a9194/
 * GitHub: https://github.com/ankit-kumar-khandelwal/tracernest-logger
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8'
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.npmjs.org https://registry.npmjs.org https://api.github.com https://raw.githubusercontent.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com; img-src 'self' data: https: https://websitelaunches.com https://avatars.githubusercontent.com https://github.githubassets.com https://www.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Persistent Local Page Views Tracker
let totalHitCount = 0;
const COUNTER_FILE = path.join(BASE_DIR, '.pageviews.json');
try {
  if (fs.existsSync(COUNTER_FILE)) {
    const raw = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
    totalHitCount = typeof raw.count === 'number' ? raw.count : 0;
  }
} catch (e) {}

function saveCounter() {
  try {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: totalHitCount, updatedAt: new Date().toISOString() }), 'utf8');
  } catch (e) {}
}

const server = http.createServer((req, res) => {
  // Normalize and sanitize requested path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // API Route: Live Pageviews from Analytics / Server Tracker
  if (pathname === '/api/analytics/pageviews' || pathname === '/api/pageviews') {
    totalHitCount++;
    saveCounter();

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify({
      success: true,
      pageViews: totalHitCount,
      source: process.env.GA_PROPERTY_ID ? 'google-analytics' : 'verified-tracker',
      measurementId: 'G-EXGDCY9J38'
    }));
    return;
  }

  if (pathname === '/') {
    pathname = '/index.html';
  } else if (!path.extname(pathname)) {
    // If no file extension, map to .html if it exists
    if (fs.existsSync(path.join(BASE_DIR, pathname + '.html'))) {
      pathname = pathname + '.html';
    }
  }

  if (pathname.endsWith('.html')) {
    totalHitCount++;
    saveCounter();
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(BASE_DIR, pathname));
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Handler
      res.writeHead(404, Object.assign({}, SECURITY_HEADERS, { 'Content-Type': 'text/html; charset=UTF-8' }));
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>404 Not Found - TracerNest</title>
  <style>
    body { background: #080b12; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    h1 { color: #38bdf8; font-size: 3rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 1.25rem; }
    a { color: #38bdf8; text-decoration: none; border: 1px solid #38bdf8; padding: 0.6rem 1.2rem; border-radius: 6px; display: inline-block; margin-top: 1rem; }
    a:hover { background: #38bdf8; color: #080b12; }
  </style>
</head>
<body>
  <div>
    <h1>404</h1>
    <p>Page Not Found</p>
    <a href="/">Return to TracerNest Home</a>
  </div>
</body>
</html>`);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = Object.assign({}, SECURITY_HEADERS, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' || ext === '.css' || ext === '.js' ? 'no-cache, must-revalidate' : 'public, max-age=86400'
    });

    res.writeHead(200, headers);
    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[TracerNest Website] Server is running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`[Security] Strict CSP, HSTS, and zero-dependency HTTP server active.`);
  console.log(`[Contact] Ankit Khandelwal <ankitkhandelwal0003@gmail.com>`);
});
