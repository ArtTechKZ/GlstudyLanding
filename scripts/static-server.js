import site from './site-config.js';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// Model Pages directory redirects and real 404 responses, with no SPA fallback.
export async function startStaticServer({ directory = fileURLToPath(new URL('../dist/', import.meta.url)), gzip = false, port = 0 } = {}) {
  const root = path.resolve(directory);
  const base = site.base;
  const types = { '.mp4':'video/mp4', '.avif':'image/avif', '.vtt':'text/vtt; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
  const server = createServer(async (req, res) => {
    try {
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
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
      const type = types[path.extname(file)] ?? 'application/octet-stream';
      const compressible = /^(?:text\/|application\/(?:json|xml)|image\/svg\+xml)/.test(type);
      const headers = { 'Content-Type': type };
      let body = content;
      if (gzip && compressible) {
        headers.Vary = 'Accept-Encoding';
        const encodings = String(req.headers['accept-encoding'] ?? '').split(',').map(value => {
          const [name, ...parameters] = value.trim().toLowerCase().split(';');
          const quality = parameters.find(value => value.trim().startsWith('q='));
          return { name, quality: quality ? Number(quality.trim().slice(2)) : 1 };
        });
        const accepted = encodings.find(value => value.name === 'gzip') ?? encodings.find(value => value.name === '*');
        if (accepted?.quality > 0) {
          body = gzipSync(content);
          headers['Content-Encoding'] = 'gzip';
        }
      }
      if(type==='video/mp4'&&status===200){headers['Accept-Ranges']='bytes';const range=req.headers.range;if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):content.length-1;if(match&&!match[1]&&match[2]){start=Math.max(0,content.length-Number(match[2]));end=content.length-1;}if(!match||start>end||start>=content.length){res.writeHead(416,{'Content-Range':'bytes */'+content.length});res.end();return;}end=Math.min(end,content.length-1);body=content.subarray(start,end+1);headers['Content-Range']=`bytes ${start}-${end}/${content.length}`;status=206;}}
      headers['Content-Length']=body.length;
      // The default raw mode retains the previous delivery conditions.
      res.writeHead(status, headers);
      res.end(req.method==='HEAD'?undefined:body);
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin, base, baseURL: origin + base.slice(0, -1),
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    },
  };
}
