import {routingKind} from './lead-contract.js';
import type { ProgramFormat } from '../types';
import type {RequestContext} from './lead-model';
import {COMPANY} from '../data/company';
export type LeadRouting =
 | {kind:'international'; assignment:'manual-whatsapp'; destination:typeof COMPANY.internationalWhatsApp}
 | {kind:'online'; assignment:'unconfirmed'}
 | {kind:'course'; assignment:'branch-manager'; cityId:string; branchId?:string; preferredArea?:string; branchSelection:'selected'|'manager-clarifies'};
// Routing is metadata for the future server, never permission to deliver a lead.
export function leadRouting(context:RequestContext,cityId:string,branchId?:string,format?:ProgramFormat,preferredArea?:string):LeadRouting {
 const kind=routingKind(context,format);
 if(kind==='international')return {kind:'international',assignment:'manual-whatsapp',destination:COMPANY.internationalWhatsApp};
 if(kind==='online')return {kind:'online',assignment:'unconfirmed'};
 return {kind:'course',assignment:'branch-manager',cityId,branchId,preferredArea:preferredArea?.trim()||undefined,branchSelection:branchId?'selected':'manager-clarifies'};
}
