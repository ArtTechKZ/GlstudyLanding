import {isWithdrawnMedia} from '../cms/media-policy.mjs';
import site from '../src/config/site.json' with {type:'json'};
import {localizedRoutes} from '../src/config/locale-routes.js';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

export function validatePublicRelease(directory = process.env.GL_DIST_DIR??'dist') {
  const approvals = JSON.parse(fs.readFileSync('src/config/translation-approval.json', 'utf8'));
  assert.equal(approvals.ru, true, 'Russian publication approval is required');
  const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    assert.ok(!entry.isSymbolicLink(), 'No publication symlinks');
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
  const files = walk(directory).map(file => path.relative(directory,file).replaceAll('\\','/'));
  assert.equal(files.filter(file=>file.endsWith('.html')).length,site.routes.length+1,'RU-only: registered pages and technical 404');
  assert.ok(files.includes('.nojekyll'));
  for(const file of files){
    assert.ok(!isWithdrawnMedia({src:'/'+file}),'Withdrawn media file in release: '+file);
    assert.ok(file==='.nojekyll'||/\.(?:html|js|css|svg|webp|avif|png|ico|mp4|vtt|woff2|txt|xml|json)$/.test(file),'Static release file type: '+file);
    assert.doesNotMatch(file,/(?:^|\/)(?:cms|server|uploads|backups|fixtures|\.git|originals|logs)(?:\/|$)|\.(?:sqlite|db|mov|jpe?g|docx?|zip|env|pem|log|csv|xlsx?)$/i,'Private/source file in release: '+file);
    assert.doesNotMatch(file,/^(?:kk|en)\/|(?:^|\/)(?:src|docs|scripts|node_modules|\.qa|\.env[^/]*)(?:\/|$)|\.map$/);
    if(!/\.(?:html|js|css|xml|txt|json)$/.test(file))continue;
    const text=fs.readFileSync(path.join(directory,file),'utf8');
    assert.doesNotMatch(text,/CMS24 (?:SYNTHETIC|TRIGGER|NATIVE|pagination|DRAFT)|Synthetic Test|70000000000|gl-local-test-24/,'Synthetic integration data in release: '+file);
    assert.doesNotMatch(text,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b|[A-Z]:[\\/]Users[\\/]/i);
    // Real catalog sentinels catch accidentally emitted, unrequested chunks too.
    assert.doesNotMatch(text,/Your child will learn|Құқықтық құжаттар|Legal documents are currently available only in Russian|Мәтін уақытша қолжетімсіз|Text temporarily unavailable/,'Unapproved catalog content: '+file);
    if(file.endsWith('.html')){
      assert.match(text,/<html[^>]*lang="ru"/);
      assert.doesNotMatch(text,/data-locale="(?:kk|en)"|hreflang="(?:kk|en)"|data-connect-open|gl-404-(?:kk|en)/);
    }
  }
  const sitemap=fs.readFileSync(path.join(directory,'sitemap.xml'),'utf8');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,localizedRoutes.filter(r=>r.locale==='ru'&&r.indexable).length);
  assert.doesNotMatch(sitemap,/\/GlstudyLanding\/(?:kk|en)\/|\/legal\//);
  return files;
}
