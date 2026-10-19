// @vitest-environment happy-dom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {ATTRIBUTION_KEY,CONSENT_KEY,createConsentStore,parseChoices,readChoices,type Choices} from '../../src/features/consent-model';
import {captureAttribution,persistAttribution,restoreAttribution} from '../../src/features/privacy-model';
const now=Date.UTC(2026,9,19),valid:Choices={version:1,necessary:true,analytics:true,advertising:true,savedAt:now-1000};
beforeEach(()=>{vi.spyOn(Date,'now').mockReturnValue(now);localStorage.clear();sessionStorage.clear()});
afterEach(()=>vi.unstubAllGlobals());
describe('consent schema, expiry and real storage state',()=>{
  it('starts without optional permission',()=>{expect(readChoices()).toBeNull();expect(createConsentStore().getSnapshot()).toBeNull()});
  it('accepts version 1 within 180 days',()=>expect(parseChoices(JSON.stringify(valid))).toEqual(valid));
  it.each([null,'invalid','{}','[]',JSON.stringify({...valid,version:2}),JSON.stringify({...valid,necessary:false}),JSON.stringify({...valid,analytics:'true'}),JSON.stringify({...valid,advertising:0}),JSON.stringify({...valid,savedAt:now+1}),JSON.stringify({...valid,savedAt:now-180*86400000})])('rejects malformed, expired or future permission %s',value=>expect(parseChoices(value)).toBeNull());
  it('saves categories independently, notifies once and revokes attribution',()=>{
    const store=createConsentStore(),listener=vi.fn(),unsubscribe=store.subscribe(listener);
    sessionStorage.setItem(ATTRIBUTION_KEY,'synthetic');store.save(true,false);
    expect(store.getSnapshot()).toMatchObject({necessary:true,analytics:true,advertising:false});
    expect(sessionStorage.getItem(ATTRIBUTION_KEY)).toBeNull();expect(listener).toHaveBeenCalledTimes(1);
    store.save(false,true);expect(store.getSnapshot()).toMatchObject({analytics:false,advertising:true});
    store.save(false,false);expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!)).toMatchObject({analytics:false,advertising:false});
    unsubscribe();store.save(false,false);expect(listener).toHaveBeenCalledTimes(3);
  });
  it('honours a cross-tab withdrawal without writing it back',()=>{
    const store=createConsentStore();store.save(true,true);sessionStorage.setItem(ATTRIBUTION_KEY,'synthetic');
    localStorage.removeItem(CONSENT_KEY);const write=vi.spyOn(localStorage,'setItem');
    window.dispatchEvent(new StorageEvent('storage',{key:CONSENT_KEY}));
    expect(store.getSnapshot()).toBeNull();expect(sessionStorage.getItem(ATTRIBUTION_KEY)).toBeNull();expect(write).not.toHaveBeenCalled();
  });
  it('works in memory with inaccessible local/session storage',()=>{
    const unavailable={getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){throw Error('denied')}};
    vi.stubGlobal('localStorage',unavailable);vi.stubGlobal('sessionStorage',unavailable);
    const store=createConsentStore();expect(store.getSnapshot()).toBeNull();expect(()=>store.save(false,false)).not.toThrow();
    expect(store.getSnapshot()).toMatchObject({necessary:true,analytics:false,advertising:false});
  });
  it('SSG snapshots never restore browser consent',()=>{localStorage.setItem(CONSENT_KEY,JSON.stringify(valid));expect(createConsentStore(true).getSnapshot()).toBeNull()});
});
describe('UTM allowlist and consent-controlled persistence',()=>{
  it('keeps only campaign keys, strips the referrer path/query and unknown landing paths',()=>{
    const result=captureAttribution('?utm_source=qa&utm_medium=cpc&name=Synthetic&phone=70000000000&email=synthetic@example.test&token=secret','/en/online','https://source.example/secret?email=hidden');
    expect(result).toEqual({landing:'/online',utm_source:'qa',utm_medium:'cpc',referrer:'https://source.example'});
    expect(captureAttribution('?utm_source=qa','/unknown')).toEqual({landing:'/404',utm_source:'qa'});
  });
  it.each(['mail@example.test','70000000000','7 000 000 00 00','bearer-private','token-secret','a'.repeat(121),'   '])('rejects unsafe or excessive campaign value %j',value=>{
    expect(captureAttribution('?'+new URLSearchParams({utm_source:value}),'/').utm_source).toBeUndefined();
  });
  it('accepts the exact 120-character limit and trims campaign labels',()=>{
    expect(captureAttribution('?utm_campaign='+'a'.repeat(120),'/').utm_campaign).toHaveLength(120);
    expect(captureAttribution('?utm_source=%20campaign%20','/').utm_source).toBe('campaign');
  });
  it('persists only with advertising consent and clears on withdrawal',()=>{
    const value=captureAttribution('?utm_source=qa','/online');
    persistAttribution(value,null,sessionStorage);expect(sessionStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
    persistAttribution(value,{...valid,advertising:false},sessionStorage);expect(sessionStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
    persistAttribution(value,valid,sessionStorage);expect(JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)!)).toEqual(value);
    persistAttribution(value,{...valid,advertising:false},sessionStorage);expect(sessionStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
  });
  it('restores sanitized campaign state, lets incoming keys win, and survives corrupt/denied storage',()=>{
    const incoming=captureAttribution('?utm_medium=cpc','/online');
    sessionStorage.setItem(ATTRIBUTION_KEY,JSON.stringify({landing:'/learning',utm_source:'old',name:'Synthetic',utm_term:'70000000000'}));
    expect(restoreAttribution(incoming,valid,sessionStorage)).toEqual({landing:'/learning',utm_source:'old',utm_medium:'cpc'});
    expect(restoreAttribution(incoming,{...valid,advertising:false},sessionStorage)).toBeUndefined();
    sessionStorage.setItem(ATTRIBUTION_KEY,'broken');expect(restoreAttribution(incoming,valid,sessionStorage)).toEqual(incoming);
    const denied={getItem(){throw Error('denied')}};expect(restoreAttribution(incoming,valid,denied)).toEqual(incoming);
    expect(()=>persistAttribution(incoming,valid,{setItem(){throw Error('denied')},removeItem(){throw Error('denied')}})).not.toThrow();
  });
});
