import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ghpages from 'gh-pages';
import {validatePublicRelease} from './public-release.js';
import site from './site-config.js';
import { projectRoot } from './local-server.js';

const expectedRemote = 'https://github.com/ArtTechKZ/GlstudyLanding.git';
const git = args => execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }).trim();
if (process.argv.includes('--push')) assert.equal(git(['branch', '--show-current']), 'main', 'Push only after reviewed main fast-forward');
assert.equal(git(['remote', 'get-url', '--all', 'origin']), expectedRemote);
assert.equal(git(['remote', 'get-url', '--push', '--all', 'origin']), expectedRemote);
assert.equal(git(['status', '--porcelain']), '', 'Commit reviewed source changes before preparing a release');

const publicationBranch=process.env.GL_PAGES_BRANCH||'gh-pages';
git(['check-ref-format','--branch',publicationBranch]);
validatePublicRelease(path.join(projectRoot,'dist'));
const dist = path.join(projectRoot, 'dist');
const files = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'Symlinks are not publication files');
    if (entry.isDirectory()) collect(file);
    else files.push(path.relative(dist, file).replaceAll('\\', '/'));
  }
}
collect(dist);
const approvals=JSON.parse(fs.readFileSync(path.join(projectRoot,'src/config/translation-approval.json'),'utf8'));
for(const locale of ['kk','en'])if(files.some(file=>file.startsWith(locale+'/')))assert.equal(approvals[locale],true,`Local ${locale} translations require separate client/native/legal approval before publication`);
const permitted = /^(?:\.nojekyll|(?:index|404)\.html|sitemap\.xml|robots\.txt|licenses\/(?:leaflet|lucide|inter-ofl|bebasneue-ofl)\.txt|fonts\/(?:inter-(?:cyrillic(?:-ext)?|greek(?:-ext)?|latin(?:-ext)?|vietnamese)|bebas-neue-latin(?:-ext)?)\.woff2|(?:learning|ielts|branches|legal|travel\/(?:europe-winter-2027|malaysia))\/index\.html|favicon\.svg|assets\/[\w-]+\.(?:js|css|png|woff2)|brand\/[\w-]+\.svg|images\/home\/[\w-]+\.webp)$/;
for (const file of files) {
  assert.ok(permitted.test(file)||site.routes.some(route=>route.target===file), `Unexpected dist file: ${file}`);
  if (!file.endsWith('.webp')) {
    const content = fs.readFileSync(path.join(dist, file), 'utf8');
    assert.doesNotMatch(content, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b|[A-Z]:[\\/]Users[\\/]/i, `Sensitive dist content: ${file}`);
  }
}
assert.ok(files.includes('.nojekyll') && files.includes('404.html'));
assert.ok(fs.readFileSync(path.join(dist, 'index.html'), 'utf8').includes('/GlstudyLanding/assets/'));

if (!process.argv.includes('--push')) {
  // Continue the already prepared local publication history on repeated builds.
  // The target origin remains checked above; the package never pushes from this cache.
  git(['rev-parse', '--verify', `refs/heads/${publicationBranch}`]);
  const preparationRepo = projectRoot;
  await new Promise((resolve, reject) => ghpages.publish(dist, {
    repo: preparationRepo, branch: publicationBranch, dotfiles: true, push: false,
    history: true, message: `Deploy GL Study from ${git(['rev-parse', '--short', 'HEAD'])}`,
  }, error => error ? reject(error) : resolve()));
  // Import the package's local build branch without switching the source checkout.
  git(['fetch', ghpages.getCacheDir(preparationRepo), `refs/heads/${publicationBranch}:refs/heads/${publicationBranch}`]);
}

const branchFiles = git(['ls-tree', '-r', '--name-only', publicationBranch]).split('\n').sort();
assert.deepEqual(branchFiles, files.sort(), 'Publication branch differs from dist');
for (const file of files) {
  assert.equal(git(['rev-parse', `${publicationBranch}:${file}`]), git(['hash-object', '--no-filters', path.join(dist, file)]), `Stale publication file: ${file}`);
}
console.log(`Verified gh-pages: ${git(['rev-parse', publicationBranch])}; ${files.length} static files`);

if (process.argv.includes('--push')) {
  const heads = git(['ls-remote', '--heads', 'origin', 'main', 'gh-pages']);
  const remoteMain = heads.split('\n').find(line => line.endsWith('refs/heads/main'))?.split(/\s+/)[0];
  assert.ok(remoteMain, 'Published source main is required');
  assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', remoteMain, 'main'], { cwd: projectRoot }).status, 0, 'Remote main diverged; stop and review');
  const remotePages = heads.split('\n').find(line => line.endsWith('refs/heads/gh-pages'))?.split(/\s+/)[0];
  assert.ok(remotePages, 'Existing remote gh-pages history is required');
  assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', remotePages, publicationBranch], { cwd: projectRoot }).status, 0, 'Remote gh-pages diverged; stop and review');
  execFileSync('git', ['push', '--atomic', 'origin', 'main:main', publicationBranch+':gh-pages'], { cwd: projectRoot, stdio: 'inherit' });
} else console.log('Prepared locally only. No push performed.');
