// @vitest-environment happy-dom
import {afterEach,describe,expect,it,vi} from 'vitest';
import {applyPageSeo} from '../../src/utils/pageSeo';
import {installConnect} from '../../src/features/connect';
import {COMPANY} from '../../src/data/company';
import site from '../../src/config/site.json';
import {loadCatalog} from '../../src/i18n/catalogs';
afterEach(()=>{window.dispatchEvent(new Event('pagehide'));document.body.innerHTML='';vi.unstubAllGlobals()});
describe('SEO DOM effects',()=>{
  it.each(['ru','kk','en'] as const)('writes a self canonical and correct robots in %s',async locale=>{
    await loadCatalog(locale);
    const doc=document.implementation.createHTMLDocument(),prefix=locale==='ru'?'':'/'+locale;
    applyPageSeo(prefix+'/online',undefined,doc);
    expect(doc.documentElement.lang).toBe(locale);
    expect(doc.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(site.origin+site.base+(locale==='ru'?'':locale+'/')+'online/');
    expect(doc.querySelector('meta[name=robots]')?.getAttribute('content')).toBe(locale==='ru'?'index,follow':'noindex,follow');
    expect(doc.querySelectorAll('link[rel=canonical]')).toHaveLength(1);
  });
  it('keeps legal and unknown pages noindex and updates rather than duplicates metadata',()=>{
    const doc=document.implementation.createHTMLDocument();
    for(const path of ['/privacy-policy','/personal-data-consent','/en/missing']){
      applyPageSeo(path,undefined,doc);expect(doc.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('noindex,follow');
      expect(doc.querySelectorAll('link[rel=canonical]')).toHaveLength(1);expect(doc.querySelectorAll('meta[name=description]')).toHaveLength(1);
    }
    expect(doc.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(site.origin+site.base+'en/404.html');
  });
});
describe('disabled Connect installation and blocked entry point',()=>{
  it('creates only a local fallback dialog, with no fetch, XHR, iframe or remote script',()=>{
    const network=vi.fn(()=>{throw Error('unexpected external request')});vi.stubGlobal('fetch',network);
    const xhr=vi.spyOn(XMLHttpRequest.prototype,'open');
    window.__GL_CONNECT_LABELS__={title:'Chat unavailable',close:'Close',text:'Use the confirmed contacts.'};
    const trigger=document.createElement('button');trigger.dataset.connectOpen='';document.body.append(trigger);
    window.__GL_SSG__=true;installConnect();trigger.click();expect(document.querySelector('dialog')).toBeNull();
    window.__GL_SSG__=false;delete window.__GL_CONNECT__;installConnect();trigger.click();
    const dialog=document.querySelector('dialog')!;expect(dialog.dataset.connectStatus).toBe('blocked');expect(dialog.open).toBe(true);
    expect(dialog.querySelector('a[href^="tel:"]')?.getAttribute('href')).toBe(COMPANY.phoneHref);
    expect(dialog.querySelector('a[href*="wa.me"]')?.getAttribute('href')).toBe(COMPANY.internationalWhatsApp);
    expect(document.querySelectorAll('script,iframe')).toHaveLength(0);expect(network).not.toHaveBeenCalled();expect(xhr).not.toHaveBeenCalled();
    dialog.querySelector('button')!.click();expect(document.querySelector('dialog')).toBeNull();
  });
});
