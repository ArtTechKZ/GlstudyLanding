import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Model Pages directory redirects and real 404 responses, with no SPA fallback.
export async function startStaticServer() {
  const root = fileURLToPath(new URL('../dist/', import.meta.url));
  const base = '/GlstudyLanding/';
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === base.slice(0, -1)) {
        res.writeHead(301, { Location: base + url.search }); res.end(); return;
      }
      if (!url.pathname.startsWith(base)) { res.writeHead(404); res.end(); return; }
      let file = path.resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
      if (file !== path.resolve(root) && !file.startsWith(path.resolve(root) + path.sep)) {
        res.writeHead(403); res.end(); return;
      }
      let status = 200;
      try {
        if ((await fs.stat(file)).isDirectory()) {
          if (!url.pathname.endsWith('/')) {
            res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return;
          }
          file = path.join(file, 'index.html');
        }
        await fs.access(file);
      } catch {
        file = path.join(root, '404.html'); status = 404;
      }
      const content = await fs.readFile(file);
      res.writeHead(status, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
      res.end(content);
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin, base, baseURL: origin + base.slice(0, -1),
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    },
  };
}
