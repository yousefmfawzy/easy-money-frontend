// Static file server for the built SPA.
//
// App Platform's Node buildpack needs a start command; this serves dist/ on
// $PORT so the frontend can run as a Web Service component. A Static Site
// component (see .do/app.yaml) does not use this file.
//
// Zero dependencies on purpose: nothing here needs to be installed at runtime.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createGzip } from 'node:zlib';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const COMPRESSIBLE = /^(text\/|application\/(json|manifest\+json)|image\/svg)/;

/** Map a URL path to a file inside dist/, or null when it escapes the root. */
function resolveInRoot(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const candidate = resolve(join(ROOT, normalize(decoded)));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) return null;
  return candidate;
}

async function statFile(path) {
  try {
    const info = await stat(path);
    return info.isFile() ? info : null;
  } catch {
    return null;
  }
}

function send(req, res, status, filePath, info, cacheControl) {
  const type = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
  const headers = {
    'Content-Type': type,
    'Cache-Control': cacheControl,
    'Last-Modified': info.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Accept-Encoding',
  };

  const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const gzip = acceptsGzip && COMPRESSIBLE.test(type) && info.size > 1024;

  if (gzip) headers['Content-Encoding'] = 'gzip';
  else headers['Content-Length'] = info.size;

  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();

  const stream = createReadStream(filePath);
  stream.on('error', () => res.destroy());
  if (gzip) stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  // Cheap liveness endpoint that never touches disk.
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('ok');
  }

  const filePath = resolveInRoot(req.url || '/');
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  const direct = await statFile(filePath);
  if (direct) {
    // Vite fingerprints everything under assets/, so it is safe to pin.
    const immutable = filePath.startsWith(join(ROOT, 'assets') + sep);
    return send(req, res, 200, filePath, direct,
      immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }

  // Anything with a file extension that is missing is a genuine 404; every
  // other path is a client-side route and gets index.html.
  const indexPath = join(ROOT, 'index.html');
  const index = await statFile(indexPath);
  if (!index) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('dist/index.html is missing — run `npm run build` first.');
  }

  const status = extname(filePath) ? 404 : 200;
  send(req, res, status, indexPath, index, 'no-cache');
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} on http://${HOST}:${PORT}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
