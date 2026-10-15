import { chromium } from 'playwright';
import { startLocalServer } from './local-server.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Canonical content routes and the technical 404 page.
const routesToPrerender = [
  { route: '/', target: 'index.html' },
  { route: '/learning', target: 'learning/index.html' },
  { route: '/ielts', target: 'ielts/index.html' },
  { route: '/branches', target: 'branches/index.html' },
  { route: '/travel/europe-winter-2027', target: 'travel/europe-winter-2027/index.html' },
  { route: '/travel/malaysia', target: 'travel/malaysia/index.html' },
  { route: '/legal', target: 'legal/index.html' },
  { route: '/404', target: '404.html' }
];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Starting static HTML pre-rendering via Playwright (7 routes + 404) ---');
  let preview;
  let browser;

  try {
    preview = await startLocalServer();
    browser = await chromium.launch({ channel: 'msedge' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    for (const item of routesToPrerender) {
      const url = `${preview.baseURL}${item.route}`;
      console.log(`Pre-rendering ${item.route} -> ${item.target}...`);
      await page.goto(url, { waitUntil: 'networkidle' });

      // Small tick for React effects (document.title, meta descriptions)
      await wait(300);

      const html = await page.content();
      const targetPath = path.join(distDir, item.target);
      const targetDir = path.dirname(targetPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(targetPath, html, 'utf-8');
      const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
      console.log(`✓ Wrote ${item.target} (${sizeKb} KB)`);
    }
  } finally {
    try { await browser?.close(); } finally { await preview?.close(); }
  }

  console.log('\n--- Pre-rendering completed successfully ---');
  console.log(`Total pre-rendered static HTML routes: ${routesToPrerender.length}`);
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

}

run().catch((err) => {
  console.error('Fatal pre-render error:', err);
  process.exit(1);
});
