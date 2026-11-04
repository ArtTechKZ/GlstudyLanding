// Build-profile guard (GL-STUDY-31).
// The public release profile is ru-only (see scripts/build-public.js / public-release.js): /kk and /en are not built.
// Checks that exercise KK/EN pages are therefore NOT APPLICABLE to that build. They must not be counted as passed:
// this prints an explicit NOT APPLICABLE line (never PASS), records it, and stops without running the checks.
// To run them for real, build a local multi-locale profile first:  npm run build:ssg   (then rebuild with build:public).
import fs from 'node:fs';

export function hasLocalizedBuild(directory = 'dist') {
  return ['kk', 'en'].every(locale => fs.existsSync(`${directory}/${locale}/index.html`));
}

export function requireLocalizedBuild(name, directory = 'dist') {
  if (hasLocalizedBuild(directory)) return;
  const message = `NOT APPLICABLE ${name}: ${directory}/ is the public-ru profile without /kk and /en. Not counted as passed. Run it against a local multi-locale build (npm run build:ssg).`;
  console.log(message);
  fs.mkdirSync('.qa/study31', {recursive: true});
  fs.writeFileSync(`.qa/study31/${name.replace(/[^a-z0-9-]/gi, '_')}.not-applicable.json`, JSON.stringify({status: 'NOT_APPLICABLE', check: name, directory, reason: message}, null, 2));
  process.exit(0);
}
