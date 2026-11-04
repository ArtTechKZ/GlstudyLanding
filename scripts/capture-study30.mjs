// GL-STUDY-30: screenshots of the main screens (desktop 1440 and mobile 375) from a built static directory.
// Usage: node scripts/capture-study30.mjs [--dir dist] [--out .qa/study30/main]
import fs from 'node:fs';
import {chromium} from 'playwright';
import {startStaticServer} from './static-server.js';

const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : fallback; };
const out = arg('out', '.qa/study30/main');
fs.mkdirSync(out, {recursive: true});
const server = await startStaticServer({directory: arg('dir', 'dist')});
const browser = await chromium.launch(process.env.GL_BROWSER_EXECUTABLE_PATH ? {executablePath: process.env.GL_BROWSER_EXECUTABLE_PATH} : {channel: process.env.GL_BROWSER_CHANNEL || 'msedge'});
const shots = [
  ['home-hero', '/', null],
  ['home-directions', '/', '#directions'],
  ['home-admissions', '/', '#admissions'],
  ['home-packages', '/', '#packages'],
  ['home-services', '/', '#services'],
  ['home-branches', '/', '#branches'],
  ['home-contact', '/', '#contact-whatsapp'],
  ['footer', '/', 'footer'],
  ['branches-active', '/branches/', '[data-branch-group="active"]'],
  ['branches-online', '/branches/', '[data-branch-group="online"]'],
  ['branches-launch-repair', '/branches/', '[data-branch-group="online_launch"]'],
  ['branches-requisites', '/branches/', '#requisites'],
  ['city-almaty', '/branches/almaty/', 'main'],
  ['legal-top', '/legal/', null],
  ['legal-offer', '/legal/', '#offer'],
  ['privacy-policy', '/privacy-policy/', null],
];
try {
  for (const [width, height] of [[1440, 900], [375, 812]]) {
    const context = await browser.newContext({viewport: {width, height}, reducedMotion: 'reduce'});
    const page = await context.newPage();
    for (const [name, route, selector] of shots) {
      await page.goto(server.baseURL + route, {waitUntil: 'networkidle'});
      await page.waitForTimeout(300);
      const consent = page.locator('[data-consent-action=necessary]');
      if (await consent.count() && await consent.first().isVisible()) await consent.first().click();
      const file = `${out}/${name}-${width}.png`;
      if (!selector) await page.screenshot({path: file});
      else {
        const target = page.locator(selector).first();
        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // lets the directions carousel settle
        const box = await target.boundingBox();
        // Large containers are clipped to their first 1800 px to keep files reviewable.
        if (box && box.height > 1800) await page.screenshot({path: file, clip: {x: 0, y: Math.max(0, box.y + await page.evaluate(() => scrollY)), width, height: 1800}, fullPage: true});
        else await target.screenshot({path: file});
      }
    }
    await context.close();
  }
  console.log('PASS screenshots written to ' + out);
} finally { await browser.close(); await server.close(); }
