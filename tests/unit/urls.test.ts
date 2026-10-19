import {describe,expect,it,vi,afterEach} from 'vitest';
import {localizedPath,pageHref,parseLocalePath,resolvePage,localizedRoutes} from '../../src/config/locale-routes.js';
import {sitePath} from '../../src/utils/sitePath';
import {safePath} from '../../src/features/privacy-model';
import site from '../../src/config/site.json';
afterEach(()=>vi.unstubAllGlobals());
describe('base, locale and canonical URL functions',()=>{
  it('derives all 63 URLs from the actual 21-route registry',()=>{
    expect(site.routes).toHaveLength(21);expect(localizedRoutes).toHaveLength(63);
    expect(new Set(localizedRoutes.map(r=>r.path)).size).toBe(63);
  });
  it.each(['ru','kk','en'])('builds a canonical homepage without a repeated slash for %s',locale=>{
    expect(pageHref('/',locale)).toBe(site.base+(locale==='ru'?'':locale+'/'));
  });
  it('preserves both query and fragment when changing language',()=>{
    expect(localizedPath('/en/online?city=taraz&utm_source=qa#lead-form','kk')).toBe('/kk/online?city=taraz&utm_source=qa#lead-form');
  });
  it('places the directory slash before query and hash in plain page links',()=>{
    expect(pageHref('/online?city=taraz#lead-form','kk')).toBe(site.base+'kk/online/?city=taraz#lead-form');
  });
  it('parses production base and localized city URLs',()=>{
    expect(parseLocalePath(site.base+'kk/branches/kostanay/?utm_source=qa#contact')).toEqual({locale:'kk',semanticPath:'/branches/kostanay'});
  });
  it.each(['/missing','/branches/missing','/en/programs/missing'])('rejects unknown slug %s',value=>{
    expect(resolvePage(value)).toBeUndefined();expect(safePath(value)).toBe('/404');
  });
  it('keeps legal routes and unapproved translations noindex',()=>{
    for(const route of localizedRoutes)if(['legal','privacyPolicy','personalDataConsent','notFound'].includes(route.seo)||route.locale!=='ru')expect(route.indexable).toBe(false);
  });
  it('uses the current locale for normal anchors and leaves external URLs alone',()=>{
    vi.stubGlobal('location',{pathname:site.base+'kk/online/'});
    expect(sitePath('/#reviews')).toBe('/kk/#reviews'); // Vitest Vite base is /.
    expect(sitePath('https://example.test/path')).toBe('https://example.test/path');
    expect(sitePath('//example.test/path')).toBe('//example.test/path');
  });
});
