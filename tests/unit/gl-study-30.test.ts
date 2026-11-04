import {describe,expect,it} from 'vitest';
import snapshot from '../../src/data/content-snapshot.json';
import {validateSnapshot} from '../../cms/content-contract.mjs';
import {ALL_CITIES,DEMO_CITIES,ADDITIONAL_SERVICES,ADMISSION_PACKAGES} from '../../src/data/demo';
import {whatsappHref,whatsappMessage,WHATSAPP_RECIPIENT} from '../../src/features/whatsapp';
import {phoneHref,instagramUrl,CONTACTS} from '../../src/data/contacts';
import {COMPANY_REQUISITES} from '../../src/data/requisites';
import {PRIVACY_POLICY,PUBLIC_OFFER} from '../../src/data/legal-documents';

const branches=ALL_CITIES.flatMap(c=>c.branches);
describe('GL-STUDY-30 branch table',()=>{
  it('contains all 16 entries with the four statuses and validates as a snapshot',()=>{
    expect(validateSnapshot(snapshot)).toBe(snapshot);
    expect(branches).toHaveLength(16);
    const count=(status:string)=>branches.filter(b=>b.status===status).length;
    expect([count('active'),count('online'),count('online_launch'),count('repair')]).toEqual([10,1,4,1]);
  });
  it('keeps the special cases exactly as instructed',()=>{
    const byId=(id:string)=>branches.find(b=>b.id===id)!;
    expect(byId('almaty-nazarbayev').status).toBe('online');expect(byId('almaty-nazarbayev').address).toBeUndefined();
    expect(byId('ekibastuz').status).toBe('repair');
    for(const id of ['ust-kamenogorsk-online','kokshetau-online','petropavlovsk-online','almaty-online'])expect(byId(id).status).toBe('online_launch');
    expect(byId('almaty-masanchi').address).toBe('Масанчи 78, БЦ Алма, офис 400');
  });
  it('publishes no staff counts, staff names, map links or coordinates and no assumed WhatsApp',()=>{
    const text=JSON.stringify(branches);
    expect(text).not.toMatch(/Альбина|2gis|сотрудник|staff/i);
    for(const b of branches){expect(b.whatsapp).toBeUndefined();expect(b.lat).toBeUndefined();expect(b.lng).toBeUndefined();expect(b.programs).toBeUndefined()}
  });
  it('keeps every branch phone of the live table (D5 Plaza, D12 Taraz, D13 Ekibastuz, D14 Ust-Kamenogorsk included)',()=>{
    // Sheet "Лист1", export?format=csv (2026-11-04). The gviz endpoint types column D as a number and silently drops the text cells D5/D12/D13.
    const byId=(id:string)=>branches.find(b=>b.id===id)!;
    const expected:Record<string,string>={'kostanay-plaza':'tel:+77078240000','taraz-konaev':'tel:+77758391150','ekibastuz':'tel:+77001323048','ust-kamenogorsk-online':'tel:+77001323048'};
    for(const[id,href]of Object.entries(expected))expect(phoneHref(byId(id).phone!)).toBe(href);
    // Two branches may share one number (Ekibastuz and Ust-Kamenogorsk): that is the table, not an error.
    expect(byId('ekibastuz').phone).toBe(byId('ust-kamenogorsk-online').phone);
    for(const b of branches)expect(phoneHref(b.phone!)).toMatch(/^tel:\+7\d{10}$/);
    expect(branches.filter(b=>b.phone)).toHaveLength(16);
    expect(byId('ekibastuz').status).toBe('repair');
  });
  it('does not give every branch the same offerings',()=>{
    expect(new Set(branches.map(b=>(b.offerings??[]).join('|'))).size).toBeGreaterThan(4);
    expect(branches.find(b=>b.id==='kostanay-center')!.offerings).toContain('Экзаменационный центр IELTS');
    expect(branches.find(b=>b.id==='astana-rysqulov')!.offerings).toEqual(['Курсы английского языка','Подготовка к IELTS']);
  });
  it('keeps cities without a page out of the selector list',()=>{
    expect(ALL_CITIES).toHaveLength(9);expect(DEMO_CITIES.map(c=>c.id)).toEqual(['almaty','astana','kostanay','rudny','taraz']);
  });
});
describe('GL-STUDY-30 phone helpers',()=>{
  it.each([['8 (705) 558-92-19','tel:+77055589219'],['+7 707 310 68 22','tel:+77073106822'],['7 775 839 1150','tel:+77758391150'],['87001323048','tel:+77001323048']])('normalises %s',(input,expected)=>expect(phoneHref(input)).toBe(expected));
  it('links per-branch Instagram handles',()=>expect(instagramUrl('gl_study_kst')).toBe('https://www.instagram.com/gl_study_kst/'));
});
describe('GL-STUDY-30 WhatsApp helper',()=>{
  it('uses the client-prescribed texts and the main recipient',()=>{
    expect(WHATSAPP_RECIPIENT).toBe('77055589219');
    expect(whatsappMessage('program','Менторство')).toBe('Здравствуйте, пишу с сайта, хотел подробнее узнать про программу "Менторство"');
    expect(whatsappMessage('service','Помощь с документами')).toBe('Здравствуйте, пишу с сайта, мне нужна консультация по услуге "Помощь с документами"');
  });
  it('encodes the text for the URL and round-trips it',()=>{
    const href=whatsappHref('program','Английский для детей & "IELTS" 50%');const url=new URL(href);
    expect(url.origin+url.pathname).toBe('https://wa.me/77055589219');
    expect(href).not.toMatch(/ |"/);expect(url.searchParams.get('text')).toBe(whatsappMessage('program','Английский для детей & "IELTS" 50%'));
  });
  it('rejects a malformed recipient',()=>expect(()=>whatsappHref('general','','+7 705')).toThrow());
});
describe('GL-STUDY-30 services, packages and legal data',()=>{
  it('has three packages and five services with no prices',()=>{
    expect(ADMISSION_PACKAGES.map(p=>p.title)).toEqual(['Полное сопровождение','Поступление в ТОП университет','Менторство']);
    expect(ADDITIONAL_SERVICES.map(s=>s.title)).toEqual(['Консультация с профориентологом','Консультация с экспертом по поступлению','Подбор университетов и стипендий','Помощь с документами','Подготовка к Foundation Programme']);
    for(const p of ADMISSION_PACKAGES){expect(p.duration).toBe('24 месяца');expect(p.features).toHaveLength(11)}
    expect(JSON.stringify([ADMISSION_PACKAGES,ADDITIONAL_SERVICES])).not.toMatch(/99\s?000|₸|тенге/);
  });
  it('carries the client contacts and legal address unchanged',()=>{
    expect(CONTACTS.whatsappNumber).toBe('77055589219');expect(CONTACTS.internationalPhoneHref).toBe('tel:+77073106822');
    expect(COMPANY_REQUISITES.bin).toBe('260640037588');
    expect(COMPANY_REQUISITES.legalAddress).toBe('Костанайская область, город Костанай, проспект Нұрсұлтан Назарбаев, дом 195, кв. 71');
  });
  it('holds the full supplied policy (7 sections) and offer (9 sections)',()=>{
    expect(PRIVACY_POLICY.sections).toHaveLength(7);expect(PUBLIC_OFFER.sections).toHaveLength(9);
  });
});
