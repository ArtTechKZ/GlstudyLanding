import { createServer, preview } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.js';
import {evidencePath} from './evidence-path.js';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// Vite owns the listener directly: no shell children or guessed port owners.
export async function startLocalServer(mode = 'preview') {
  if (mode === 'static') return startStaticServer();
  const config = {
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.config.ts'),
    logLevel: 'error',
    plugins: mode==='dev'?[{
      name:'gl-explicit-synthetic-test-fixtures',
      configureServer(server){
        // Render only these fixed source fixtures. No files inside private QA
        // directories are read or served; Vite's filesystem deny rules remain.
        const fixtures=new Map(['study08','study11','study12'].map(name=>[evidencePath('/.qa/'+name+'/fixture.html'),name]));
        fixtures.set(evidencePath('/.qa/study19/switch.html'),'study19');
        server.middlewares.use(async(req,res,next)=>{
          const pathname=new URL(req.url,'http://127.0.0.1').pathname,name=fixtures.get(pathname);if(!name)return next();
          const html='<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="/scripts/fixtures/'+name+'.tsx"></script></html>';
          try{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await server.transformIndexHtml(pathname,html))}catch(e){next(e)}
        });
      },
    }]:[],
    server: { host: '127.0.0.1', port: 0, strictPort: true, open: false },
    preview: { host: '127.0.0.1', port: 0, strictPort: true, open: false },
  };
  const server = mode === 'dev' ? await createServer(config) : await preview(config);
  const close = async () => {
    if (mode === 'dev') await server.close();
    else {
      server.httpServer.closeAllConnections();
      await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
    }
  };
  try {
    if (mode === 'dev') await server.listen();
    const address = server.httpServer.address();
    if (!address || typeof address === 'string') throw new Error('No local TCP listener');
    const origin = `http://127.0.0.1:${address.port}`;
    const base = server.config.base;
    const baseURL = origin + base.replace(/\/$/, '');
    const response = await fetch(baseURL + '/', { signal: AbortSignal.timeout(mode === 'dev' ? 30000 : 10000) });
    if (!response.ok || !(await response.text()).includes('id="root"')) {
      throw new Error('GL Study readiness check failed');
    }
    return { baseURL, origin, base, close };
  } catch (error) {
    await close();
    throw error;
  }
}
