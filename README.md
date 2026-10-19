# GL Study — RU DEMO

Public preview for review: https://arttechkz.github.io/GlstudyLanding/

This is a Russian-only demonstration, not a commercial launch. Forms validate locally and clearly report that data was not sent. No lead API, Directus, SQLite, CRM or Connect is started on GitHub Pages. Phone and international WhatsApp links do not automatically transfer form fields.

## Build the checked public profile

Use Node.js 24.14.1 and the committed npm lockfile:

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run build:public
npm run test:public
```

The public build reads the committed `src/data/content-snapshot.json` and projects RU. The checked projection is retained in `cms/snapshots/public-ru-study24.json`. No private `.qa` inputs, local CMS, admin token or real credentials are required. Checks create ignored local evidence. `dist` is the output, not source; `/GlstudyLanding/` is the public base. `npm run serve:ssg -- --gzip` serves the current static output with true 404 responses. `npm run dev` starts local development; `npm run build:ssg` includes the local RU/KK/EN preview and must not be substituted for the public release.

## Content and publication

RU publication approval remains true, KK/EN false. KK/EN source dictionaries remain in the repository, while public HTML, client catalogs, navigation and sitemap use RU only. Legal pages are clearly drafts and retain noindex. Pre24 brandbook imagery, licenses and provenance are preserved; withdrawn stage24 media is excluded; see [ASSET_NOTICES.md](ASSET_NOTICES.md).

GL-STUDY-27 improves the review experience using GL_Study_Brief(4): distinct course descriptions, clear general and international contacts, flexible lesson scheduling, and customer-facing consultation copy. Empty branch selectors, maps and travel galleries are hidden until real data exists. The reviews invitation links explicitly to Instagram; published reviews are still pending. Original GL-STUDY-26 imagery and its withdrawal protections are preserved.

The checked RU DEMO contains 111 files / 22 HTML, aggregate manifest SHA-256 `901c24d8c283348d524463c76a1602aada4ed4af606cb7a20572cfb1cc77cf13`, content revision `989d42c7114100a19fce87b609a17f1d9c5b6d5e0bce6187aa95b3d36405980a`. Per-file records are in [release-manifest.json](release-manifest.json). The aggregate hashes JSON.stringify(records), not the raw manifest JSON file. CMS export and snapshot/release validation apply `cms/media-policy.json`, so old approved records cannot replay the withdrawn media. Private originals and prior Git history are retained.

Validation: lint, typecheck, 191 unit tests, public build, public/browser/SEO checks all pass. Additional focused checks cover 9 routes at 1440/390/320 px and 2 DEMO form submissions without POST or withdrawn media requests. These are desktop browser viewports, not physical Android acceptance.

Browser commands default to Microsoft Edge. Set `GL_BROWSER_EXECUTABLE_PATH` to a local Chrome/Chromium binary when Edge is unavailable; alternatively set `GL_BROWSER_CHANNEL=chromium` for Playwright's bundled Chromium. Use `GL_RELEASE_PROFILE=public-ru` for browser/SEO validation of the public output. Stage 27 used Node.js 24.19.0 and Chrome 155 on Linux.

The existing `pages:*` helper predates the company-media allowlist; GL-STUDY-25 prepares separate fast-forward release worktrees and verifies every Git blob explicitly. Never publish the full local build or use force/orphan history.

## Open launch gates

Company legal/CRM/provider configuration, Directus editor permissions, native Android acceptance and homepage LCP remain open. Local Lighthouse 13.5 mobile diagnostic: homepage gzip LCP about 2.86 s (above the 2.5 s target); raw delivery also exceeds target. Desktop/mobile-viewport checks are not physical Android proof. This repository does not claim real company delivery or full production readiness.

Server/CMS directories contain source and non-working examples only. Runtime databases, credentials, receipts, backups, private evidence, original company archives and local correspondence are excluded. Real services require separate approved hosting, configuration and tests.

The LF HTML entry deliberately retains one blank line before the inert Connect configuration. This preserves the accepted SSG serialization after Git newline normalization; it does not load Connect or change rendered content.
