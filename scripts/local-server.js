import { createServer, preview } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './static-server.js';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// Vite owns the listener directly: no shell children or guessed port owners.
export async function startLocalServer(mode = 'preview') {
  if (mode === 'static') return startStaticServer();
  const config = {
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.config.ts'),
    logLevel: 'error',
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
    const response = await fetch(baseURL + '/', { signal: AbortSignal.timeout(10000) });
    if (!response.ok || !(await response.text()).includes('id="root"')) {
      throw new Error('GL Study readiness check failed');
    }
    return { baseURL, origin, base, close };
  } catch (error) {
    await close();
    throw error;
  }
}
