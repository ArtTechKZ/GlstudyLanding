import site from './site-config.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startLocalServer, projectRoot } from './local-server.js';

const routes = [...site.routes.map(r=>r.path), '/missing-page'];
const htmlFiles = [...site.routes.map(r=>r.target), '404.html'];
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
let phase = 'setup';
try {
  server = await startLocalServer(sourceMode ? 'dev' : 'static');
  browser = await chromium.launch({ channel: 'msedge' });
  let page;
  const watch = page => {
  page.on('pageerror', error => problems.push(`JavaScript: ${error.message}`));
  page.on('console', message => {
    const expected404 = message.location().url.includes('/missing-page') && /404/.test(message.text());
    if (message.type() === 'error' && !expected404) problems.push(`Console: ${message.text()}`);
  });
  page.on('requestfailed', request => { console.error('RESOURCE_CONTEXT',JSON.stringify({phase,url:request.url(),error:request.failure()?.errorText,page:page.url(),viewport:page.viewportSize()})); problems.push(`Resource: ${request.url()} (${request.failure()?.errorText})`); });
  page.on('response', response => {
    if (response.status() >= 400 && !(response.status() === 404 && response.request().isNavigationRequest() && response.url().endsWith('/missing-page'))) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  };
  const appPath = pathname => {
    assert.ok(pathname.startsWith(server.base), `URL escaped the app base: ${pathname}`);
    return ('/' + pathname.slice(server.base.length)).replace(/\/$/, '') || '/';
  };

  for (const width of [1440, 390, 320]) {
    // A page resized during navigation can start a responsive preload using the
    // previous viewport and then cancel it. Fix the viewport before any document
    // is loaded; keep all request failures and decoded-image assertions strict.
    await page?.close();
    page = await browser.newPage({ viewport: { width, height: 900 } });
    watch(page);
    for (const route of routes) {
      phase = `${width}px ${route}`;
      try {
        const response = await page.goto(server.baseURL + route, { waitUntil: 'networkidle' });
        if (!sourceMode) assert.equal(response.status(), route === '/missing-page' ? 404 : 200);
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
            // Intentional finite track overflow is inside a native scroll viewport.
            // check-study09.js separately reveals every CTA and checks card bounds.
            const trackViewport = el.closest('.directions__viewport');
            const insideTrack = trackViewport && el !== trackViewport && ['auto', 'scroll'].includes(getComputedStyle(trackViewport).overflowX)
              && trackViewport.getBoundingClientRect().right <= innerWidth + 1.5;
            return !insideTrack && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.right > innerWidth + 1.5;
          }).slice(0, 5).map(el => ({ tag: el.tagName, class: el.className })),
          brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
          fontsLoaded: document.fonts.check('500 16px Inter') && document.fonts.check('400 16px "Bebas Neue"'),
          stylesLoaded: getComputedStyle(document.body).fontFamily.includes('Inter') && getComputedStyle(document.documentElement).getPropertyValue('--gl-violet').trim().toUpperCase() === '#8D3BED',
        }));
        assert.ok(layout.scrollWidth <= layout.clientWidth + 1, `Document overflow ${route} at ${width}`);
        assert.deepEqual(layout.overflow, [], `Element overflow ${route} at ${width}`);
        assert.deepEqual(layout.brokenImages, [], `Images ${route}`);
        assert.ok(layout.fontsLoaded && layout.stylesLoaded, `Fonts/styles ${route}`);
        const links = await page.locator('a[href]:not([data-locale])').evaluateAll(els => els.map(el => el.getAttribute('href')));
        anchorsByRoute.set(route, await page.locator('[id]').evaluateAll(els => els.map(el => el.id)));
        for (const href of links) {
          if (!href.startsWith('/') && !href.startsWith('#')) continue;
          const target = new URL(href, server.baseURL + route);
          const destination = appPath(target.pathname);
          linkTargets.add(destination + target.hash);
          assert.ok(routes.includes(destination) || destination === '/404', `Unknown internal route: ${href}`);
          if (destination === route && target.hash) {
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
  // Real clicks verify raw menu URLs as well as React Router basename links.
  phase = 'menu: return home at 320px';
  await page.goto(server.baseURL + '/', { waitUntil: 'networkidle' });
  await page.locator('.gl-header__burger').click();
  phase = 'menu: navigate to learning';
  await page.locator('.gl-header__mobile-link').filter({ hasText: 'Обучение' }).click();
  await page.waitForURL(url => appPath(url.pathname) === '/learning');
  assert.equal(appPath(new URL(page.url()).pathname), '/learning');
  await page.locator('.inner-page__breadcrumb-link').first().click();
  await page.waitForURL(server.baseURL + '/');
  await page.locator('.hero').waitFor({ state: 'visible' });
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  for (const route of routes.slice(0, -1)) {
    await staticPage.goto(server.baseURL + route, { waitUntil: 'load' });
    assert.equal(await staticPage.locator('h1').count(), 1, `SSG without JavaScript: ${route}`);
  }
  await staticContext.close();
  for (const target of linkTargets) {
    const url = new URL(target, server.baseURL);
    if (url.hash) assert.ok(anchorsByRoute.get(url.pathname)?.includes(decodeURIComponent(url.hash.slice(1))), `Missing linked anchor: ${target}`);
  }
  assert.deepEqual(problems, [], problems.join('\n'));
  console.log('PASS: HTML, routes, responsive layouts, links, images, fonts, styles and browser console.');
} finally {
  try { await browser?.close(); } finally { await server?.close(); }
}
