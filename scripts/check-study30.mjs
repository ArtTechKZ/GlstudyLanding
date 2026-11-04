// GL-STUDY-30 page-by-page browser check: every registered route at 320/375/768/1440 px.
// Usage: node scripts/check-study30.mjs [--dir dist] [--locales ru[,kk,en]] [--out .qa/study30]
// Reads only a built static directory; opens WhatsApp links as data (never clicks them) and sends nothing.
import fs from 'node:fs';
import {chromium} from 'playwright';
import {startStaticServer} from './static-server.js';
import site from './site-config.js';

const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : fallback; };
const directory = arg('dir', process.env.GL_DIST_DIR ?? 'dist');
const locales = arg('locales', 'ru').split(',');
const out = arg('out', '.qa/study30');
fs.mkdirSync(out + '/screens', {recursive: true});
const widths = [320, 375, 768, 1440];
const WA = '77055589219';
const WA_TEXT = [
  /^Здравствуйте, пишу с сайта, хотел подробнее узнать про программу ".+"$/,
  /^Здравствуйте, пишу с сайта, мне нужна консультация по услуге ".+"$/,
  /^Здравствуйте, пишу с сайта, хотел подробнее узнать про филиал ".+"$/,
  /^Здравствуйте, пишу с сайта, хотел узнать про бесплатный пробный урок$/,
  /^Здравствуйте, пишу с сайта, хотел задать вопрос$/,
];
const results = {pages: [], links: [], problems: [], widths, locales};
const problem = (route, message) => { results.problems.push({route, message}); console.error('PROBLEM', route, message); };

const server = await startStaticServer({directory});
const browser = await chromium.launch(process.env.GL_BROWSER_EXECUTABLE_PATH ? {executablePath: process.env.GL_BROWSER_EXECUTABLE_PATH} : process.env.GL_BROWSER_CHANNEL === 'chromium' ? {} : {channel: process.env.GL_BROWSER_CHANNEL || 'msedge'});
const internal = new Set();
try {
  for (const locale of locales) for (const route of site.routes) {
    const semantic = route.path;
    const pathname = (locale === 'ru' ? '' : '/' + locale) + semantic + (semantic === '/' ? '' : '/');
    const label = (locale === 'ru' ? '' : locale + ':') + semantic;
    for (const width of widths) {
      const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      const page = await context.newPage();
      const errors = [], external = [], failed = [], posts = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('requestfailed', r => failed.push(r.url()));
      page.on('request', r => { if (r.method() !== 'GET') posts.push(r.url()); if (new URL(r.url()).origin !== server.origin) external.push(r.url()); });
      const response = await page.goto(server.baseURL + pathname, {waitUntil: 'networkidle'});
      // /404/ is a real static page (200); unknown paths return the technical 404 and are covered by test:public.
      if (response.status() !== 200) problem(label + '@' + width, 'status ' + response.status());
      await page.waitForTimeout(250);
      const info = await page.evaluate(({wa, texts}) => {
        const visible = e => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
        const text = document.body.innerText;
        const waLinks = [...document.querySelectorAll('a[data-whatsapp]')].map(a => {
          const u = new URL(a.href); return {kind: a.dataset.whatsapp, host: u.host, path: u.pathname.slice(1), text: u.searchParams.get('text'), label: a.innerText.trim(), target: a.target, rel: a.rel};
        });
        return {
          h1: [...document.querySelectorAll('h1')].map(h => h.innerText.trim()),
          overflow: document.documentElement.scrollWidth - innerWidth,
          brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
          waLinks,
          badWa: waLinks.filter(l => l.host !== 'wa.me' || l.path !== wa || !texts.some(r => new RegExp(r.source).test(l.text ?? '')) || l.target !== '_blank' || !/noopener/.test(l.rel)),
          leadAnchors: document.querySelectorAll('a[href="#lead-form"],form').length,
          maps: document.querySelectorAll('.study-map,.leaflet-container,iframe,[data-map]').length,
          // Same shape as the snapshot validator: an amount followed by a currency. The word "тенге" alone appears in the client's offer text (4.1).
          hasPrice: /\d[\d\s.,]*\s*(?:₸|тенге|тг\b|KZT\b|₽|\$|€|USD\b|EUR\b)|₸/i.test(text),
          platforms: /\b(zoom|skype|google meet|teams)\b/i.test(text),
          leakedKeys: (text.match(/\b(?:Full|Common|Footer|Header|Legal|Branch\w*|Lead\w*|Directions\w*)\.[A-Za-z.]{3,}/g) ?? []).slice(0, 5),
          emptyPanels: [...document.querySelectorAll('.study-panel,article')].filter(e => visible(e) && !e.innerText.trim() && !e.querySelector('img')).length,
          tel: [...document.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href')),
          mail: [...document.querySelectorAll('a[href^="mailto:"]')].map(a => a.getAttribute('href')),
          insta: [...document.querySelectorAll('a[href*="instagram.com"]')].map(a => a.getAttribute('href')),
          internalLinks: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h.startsWith('/GlstudyLanding/')),
        };
      }, {wa: WA, texts: WA_TEXT.map(r => ({source: r.source}))});
      for (const href of info.internalLinks) internal.add(href.split('#')[0]);
      if (route.target !== '404.html' && info.h1.length !== 1) problem(label + '@' + width, 'h1 count ' + info.h1.length);
      if (info.overflow > 1) problem(label + '@' + width, 'horizontal scroll +' + info.overflow);
      if (info.brokenImages.length) problem(label + '@' + width, 'broken images ' + info.brokenImages.join(','));
      if (info.badWa.length) problem(label + '@' + width, 'bad WhatsApp ' + JSON.stringify(info.badWa[0]));
      if (info.leadAnchors) problem(label + '@' + width, 'lead form/anchor still present');
      if (info.maps) problem(label + '@' + width, 'map element present');
      if (info.hasPrice) problem(label + '@' + width, 'price text present');
      if (info.platforms) problem(label + '@' + width, 'online platform name present');
      if (info.leakedKeys.length) problem(label + '@' + width, 'translation key leaked ' + info.leakedKeys.join(','));
      if (info.emptyPanels) problem(label + '@' + width, 'empty panels ' + info.emptyPanels);
      if (errors.length) problem(label + '@' + width, 'console/page errors ' + errors.slice(0, 2).join(' | '));
      if (failed.length) problem(label + '@' + width, 'failed requests ' + failed.slice(0, 2).join(','));
      if (posts.length) problem(label + '@' + width, 'non-GET requests ' + posts.join(','));
      if (external.length) problem(label + '@' + width, 'external requests ' + external.slice(0, 2).join(','));
      for (const kind of ['service']) for (const l of info.waLinks.filter(l => l.kind === kind && locale === 'ru')) if (l.label !== 'Консультация в WhatsApp') problem(label + '@' + width, 'service button label ' + l.label);

      if (locale === 'ru') {
        const rows = await routeChecks(page, semantic);
        for (const message of rows) problem(label + '@' + width, message);
      }
      if (!process.argv.includes('--no-screens')) await page.screenshot({path: `${out}/screens/${locale}${semantic === '/' ? '-home' : semantic.replaceAll('/', '_')}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 50});
      results.pages.push({locale, route: semantic, width, h1: info.h1[0], overflow: info.overflow, whatsapp: info.waLinks.length, tel: [...new Set(info.tel)], mail: [...new Set(info.mail)], instagram: [...new Set(info.insta)].length});
      await context.close();
    }
  }
  // Every internal link found on any page resolves (real 200 for pages, assets excluded).
  const ctx = await browser.newContext();
  for (const href of internal) {
    if (/\.(?:svg|webp|css|js|woff2|png|xml|json|txt)$/.test(href)) continue;
    const r = await ctx.request.get(server.origin + href);
    results.links.push({href, status: r.status()});
    if (r.status() !== 200 && !href.endsWith('/404/')) problem('links', href + ' -> ' + r.status());
  }
  await ctx.close();
} finally {
  fs.writeFileSync(out + '/study30-results.json', JSON.stringify(results, null, 2));
  await browser.close(); await server.close();
}
async function routeChecks(page, route) {
  const bad = [];
  const q = (sel, fn) => page.evaluate(([s, f]) => new Function('els', 'return (' + f + ')(els)')([...document.querySelectorAll(s)]), [sel, fn.toString()]);
  if (route === '/') {
    const pk = await q('#packages article', 'els=>els.map(e=>({t:e.querySelector("h3").innerText,n:e.querySelectorAll("li").length,d:e.innerText.includes("Длительность: 24 месяца")}))');
    if (JSON.stringify(pk.map(x => x.t)) !== JSON.stringify(['Полное сопровождение', 'Поступление в ТОП университет', 'Менторство']) || pk.some(x => x.n !== 11 || !x.d)) bad.push('packages ' + JSON.stringify(pk));
    const sv = await q('#services article', 'els=>els.map(e=>e.querySelector("h3").innerText)');
    if (sv.length !== 5) bad.push('services ' + sv.length);
    const cards = await q('.directions__card', 'els=>els.map(e=>e.querySelector("a[data-whatsapp]")?.dataset.whatsapp)');
    if (cards.length !== 7 || cards.some(x => x !== 'program')) bad.push('direction cards ' + cards.join(','));
    if (!(await page.locator('footer a[href="tel:+77073106822"]').count())) bad.push('footer international phone missing');
    if (!(await page.locator('footer a[href="mailto:grandluxe@yandex.ru"]').count())) bad.push('footer email missing');
    if (!(await page.locator('footer a[href="https://www.instagram.com/grandluxe.kz"]').count())) bad.push('footer instagram missing');
    if (!(await page.locator('footer').innerText()).includes('Приемная и менеджеры: 09:00-19:00')) bad.push('footer hours missing');
    if (!(await page.locator('.footer__mobile-sticky a[data-whatsapp]').count())) bad.push('mobile WhatsApp button missing');
    // GL-STUDY-31: Kazakh is shown as offered (4 Kostanay branches + Rudny from the branch table), only Czech/Chinese/Korean as planned.
    const kk = await page.locator('#additional-languages [data-program="language-kazakh"]').innerText();
    for (const n of ['Костанай — центр', 'Костанай — КЖБИ', 'Костанай — КСК', 'Костанай — ПЛАЗА', 'Рудный']) if (!kk.includes(n)) bad.push('Kazakh branch missing ' + n);
    if (/Астана|Алматы|Тараз|Планируемое/.test(kk)) bad.push('Kazakh offer must not spread beyond Kostanay/Rudny: ' + kk);
    const planned = await q('#additional-languages article:not([data-program="language-kazakh"]) h3', 'els=>els.map(e=>e.innerText)');
    if (planned.join() !== 'Чешский,Китайский,Корейский') bad.push('planned languages ' + planned.join());
    // Anchors used by header, footer and in-page links must exist on the home page.
    for (const id of ['directions', 'travel', 'admissions', 'packages', 'services', 'branches', 'reviews', 'faq', 'contacts', 'contact-whatsapp']) if (!(await page.locator('#' + id).count())) bad.push('anchor #' + id + ' missing');
  }
  if (route === '/branches') {
    const groups = await q('[data-branch-group]', 'els=>els.map(e=>e.dataset.branchGroup+":"+e.querySelectorAll("article[data-branch]").length)');
    if (groups.join() !== 'active:10,online:1,online_launch:4,repair:1') bad.push('branch groups ' + groups.join());
    const nz = await page.locator('[data-branch="almaty-nazarbayev"]').innerText();
    if (!nz.includes('Только онлайн') || /Назарбаева \d|офис|каб/i.test(nz)) bad.push('Nazarbayev card ' + nz);
    const ek = await page.locator('[data-branch="ekibastuz"]');
    if (!(await ek.innerText()).includes('Центр на ремонте') || await ek.locator('a[data-whatsapp]').count()) bad.push('Ekibastuz card');
    for (const id of ['ust-kamenogorsk-online', 'kokshetau-online', 'petropavlovsk-online', 'almaty-online']) if (!(await page.locator(`[data-branch="${id}"]`).innerText()).includes('Начинают работу в онлайн-формате')) bad.push('launch note ' + id);
    // Live sheet (export csv, 2026-11-04): each of these branches has its own phone in column D; the card must show exactly that tel: link.
    const sheetPhones = { 'kostanay-plaza': 'tel:+77078240000', 'taraz-konaev': 'tel:+77758391150', 'ekibastuz': 'tel:+77001323048', 'ust-kamenogorsk-online': 'tel:+77001323048' };
    for (const [id, want] of Object.entries(sheetPhones)) {
      const tels = await page.locator(`[data-branch="${id}"] a[href^="tel:"]`).evaluateAll(es => es.map(e => e.getAttribute('href')));
      if (tels.length !== 1 || tels[0] !== want) bad.push(`card ${id} phone ${tels.join() || 'missing'} expected ${want}`);
    }
    const req = await page.locator('[data-requisites]').innerText();
    for (const s of ['260640037588', 'проспект Нұрсұлтан Назарбаев, дом 195, кв. 71', 'grandluxe@yandex.ru', '+7 707 310 68 22']) if (!req.includes(s)) bad.push('requisites lacks ' + s);
  }
  if (route === '/branches/almaty' && (await page.locator('article[data-branch]').count()) !== 3) bad.push('almaty entries');
  if (route === '/branches/kostanay' && (await page.locator('article[data-branch]').count()) !== 4) bad.push('kostanay entries');
  if (route === '/legal') {
    if ((await page.locator('#privacy h3').count()) !== 7 || (await page.locator('#offer h3').count()) !== 9) bad.push('legal sections');
    if (!(await page.locator('#offer').innerText()).includes('ТОВАРИЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "GL STUDY"')) bad.push('offer requisites');
  }
  if (route === '/privacy-policy' && (await page.locator('[data-legal-document="privacy"] h3').count()) !== 7) bad.push('privacy sections');
  if (route === '/personal-data-consent' && (await page.locator('[data-legal-document]').count())) bad.push('consent page must not carry invented text');
  return bad;
}
console.log(results.problems.length ? `FAIL ${results.problems.length} problems` : `PASS GL-STUDY-30: ${results.pages.length} page renders (${locales.join('/')}), ${results.links.length} internal links`);
if (results.problems.length) process.exit(1);
