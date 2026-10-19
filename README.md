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

RU publication approval remains true, KK/EN false. KK/EN source dictionaries remain in the repository, while public HTML, client catalogs, navigation and sitemap use RU only. Legal pages are clearly drafts and retain noindex. Confirmed company media, full image framing, licenses and provenance are preserved; see [ASSET_NOTICES.md](ASSET_NOTICES.md).

The accepted GL-STUDY-24 static candidate has 151 files / 22 HTML, aggregate manifest SHA-256 `4f268b2cc53e6d6e9f67a38edfcd3b1bdc8aec89bd57b71726dc341a5b4e17f0`, content revision `2a1af762fd6d9b44d7f5220f47b37d83bf225f67d96162b3da052f708d8f9810`. The full per-file manifest is [release-manifest.json](release-manifest.json). Its aggregate is the hash of artifact records; it is not the raw JSON-file hash. GL-STUDY-25 verifies the release tree against that candidate before ordinary atomic main/gh-pages push.

The existing `pages:*` helper predates the company-media allowlist; GL-STUDY-25 prepares separate fast-forward release worktrees and verifies every Git blob explicitly. Never publish the full local build or use force/orphan history.

## Open launch gates

Company legal/CRM/provider configuration, Directus editor permissions, native Android acceptance and homepage LCP remain open. Local Lighthouse 13.5 mobile diagnostic: homepage gzip LCP about 2.86 s (above the 2.5 s target); raw delivery also exceeds target. Desktop/mobile-viewport checks are not physical Android proof. This repository does not claim real company delivery or full production readiness.

Server/CMS directories contain source and non-working examples only. Runtime databases, credentials, receipts, backups, private evidence, original company archives and local correspondence are excluded. Real services require separate approved hosting, configuration and tests.

The LF HTML entry deliberately retains one blank line before the inert Connect configuration. This preserves the accepted SSG serialization after Git newline normalization; it does not load Connect or change rendered content.
