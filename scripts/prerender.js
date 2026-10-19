import {createLocalized404} from './localized-404.js';
import {routesForContent,locales,pageHref,publicRu,approvedLocales} from '../src/config/locale-routes.js';
import site,{scriptContent} from './site-config.js';
const localizedRoutes=routesForContent(scriptContent.data.hiddenRoutes);
import { chromium } from 'playwright';
import { startLocalServer } from './local-server.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, process.env.GL_DIST_DIR??'dist');
const manifestPath = path.join(distDir, '.vite', 'manifest.json');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Canonical content routes and the technical 404 page.
const routesToPrerender = [...localizedRoutes.map(r => ({ route: r.path, target: r.target })), ...locales.map(locale=>({route:locale==='ru'?'/404':'/'+locale+'/404',target:locale==='ru'?'404.html':locale+'/404.html'}))];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`--- Static pre-rendering: ${site.routes.length} sections × ${locales.length} approved/local languages + ${locales.length} technical 404s ---`);
  let preview;
  let browser;

  try {
    const builtEarly = await build({configFile:false,logLevel:'error',define:{__GL_PUBLIC_RU__:JSON.stringify(publicRu)},build:{write:false,minify:true,lib:{entry:path.join(projectRoot,'src/early-entry.ts'),name:'GLStudyEarly',formats:['iife']}}});
    const earlyOutput = Array.isArray(builtEarly) ? builtEarly[0] : builtEarly;
    const earlyScript = earlyOutput.output.find(item=>item.type==='chunk').code;
    // Only preload the small startup entry. Critical UI is inline; bootstrap
    // requests the full application after the first displayed SSG frame.
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const interaction = manifest['index.html'];
    if (!interaction?.file) throw Error('Missing interaction entry in Vite manifest');
    const preloadFiles = [interaction.file];
    preview = await startLocalServer();
    browser = await chromium.launch({ channel: 'msedge' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => { window.__GL_SSG__ = true; });
    const page = await context.newPage();
    const shellPath = path.join(distDir, 'index.html');
    const shell = fs.readFileSync(shellPath, 'utf8');
    let homeHtml;const notFound={};
    for (const item of routesToPrerender) {
      fs.writeFileSync(shellPath, shell); // Each route starts from the fresh Vite shell.
      const url = `${preview.baseURL}${item.route}`;
      console.log(`Pre-rendering ${item.route} -> ${item.target}...`);
      await page.goto(url, { waitUntil: 'networkidle' });

      // Small tick for React effects (document.title, meta descriptions)
      await wait(300);

      // Use real React server markup rather than a client DOM snapshot. This is
      // required for hydrateRoot's useId and resolved Suspense boundaries.
      await page.waitForFunction(() => typeof window.__GL_SSG_HTML__ === 'string');
      await page.evaluate(() => { const root = document.getElementById('root'); root.innerHTML = window.__GL_SSG_HTML__; root.dataset.ssg = 'true'; window.__GL_SSG_FINALIZE__(); });
      // Inline the exact built route styles: removes the measured render-blocking
      // CSS round trip while preserving all content, responsive rules and noJS SSG.
      for (const link of await page.$$('link[rel="stylesheet"]')) {
        const rawHref = await link.getAttribute('href');
        const url = new URL(rawHref, preview.origin);
        const href = url.pathname;
        if (url.origin !== preview.origin || !url.pathname.startsWith(preview.base)) throw Error('Unexpected external stylesheet');
        const cssPath = path.resolve(distDir, url.pathname.slice(preview.base.length));
        if (!cssPath.startsWith(path.resolve(distDir) + path.sep)) throw Error('Invalid stylesheet path');
        const css = fs.readFileSync(cssPath, 'utf8');
        await link.evaluate((el, { css, href }) => {
          el.setAttribute('href',href);
          const style = document.createElement('style'); style.dataset.ssgStylesheet = href; style.textContent = css;
          el.before(style);
          // All CSS is already present, including noJS and early forms. Keep a
          // disabled link as Vite's dependency marker so it does not download
          // and apply the same stylesheet a second time during hydration.
          el.disabled = true; el.setAttribute('disabled','');el.dataset.ssgInlined='true';
        }, { css, href });
      }
      await page.evaluate(({files,base}) => {
        // Build-only renderer resource hints must never leak into client HTML.
        for (const link of document.querySelectorAll('link[rel="modulepreload"]')) link.remove();
        for (const file of files) { const link = document.createElement('link'); link.rel = 'modulepreload'; link.crossOrigin = 'anonymous'; link.href = base + file; document.head.append(link); }
        document.documentElement.style.removeProperty('--study-header-height');
      }, { files: [...preloadFiles], base: site.base });
      // Install the same canonical controller before the visible SSG body.
      const labels = await page.evaluate(()=>window.__GL_EARLY_LABELS__);
      const connectCopy=await page.evaluate(()=>window.__GL_CONNECT_LABELS__);
      if(!labels)throw Error('Missing canonical early UI labels');
      const criticalScript = `<script data-gl-critical>window.__GL_CONNECT_LABELS__=${JSON.stringify(connectCopy).replace(/</g,'\\u003c')};window.__GL_EARLY_LABELS__=${JSON.stringify(labels).replace(/</g,'\\u003c')};${earlyScript.replace(/<\/script/gi,'<\\/script')}</script>`;
      const html = (await page.content()).replace('</head>',criticalScript+'</head>');
      const targetPath = path.join(distDir, item.target);
      const targetDir = path.dirname(targetPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(targetPath, html, 'utf-8');
      if (item.route === '/') homeHtml = html;
      if(item.target.endsWith('404.html')){const locale=item.target==='404.html'?'ru':item.target.slice(0,2);notFound[locale]={html,root:await page.locator('#root').innerHTML(),labels,connect:connectCopy,head:await page.evaluate(()=>({title:document.title,meta:[...document.head.querySelectorAll('meta[name=description],meta[name=robots],meta[property^="og:"]')].map(e=>({name:e.getAttribute('name'),property:e.getAttribute('property'),content:e.getAttribute('content')})),canonical:document.querySelector('link[rel=canonical]').href}))};}
      const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
      console.log(`✓ Wrote ${item.target} (${sizeKb} KB)`);
    }
    if (!homeHtml) throw Error('Missing home snapshot');
    fs.writeFileSync(shellPath, homeHtml);
    fs.writeFileSync(path.join(distDir,'404.html'),publicRu ? notFound.ru.html : createLocalized404(notFound,site.base));
  } finally {
    try { await browser?.close(); } finally { await preview?.close(); }
  }

  console.log('\n--- Pre-rendering completed successfully ---');
  console.log(`Total pre-rendered static HTML routes: ${routesToPrerender.length}`);
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  const urls=localizedRoutes.filter(r=>r.indexable&&!scriptContent.data.seo.some(s=>s.path===r.semanticPath&&s.locale===r.locale&&s.noindex)).map(r=>`<url><loc>${new URL(pageHref(r.semanticPath,r.locale),site.origin).href}</loc>${approvedLocales.map(locale=>`<xhtml:link rel="alternate" hreflang="${locale}" href="${new URL(pageHref(r.semanticPath,locale),site.origin).href}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${new URL(pageHref(r.semanticPath,'ru'),site.origin).href}"/></url>`).join('');
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.origin}${site.base}sitemap.xml\n`);
  fs.unlinkSync(manifestPath); // Build metadata is not part of the static release.

}

run().catch((err) => {
  console.error('Fatal pre-render error:', err);
  process.exit(1);
});
