import {describe,expect,it} from 'vitest';
import {DEMO_CITIES,DEMO_PROGRAMS,TRAVEL_PROGRAMS,TRIAL_PROCESS} from '../../src/data/demo';
import {COMPANY,PLANNED_LANGUAGES,SUMMER_DESTINATIONS} from '../../src/data/company';
import {createTranslator} from '../../src/i18n/core';
import {getCatalog,loadCatalog} from '../../src/i18n/catalogs';
describe('confirmed brief data contracts, not source-file searches',()=>{
  it('keeps the five cities without fabricating branch or IELTS venue records',()=>{
    expect(new Set(DEMO_CITIES.map(c=>c.id))).toEqual(new Set(['kostanay','rudny','taraz','astana','almaty']));
    expect(DEMO_CITIES.flatMap(c=>c.branches)).toEqual([]);
  });
  it('publishes no price on any active programme or trip',()=>{
    for(const p of [...DEMO_PROGRAMS,...TRAVEL_PROGRAMS])expect(p.price).toBeUndefined();
  });
  it('uses the later confirmed 10+ and winter 2027 dates instead of the older TZ ages',()=>{
    const [prague,malaysia]=TRAVEL_PROGRAMS;
    expect([prague.dateStart,prague.dateEnd,prague.ageMin,prague.ageMax]).toEqual(['2027-01-02','2027-01-12',10,undefined]);
    expect([malaysia.dateStart,malaysia.dateEnd,malaysia.ageMin,malaysia.ageMax]).toEqual(['2027-01-03','2027-01-17',10,undefined]);
  });
  it('keeps main phone and international WhatsApp distinct with no course WhatsApp assumption',()=>{
    expect(COMPANY.phoneHref).toBe('tel:+77055589219');expect(COMPANY.internationalWhatsApp).toBe('https://wa.me/77073106822');
    expect(COMPANY.instagram).toBe('https://www.instagram.com/glstudy.kz/');expect(COMPANY.founded).toBe(2000);
    expect(PLANNED_LANGUAGES).toHaveLength(4);expect(SUMMER_DESTINATIONS).toHaveLength(5);
  });
  it.each([
    ['ru','Расписание подбирается индивидуально с менеджером. Групповые занятия — 2–3 раза в неделю.'],
    ['kk','Сабақ кестесі менеджермен жеке келісіледі. Топтық сабақтар аптасына 2–3 рет өтеді.'],
    ['en','Your lesson schedule is arranged individually with a manager. Group lessons take place 2–3 times a week.'],
  ] as const)('renders the confirmed flexible schedule through the real translator in %s',async(locale,expected)=>{
    await loadCatalog(locale);
    const t=createTranslator(getCatalog(locale),locale);expect(t('Full.schedulePending')).toBe(expected);
    expect(t('Full.level')).toMatch(/4–6/);expect(t('Full.onlineDesc')).toMatch(/6/);expect(t('Full.offlineDesc')).toMatch(/10/);
    expect(t('Full.prepA')).toMatch(/36/);expect(t('Full.prepA')).toMatch(/2–6/);
  });
  it('retains the confirmed trial conditions',()=>{
    expect(TRIAL_PROCESS).toContain('60 или 90');expect(TRIAL_PROCESS).toContain('диагностика');
  });
});
