import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { measureContrast, saveAudit } from './contrast-check.js';

if (process.argv.includes('--fixture-child')) {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge' });
    const page = await browser.newPage();
    await page.setContent(`<body style="background:white">
      <p class="fail" style="color:white">Isolated mandatory failure</p>
      <p class="alpha" style="color:rgba(0,0,0,.65)">Alpha</p>
      <p class="opacity" style="color:black;opacity:.65">Opacity</p>
      <div style="background:black"><p class="layer" style="color:black;background:rgba(255,255,255,.9)">Layers</p></div>
      <p class="gradient" style="background:linear-gradient(white,black)">Gradient</p>
      <p class="unknown" style="color:color(display-p3 1 0 0)">Unknown color</p>
      <p class="small" style="font-size:18px;font-weight:700;color:white;background:rgb(242,76,10)">Small</p>
      <p class="large" style="font-size:19px;font-weight:700;color:white;background:rgb(242,76,10)">Large</p>
    </body>`);
    const check = async selector => (await measureContrast(page, { selector }))[0];
    const results = await measureContrast(page, { selector: '.fail' });
    assert.equal(results[0].status, 'FAIL');
    assert.equal((await check('.alpha')).status, 'PASS');
    assert.equal((await check('.opacity')).status, 'PASS');
    assert.equal((await check('.layer')).status, 'PASS');
    assert.equal((await check('.gradient')).status, 'MANUAL REVIEW');
    assert.equal((await check('.unknown')).status, 'MANUAL REVIEW');
    assert.equal((await check('.missing')).status, 'FAIL');
    assert.equal((await check('.small')).status, 'FAIL');
    assert.equal((await check('.large')).status, 'PASS');
    assert.equal((await measureContrast(page, { selector: 'p' })).length, 8);
    saveAudit(process.argv.at(-1), results);
  } finally {
    await browser?.close();
    console.log('Fixture browser closed');
  }
} else {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-study-contrast-'));
  try {
    const report = path.join(dir, 'fixture.json');
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--fixture-child', report], { encoding: 'utf8', timeout: 60000 });
    assert.equal(child.status, 1, child.stderr || child.stdout);
    assert.equal(JSON.parse(fs.readFileSync(report, 'utf8'))[0].status, 'FAIL');
    assert.match(child.stdout, /Checks did not pass/);
    assert.match(child.stdout, /Fixture browser closed/);
    assert.doesNotMatch(child.stdout, /Checks passed/);
    console.log('PASS: isolated mandatory FAIL saved its report, closed the browser and exited 1; alpha, layers, missing selectors and text thresholds verified.');
  } finally {
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep + 'gl-study-contrast-'));
    fs.rmSync(dir, { recursive: true });
  }
}
