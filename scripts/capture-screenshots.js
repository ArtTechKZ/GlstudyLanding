import { chromium } from 'playwright';
import { startLocalServer } from './local-server.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, '.qa', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exactly 7 canonical content routes + technical 404 test
const ROUTE_EXPECTATIONS = [
  { route: '/', expectedH1: /английский|курсы/i, titleKeyword: 'GL Study' },
  { route: '/learning', expectedH1: /курсы|программы/i, titleKeyword: 'Курсы' },
  { route: '/ielts', expectedH1: /ielts/i, titleKeyword: 'IELTS' },
  { route: '/branches', expectedH1: /филиал/i, titleKeyword: 'Филиалы' },
  { route: '/travel/europe-winter-2027', expectedH1: /европ|праг/i, titleKeyword: 'Праг' },
  { route: '/travel/malaysia', expectedH1: /малайзи/i, titleKeyword: 'Малайзи' },
  { route: '/legal', expectedH1: /юридическ|информаци/i, titleKeyword: 'Юридическ' },
  { route: '/non-existent-route-404', expectedH1: /404|не найдена/i, titleKeyword: '404', is404: true }
];

async function checkBoundingBoxOverflow(page, viewportWidth) {
  return await page.evaluate((vpWidth) => {
    const overflowingElements = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }
        const rect = el.getBoundingClientRect();
        // Allow a small 1.5px sub-pixel tolerance
        if (rect.right > vpWidth + 1.5) {
          overflowingElements.push({
            tagName: el.tagName.toLowerCase(),
            className: el.className || '',
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            excess: Math.round(rect.right - vpWidth)
          });
        }
      }
    }
    return overflowingElements.slice(0, 5); // Return up to 5 examples
  }, viewportWidth);
}

async function run() {
  console.log('=== GL Study browser QA ===\n');

  let preview;
  let browser;
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'laptop-1280', width: 1280, height: 800 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-320', width: 320, height: 720 },
  ];

  const results = {
    canonicalRoutesCount: 7,
    viewportsTested: viewports.map(v => v.name),
    screenshots: [],
    overflowCheck: {},
    interactiveTests: {},
    routeTests: {},
    consoleErrors: []
  };

  try {
    preview = await startLocalServer();
    browser = await chromium.launch({ channel: 'msedge' });
    // 1. Home page screenshots and overflow check across 5 viewports
    console.log('\n--- 1. Viewport & Overflow Tests ---');
    for (const vp of viewports) {
      console.log(`Checking viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1
      });
      const page = await context.newPage();

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          results.consoleErrors.push({ viewport: vp.name, error: msg.text() });
        }
      });

      await page.goto(`${preview.baseURL}/`, { waitUntil: 'networkidle' });

      // Above the fold screenshot
      const foldPath = path.join(screenshotsDir, `${vp.name}-above-fold.png`);
      await page.screenshot({ path: foldPath, fullPage: false });
      results.screenshots.push(foldPath);

      // Full page screenshot
      const fullPath = path.join(screenshotsDir, `${vp.name}-full.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      results.screenshots.push(fullPath);

      // ScrollWidth check
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const scrollOverflow = scrollWidth > clientWidth;

      // Deep bounding box check
      const bboxOverflows = await checkBoundingBoxOverflow(page, vp.width);
      const hasBBoxOverflow = bboxOverflows.length > 0;

      const passed = !scrollOverflow && !hasBBoxOverflow;
      results.overflowCheck[vp.name] = {
        scrollWidth,
        clientWidth,
        scrollOverflow,
        bboxOverflows,
        status: passed ? 'PASS' : 'FAIL'
      };

      console.log(`  -> ${vp.name}: ${passed ? 'PASS (no overflow)' : `FAIL: scrollOverflow=${scrollOverflow}, bbox=${JSON.stringify(bboxOverflows)}`}`);

      await context.close();
    }

    // 2. City Selector Persistence & Branches Query Sync QA
    console.log('\n--- 2. City Selector Persistence & Branches Query Sync QA ---');
    const cityContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const cityPage = await cityContext.newPage();
    await cityPage.goto(`${preview.baseURL}/`, { waitUntil: 'networkidle' });

    // Initial value
    const initialCity = await cityPage.evaluate(() => localStorage.getItem('gl_study_selected_city'));
    console.log(`  Initial localStorage value: ${initialCity}`);

    // Change to 'kostanay'
    await cityPage.selectOption('#city-select', 'kostanay');
    await wait(300);
    const storedAfterSelect = await cityPage.evaluate(() => localStorage.getItem('gl_study_selected_city'));
    console.log(`  Selected 'kostanay'. Stored in localStorage: "${storedAfterSelect}"`);

    // Reload page to test persistence
    await cityPage.reload({ waitUntil: 'networkidle' });
    const storedAfterReload = await cityPage.evaluate(() => localStorage.getItem('gl_study_selected_city'));
    const selectValAfterReload = await cityPage.inputValue('#city-select');

    // Test query filter navigation on /branches?city=kostanay
    await cityPage.goto(`${preview.baseURL}/branches?city=kostanay`, { waitUntil: 'networkidle' });
    await wait(300);
    const branchPageContent = await cityPage.textContent('body');
    const showsKostanayBranch = branchPageContent?.includes('Филиал (IELTS)') || branchPageContent?.includes('Костанай');

    const persistencePass = storedAfterReload === 'kostanay' &&
                            selectValAfterReload === 'kostanay' &&
                            showsKostanayBranch;

    console.log(`  City state & /branches?city=kostanay: -> ${persistencePass ? 'PASS' : 'FAIL'}`);

    // Test fallback validation: navigate back to root (without query) and inject invalid city
    await cityPage.goto(`${preview.baseURL}/`, { waitUntil: 'networkidle' });
    await cityPage.evaluate(() => localStorage.setItem('gl_study_selected_city', 'invalid_city_xyz'));
    await cityPage.reload({ waitUntil: 'networkidle' });
    const selectValAfterInvalid = await cityPage.inputValue('#city-select');
    const fallbackPass = selectValAfterInvalid === 'almaty';
    console.log(`  After invalid city injection on root: fallback="${selectValAfterInvalid}" (expected 'almaty') -> ${fallbackPass ? 'PASS' : 'FAIL'}`);

    results.interactiveTests.cityPersistence = {
      status: persistencePass && fallbackPass ? 'PASS' : 'FAIL',
      persistencePass,
      fallbackPass,
      storedValue: storedAfterReload,
      selectValue: selectValAfterReload
    };

    await cityContext.close();

    // 3. Mobile Navigation & Interactive QA (390x844)
    console.log('\n--- 3. Mobile Navigation & Interactive QA (390x844) ---');
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${preview.baseURL}/`, { waitUntil: 'networkidle' });

    // Click burger
    const burger = mobilePage.locator('.gl-header__burger');
    await burger.click();
    await wait(400);
    const menuVisible = await mobilePage.locator('#mobile-menu').isVisible();
    const menuLinksCount = await mobilePage.locator('#mobile-menu .gl-header__mobile-link').count();

    const mobileMenuPath = path.join(screenshotsDir, 'mobile-390-menu-open.png');
    await mobilePage.screenshot({ path: mobileMenuPath });
    results.screenshots.push(mobileMenuPath);

    // Click a link in mobile menu to test navigation to /learning
    const learningLink = mobilePage.locator('#mobile-menu a[href="/learning"]');
    await learningLink.click();
    await mobilePage.waitForURL('**/learning');
    const mobileH1 = await mobilePage.locator('h1').textContent();
    const menuClosedAfterNav = !(await mobilePage.locator('#mobile-menu').isVisible());

    const mobileNavPass = menuVisible && menuLinksCount >= 5 && mobileH1?.toLowerCase().includes('курс') && menuClosedAfterNav;
    console.log(`  Mobile menu open/nav test: ${mobileNavPass ? 'PASS' : 'FAIL'} (H1: "${mobileH1?.trim()}")`);

    results.interactiveTests.mobileNavigation = {
      status: mobileNavPass ? 'PASS' : 'FAIL',
      menuVisible,
      menuLinksCount,
      menuClosedAfterNav,
      targetH1: mobileH1?.trim()
    };

    await mobileContext.close();

    // 4. Detailed Route Tests with Content Validation (No fake PASS)
    console.log('\n--- 4. Detailed Route Tests & Content Validation (7 routes + 404) ---');
    const routeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const routePage = await routeContext.newPage();

    routePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        results.consoleErrors.push({ route: routePage.url(), error: msg.text() });
      }
    });

    for (const exp of ROUTE_EXPECTATIONS) {
      console.log(`Validating route: ${exp.route}...`);
      const resp = await routePage.goto(`${preview.baseURL}${exp.route}`, { waitUntil: 'networkidle' });
      const status = resp?.status() || 0;
      const title = await routePage.title();
      const metaDesc = await routePage.locator('meta[name="description"]').getAttribute('content').catch(() => null);
      const h1 = await routePage.locator('h1').textContent().catch(() => '');
      const cleanH1 = h1?.replace(/\s+/g, ' ').trim() || '';

      const h1Matches = exp.expectedH1.test(cleanH1);
      const titleMatches = title.toLowerCase().includes(exp.titleKeyword.toLowerCase());

      let testPass = h1Matches && titleMatches;
      let detail = `H1: "${cleanH1.slice(0, 45)}" | Title: "${title.slice(0, 45)}"`;

      if (exp.is404) {
        const client404Rendered = cleanH1.includes('404') || cleanH1.toLowerCase().includes('не найдена');
        testPass = client404Rendered;
        detail = `Server HTTP status: ${status} (SPA fallback). Client-side 404 UI rendered: ${client404Rendered}`;
        console.log(`  404 analysis: Server HTTP code is ${status} (expected 200 under Vite SPA preview fallback). Client 404 UI: ${client404Rendered ? 'CONFIRMED' : 'FAILED'}`);
      }

      results.routeTests[exp.route] = {
        status: testPass ? 'PASS' : 'FAIL',
        serverHttpStatus: status,
        h1: cleanH1,
        title,
        metaDescription: metaDesc,
        detail
      };

      console.log(`  -> ${exp.route}: ${testPass ? 'PASS' : 'FAIL'} (${detail})`);
    }

    // 5. Screenshot all 7 canonical content pages in high resolution
    console.log('\n--- 5. Capturing 7 Canonical Pages Screenshots (Desktop 1440px) ---');
    const internalRoutesToCapture = [
      { route: '/', file: 'desktop-1440-home.png' },
      { route: '/learning', file: 'desktop-1440-learning.png' },
      { route: '/ielts', file: 'desktop-1440-ielts.png' },
      { route: '/branches', file: 'desktop-1440-branches.png' },
      { route: '/branches?city=kostanay', file: 'desktop-1440-branches-kostanay.png' },
      { route: '/travel/europe-winter-2027', file: 'desktop-1440-travel-prague.png' },
      { route: '/travel/malaysia', file: 'desktop-1440-travel-malaysia.png' },
      { route: '/legal', file: 'desktop-1440-legal.png' }
    ];

    for (const item of internalRoutesToCapture) {
      await routePage.goto(`${preview.baseURL}${item.route}`, { waitUntil: 'networkidle' });
      await wait(300);
      const filePath = path.join(screenshotsDir, item.file);
      await routePage.screenshot({ path: filePath, fullPage: true });
      results.screenshots.push(filePath);
      console.log(`  Saved screenshot: ${item.file}`);
    }

    await routeContext.close();

    // 6. Mobile Screenshots of Key Pages (390px)
    console.log('\n--- 6. Capturing Mobile Internal Pages Screenshots (390px) ---');
    const mobileCaptureContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobileCapturePage = await mobileCaptureContext.newPage();

    const mobileRoutes = [
      { route: '/learning', file: 'mobile-390-learning.png' },
      { route: '/ielts', file: 'mobile-390-ielts.png' },
      { route: '/branches', file: 'mobile-390-branches.png' },
      { route: '/travel/europe-winter-2027', file: 'mobile-390-travel-prague.png' },
      { route: '/travel/malaysia', file: 'mobile-390-travel-malaysia.png' },
      { route: '/legal', file: 'mobile-390-legal.png' }
    ];

    for (const mItem of mobileRoutes) {
      await mobileCapturePage.goto(`${preview.baseURL}${mItem.route}`, { waitUntil: 'networkidle' });
      await wait(300);
      const mPath = path.join(screenshotsDir, mItem.file);
      await mobileCapturePage.screenshot({ path: mPath, fullPage: true });
      results.screenshots.push(mPath);
      console.log(`  Saved mobile screenshot: ${mItem.file}`);
    }

    await mobileCaptureContext.close();

  } finally {
    try { await browser?.close(); } finally { await preview?.close(); }
    console.log('\n--- Preview server stopped ---');
  }

  // Save full QA report
  fs.writeFileSync(
    path.join(projectRoot, '.qa', 'browser-test-results.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log('\nDetailed QA report written to .qa/browser-test-results.json');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
