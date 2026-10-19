import {describe,expect,it} from 'vitest';
import {leadRouting} from '../../src/features/lead-routing';
import {COMPANY} from '../../src/data/company';
const context={type:'main' as const,ctaId:'synthetic',page:'/offline',program:'english-adults'};
describe('delivery routing metadata',()=>{
  it('preserves selected city, branch, program context and preferred district',()=>{
    expect(leadRouting(context,'kostanay','synthetic-branch','offline',' Centre ')).toEqual({kind:'course',assignment:'branch-manager',cityId:'kostanay',branchId:'synthetic-branch',preferredArea:'Centre',branchSelection:'selected'});
  });
  it('leaves an unknown branch recipient unresolved instead of inventing a contact',()=>{
    const result=leadRouting(context,'taraz');
    expect(result).toMatchObject({kind:'course',cityId:'taraz',branchSelection:'manager-clarifies'});
    expect(result).not.toHaveProperty('destination');
  });
  it.each([{...context,format:'online' as const},{...context,program:'online'},{...context,program:'language-korean'}])('does not route unconfirmed online service to a branch or international WhatsApp',request=>{
    expect(leadRouting(request,'almaty')).toEqual({kind:'online',assignment:'unconfirmed'});
  });
  it.each([{...context,type:'travel' as const},{...context,program:'admissions'},{...context,program:'summer-czech'}])('uses the international recipient only for international services',request=>{
    expect(leadRouting(request,'almaty')).toEqual({kind:'international',assignment:'manual-whatsapp',destination:COMPANY.internationalWhatsApp});
  });
  it('keeps course routing authoritative when an old international intent remains in a draft',()=>{
    expect(leadRouting({...context,intent:'international'},'astana').kind).toBe('course');
  });
});
