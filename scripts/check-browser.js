import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startLocalServer, projectRoot } from './local-server.js';

const routes = ['/', '/learning', '/ielts', '/branches', '/travel/europe-winter-2027', '/travel/malaysia', '/legal', '/missing-page'];
const htmlFiles = ['index.html', 'learning/index.html', 'ielts/index.html', 'branches/index.html', 'travel/europe-winter-2027/index.html', 'travel/malaysia/index.html', 'legal/index.html', '404.html'];
const sourceMode = process.argv.includes('--source');
for (const file of sourceMode ? [] : htmlFiles) {
  const html = fs.readFileSync(path.join(projectRoot, 'dist', file), 'utf8');
  assert.match(html, /<h1[ >]/, `Missing rendered heading: ${file}`);
  assert.match(html, /<meta name="description"/, `Missing metadata: ${file}`);
}

let server;
let browser;
const problems = [];
const anchorsByRoute = new Map();
const linkTargets = new Set();
try {
  server = await startLocalServer(sourceMode ? 'dev' : 'preview');
  browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  page.on('pageerror', error => problems.push(`JavaScript: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') problems.push(`Console: ${message.text()}`); });
  page.on('requestfailed', request => problems.push(`Resource: ${request.url()} (${request.failure()?.errorText})`));
  page.on('response', response => { if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`); });

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      try {
        await page.goto(server.baseURL + route, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          // Load deferred images before checking them, including those below the fold.
          await Promise.all([...document.images].map(async img => {
            img.loading = 'eager';
            try { await img.decode(); } catch { /* Recorded by brokenImages below. */ }
          }));
          await Promise.all([500, 600, 700, 800].map(weight => document.fonts.load(`${weight} 16px Inter`)));
          await document.fonts.load('400 16px "Bebas Neue"');
          await document.fonts.ready;
        });
        assert.equal(await page.locator('h1').count(), 1, `Heading count: ${route}`);
        assert.ok(await page.locator('h1').isVisible(), `Heading visibility: ${route}`);
        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow: [...document.querySelectorAll('main *, header *, footer *')].filter(el => {
            const style = getComputedStyle(el), rect = el.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.right > innerWidth + 1.5;
          }).slice(0, 5).map(el => ({ tag: el.tagName, class: el.className })),
          brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
          fontsLoaded: document.fonts.check('500 16px Inter') && document.fonts.check('400 16px "Bebas Neue"'),
          stylesLoaded: getComputedStyle(document.body).fontFamily.includes('Inter') && getComputedStyle(document.documentElement).getPropertyValue('--gl-violet').trim().toUpperCase() === '#8D3BED',
        }));
        assert.ok(layout.scrollWidth <= layout.clientWidth + 1, `Document overflow ${route} at ${width}`);
        assert.deepEqual(layout.overflow, [], `Element overflow ${route} at ${width}`);
        assert.deepEqual(layout.brokenImages, [], `Images ${route}`);
        assert.ok(layout.fontsLoaded && layout.stylesLoaded, `Fonts/styles ${route}`);
        const links = await page.locator('a[href]').evaluateAll(els => els.map(el => el.getAttribute('href')));
        anchorsByRoute.set(route, await page.locator('[id]').evaluateAll(els => els.map(el => el.id)));
        for (const href of links) {
          if (!href.startsWith('/') && !href.startsWith('#')) continue;
          const target = new URL(href, server.baseURL + route);
          linkTargets.add(target.pathname + target.hash);
          assert.ok(routes.includes(target.pathname) || target.pathname === '/404', `Unknown internal route: ${href}`);
          if (target.pathname === route && target.hash) {
            assert.ok(await page.locator(`[id="${decodeURIComponent(target.hash.slice(1))}"]`).count(), `Missing anchor: ${route}${target.hash}`);
          }
        }
        console.log(`PASS ${width}px ${route}`);
      } catch (error) {
        problems.push(`${width}px ${route}: ${error.message}`);
        console.error(`FAIL ${width}px ${route}: ${error.message}`);
      }
    }
  }
  for (const target of linkTargets) {
    const url = new URL(target, server.baseURL);
    if (url.hash) assert.ok(anchorsByRoute.get(url.pathname)?.includes(decodeURIComponent(url.hash.slice(1))), `Missing linked anchor: ${target}`);
  }
  assert.deepEqual(problems, [], problems.join('\n'));
  console.log('PASS: HTML, routes, responsive layouts, links, images, fonts, styles and browser console.');
} finally {
  try { await browser?.close(); } finally { await server?.close(); }
}
