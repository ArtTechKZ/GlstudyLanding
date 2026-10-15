import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ghpages from 'gh-pages';
import { projectRoot } from './local-server.js';

const expectedRemote = 'https://github.com/ArtTechKZ/GlstudyLanding.git';
const git = args => execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }).trim();
assert.equal(git(['branch', '--show-current']), 'main', 'Run publication from main');
assert.equal(git(['remote', 'get-url', '--all', 'origin']), expectedRemote);
assert.equal(git(['remote', 'get-url', '--push', '--all', 'origin']), expectedRemote);
assert.equal(git(['status', '--porcelain']), '', 'Commit reviewed source changes before preparing a release');

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
const permitted = /^(?:\.nojekyll|(?:index|404)\.html|(?:learning|ielts|branches|legal|travel\/(?:europe-winter-2027|malaysia))\/index\.html|favicon\.svg|assets\/index-[\w-]+\.(?:js|css)|brand\/[\w-]+\.svg|images\/home\/[\w-]+\.webp)$/;
for (const file of files) {
  assert.match(file, permitted, `Unexpected dist file: ${file}`);
  if (!file.endsWith('.webp')) {
    const content = fs.readFileSync(path.join(dist, file), 'utf8');
    assert.doesNotMatch(content, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b|[A-Z]:[\\/]Users[\\/]/i, `Sensitive dist content: ${file}`);
  }
}
assert.ok(files.includes('.nojekyll') && files.includes('404.html'));
assert.ok(fs.readFileSync(path.join(dist, 'index.html'), 'utf8').includes('/GlstudyLanding/assets/'));

if (!process.argv.includes('--push')) {
  await new Promise((resolve, reject) => ghpages.publish(dist, {
    repo: expectedRemote, branch: 'gh-pages', dotfiles: true, push: false,
    history: true, message: `Deploy GL Study from ${git(['rev-parse', '--short', 'HEAD'])}`,
  }, error => error ? reject(error) : resolve()));
  // Import the package's local build branch without switching the source checkout.
  git(['fetch', ghpages.getCacheDir(expectedRemote), 'refs/heads/gh-pages:refs/heads/gh-pages']);
}

const branchFiles = git(['ls-tree', '-r', '--name-only', 'gh-pages']).split('\n').sort();
assert.deepEqual(branchFiles, files.sort(), 'Publication branch differs from dist');
for (const file of files) {
  assert.equal(git(['rev-parse', `gh-pages:${file}`]), git(['hash-object', '--no-filters', path.join(dist, file)]), `Stale publication file: ${file}`);
}
console.log(`Verified gh-pages: ${git(['rev-parse', 'gh-pages'])}; ${files.length} static files`);

if (process.argv.includes('--push')) {
  const heads = git(['ls-remote', '--heads', 'origin', 'main', 'gh-pages']);
  const remoteMain = heads.split('\n').find(line => line.endsWith('refs/heads/main'))?.split(/\s+/)[0];
  assert.ok(remoteMain, 'Published source main is required');
  assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', remoteMain, 'main'], { cwd: projectRoot }).status, 0, 'Remote main diverged; stop and review');
  execFileSync('git', ['push', '--atomic', 'origin', 'main:main', 'gh-pages:gh-pages'], { cwd: projectRoot, stdio: 'inherit' });
} else console.log('Prepared locally only. No push performed.');
