import {describe, expect, it} from 'vitest';
import {EMPTY_DRAFT, normalizePhone, validateLead, leadFieldLabel} from '../../src/features/lead-model';
import {createTranslator} from '../../src/i18n/core';
import {getCatalog,loadCatalog} from '../../src/i18n/catalogs';

const valid = {...EMPTY_DRAFT, name: 'Synthetic Test', phone: '+70000000000', consent: true,
  ageGroup: 'adults', program: 'english-adults', format: 'offline', channel: 'phone'};
describe('normalization of the active +7 / local 8 telephone format', () => {
  it.each(['+7 (000) 000-00-00', '70000000000', '8 000 000 00 00', ' +70000000000 '])('normalizes %s', value => {
    expect(normalizePhone(value)).toBe('+70000000000');
  });
  it.each(['', ' ', 'garbage', '7000000000', '700000000000', '+10000000000', '++70000000000', '700+00000000', '+80000000000', '+70000000000 ext 2', '7\n0000000000', ' '.repeat(31)+'70000000000'])('rejects %j', value => {
    expect(normalizePhone(value)).toBe('');
  });
});
describe('real lead validation', () => {
  it.each([['Имя *',true,'Имя *'],['Phone',true,'Phone *'],['Имя * *',true,'Имя *'],['Comment',false,'Comment']] as const)('shows one required marker for %s', (label,required,expected)=>expect(leadFieldLabel(label,required)).toBe(expected));
  it('accepts a complete main form', () => expect(validateLead(valid, 'main')).toEqual({}));
  it('never treats unchecked consent or a whitespace name as valid', () => {
    expect(validateLead({...valid, name: ' \t ', consent: false}, 'main')).toHaveProperty('consent');
    expect(validateLead({...valid, name: ' \t '}, 'main')).toHaveProperty('name');
    expect(EMPTY_DRAFT.consent).toBe(false);
  });
  it.each(['name', 'comment', 'preferredArea'] as const)('enforces the %s length boundary', key => {
    const limit=key==='comment'?1000:100;
    expect(validateLead({...valid,[key]:'a'.repeat(limit)},'main')[key]).toBeUndefined();
    expect(validateLead({...valid,[key]:'a'.repeat(limit+1)},'main')[key]).toBeTruthy();
  });
  it('requires all main form selectors rather than accepting empty routing fields', () => {
    const errors=validateLead({...valid,ageGroup:'',program:'',format:'',channel:''},'main');
    for(const field of ['ageGroup','program','format','channel'])expect(errors).toHaveProperty(field);
  });
  it.each(['ageGroup','program','format','channel'] as const)('rejects an unknown %s option', field => {
    expect(validateLead({...valid,[field]:'untrusted-option'},'main')[field]).toBeTruthy();
  });
  const ielts={...valid,program:'ielts-prep',currentLevel:'B2',targetScore:'6.5',examDate:'2027-01-02'};
  it('requires IELTS level, score and a real calendar date', () => {
    const e=validateLead({...valid,currentLevel:'',targetScore:'',examDate:''},'ielts');
    for(const key of ['currentLevel','targetScore','examDate'])expect(e).toHaveProperty(key);
    expect(validateLead(ielts,'ielts')).toEqual({});
  });
  it.each([' ', 'B9', 'x'.repeat(101)])('rejects invalid IELTS level %j', currentLevel => {
    expect(validateLead({...ielts,currentLevel},'ielts').currentLevel).toBeTruthy();
  });
  it.each(['9.5','10','-1','6.2','NaN'])('rejects invalid IELTS score %s', targetScore => {
    expect(validateLead({...ielts,targetScore},'ielts').targetScore).toBeTruthy();
  });
  it.each(['2027-02-29','2027-04-31','2027-13-01','01/02/2027'])('rejects non-calendar date %s', examDate => {
    expect(validateLead({...ielts,examDate},'ielts').examDate).toBeTruthy();
  });
  const travel={...valid,parentName:'Synthetic Parent',childAge:'10',travelProgram:'malaysia'};
  it('requires travel parent, child age and a published trip', () => {
    expect(validateLead(travel,'travel')).toEqual({});
    const e=validateLead({...travel,parentName:' ',childAge:'',travelProgram:'missing'},'travel');
    for(const key of ['parentName','childAge','travelProgram'])expect(e).toHaveProperty(key);
  });
  it.each([['9',false],['10',true],['19',true],['99',true],['100',false],['10.5',false],['-1',false]])('applies the confirmed 10+ boundary: %s', (childAge,accepted) => {
    expect(!validateLead({...travel,childAge:String(childAge)},'travel').childAge).toBe(accepted);
  });
  it.each(['ru','kk','en'] as const)('produces translated errors in %s', async locale => {
    await loadCatalog(locale);
    const t=createTranslator(getCatalog(locale),locale);
    expect(validateLead({...valid,consent:false},'main',t).consent).toBe(t('lead-model.neobkhodimo.dat.soglasie'));
  });
});
