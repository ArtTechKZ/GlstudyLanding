import {evidencePath} from './evidence-path.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startLocalServer, projectRoot } from './local-server.js';
import { measureContrast, saveAudit, auditSummary, auditExitCode } from './contrast-check.js';

const sourceMode = process.argv.includes('--source');
const saveArtifacts = !process.argv.includes('--no-artifacts');
const results = [];
const errors = [];
let server;
let browser;
try {
  console.log(`Contrast check: ${sourceMode ? 'source' : 'built'}`);
  server = await startLocalServer(sourceMode ? 'dev' : 'static');
  browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    const expected404 = new URL(page.url()).pathname.endsWith('/missing-test') &&
      message.location().url === page.url() && /404/.test(message.text());
    if (message.type() === 'error' && !expected404) errors.push(message.text());
  });
  const routes = ['/learning', '/ielts', '/branches?city=kostanay', '/travel/europe-winter-2027', '/travel/malaysia', '/legal', '/missing-test'];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(server.baseURL + route, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => performance.getEntriesByName('gl:hydration:commit').length > 0);
      const items = [{ selector: '.inner-page__title' }];
      if (route === '/learning' || route === '/ielts') items.push({ selector: '.inner-page__tag' });
      if (['/ielts', '/branches?city=kostanay', '/travel/europe-winter-2027', '/travel/malaysia', '/legal'].includes(route)) {
        items.push({ selector: '.inner-page__accent' });
      }
      if (route === '/ielts') {
        assert.equal(await page.locator('.ielts-module').count(), 4);
        items.push({ selector: '.ielts-module__badge' }, { selector: '.ielts-module h3' });
      }
      // Current approved branch UI uses factual panels, including pending data.
      if (route.startsWith('/branches')) items.push({ selector: '.study-branch-list .study-panel h3,.study-branch-list .study-panel p' });
      for (const item of items) results.push(...(await measureContrast(page, item)).map(r => ({ ...r, page: route, width })));
      // Check every supported hero surface using an isolated DOM class switch.
      if (route === '/ielts') {
        const hero = page.locator('.inner-page__hero');
        for (const variant of ['violet', 'orange', 'violet-light', 'orange-light', 'white']) {
          await hero.evaluate((el, color) => { el.className = `inner-page__hero inner-page__hero--${color}`; }, variant);
          results.push(...(await measureContrast(page, { selector: '.inner-page__accent' })).map(r => ({ ...r, page: route, width, variant })));
        }
        await hero.evaluate(el => { el.className = 'inner-page__hero inner-page__hero--violet'; });
        if (!sourceMode && saveArtifacts) {
          const dir = path.join(projectRoot, evidencePath('.qa'), 'contrast');
          fs.mkdirSync(dir, { recursive: true });
          await page.locator('.ielts-module.surface-orange').screenshot({ path: path.join(dir, `ielts-orange-${width}.png`) });
        }
      }
    }
    await page.goto(server.baseURL + '/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => performance.getEntriesByName('gl:hydration:commit').length > 0);
    results.push(...(await measureContrast(page, { selector: '.footer__contact-placeholder em' })).map(r => ({ ...r, page: '/', width })));
    for (const selector of ['.directions__card--orange .directions__card-cta', '.hero__cta-main']) {
      const button = page.locator(selector).first();
      await button.hover();
      await page.waitForTimeout(350);
      results.push(...(await measureContrast(page, { selector })).map(r => ({ ...r, page: '/', width, state: 'hover' })));
    }
    assert.equal(await page.locator('.oo-online-preview__status-dot').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(141, 59, 237)');
    if (width < 768) {
      await page.locator('.gl-header__burger').click();
      const button = page.locator('.gl-header__mobile-cta');
      await button.hover();
      await page.waitForTimeout(350);
      results.push(...(await measureContrast(page, { selector: '.gl-header__mobile-cta' })).map(r => ({ ...r, page: '/', width, state: 'hover' })));
    }
  }
  assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
  if (saveArtifacts) {
    const dir = path.join(projectRoot, evidencePath('.qa'), 'contrast');
    fs.mkdirSync(dir, { recursive: true });
    saveAudit(path.join(dir, sourceMode ? 'source.json' : 'built.json'), results);
  } else {
    console.log(auditSummary(results));
    process.exitCode = auditExitCode(results);
  }
} finally {
  try { await browser?.close(); } finally { await server?.close(); }
}
