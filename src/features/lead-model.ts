import { t as translateRu, type Translator } from "../i18n/index";
import type { AgeGroup, FormType, ProgramFormat, ContactChannel } from '../types';
import type { Attribution } from './privacy';
import type { LeadRouting } from './lead-routing';
import { DEMO_PROGRAMS, TRAVEL_PROGRAMS } from '../data/demo';
import {PLANNED_LANGUAGES, SUMMER_DESTINATIONS} from '../data/company';
export type LeadDraft = { name: string; phone: string; ageGroup: string; program: string; format: string; channel: string; comment: string; consent: boolean; currentLevel: string; targetScore: string; examDate: string; preferredArea: string; parentName: string; childAge: string; travelProgram: string };
export type RequestContext = { type: FormType; program?: string; ctaId: string; page: string; format?: ProgramFormat; intent?: 'international' | 'language-start' };
export interface LeadPayload {
  routing: LeadRouting;
  name: string; phone: string; cityId: string; branchId?: string; ageGroup?: AgeGroup; program?: string; format?: ProgramFormat; channel?: ContactChannel; comment: string;
  consent: { given: true; version: string }; context: RequestContext; attribution?: Attribution;
  ielts?: { currentLevel: string; targetScore: string; examDate: string };
  travel?: { parentName: string; childAge: number; program: string };
}
export type LeadResult = {status:'demo';delivered:false}|{status:'accepted';delivered:true;requestId?:string}|{status:'queued';delivered:false};
export type LeadHandler = ((payload: LeadPayload, signal: AbortSignal) => Promise<LeadResult>) & {newAttempt?:()=>void;environment?:'demo'|'local-integration'|'approved-staging'|'production'};
export const demoLeadHandler: LeadHandler = async () => ({ status: 'demo', delivered:false });
export const EMPTY_DRAFT: LeadDraft = { name: '', phone: '', ageGroup: '', program: '', format: '', channel: '', comment: '', consent: false, currentLevel: '', targetScore: '', examDate: '', preferredArea: '', parentName: '', childAge: '', travelProgram: '' };
export function leadFieldLabel(label:string,required:boolean){return label.replace(/(?:\s*\*)+$/u,'')+(required?' *':'')}
export {normalizePhone} from './lead-contract.js';
import {normalizePhone} from './lead-contract.js';
const programIds=new Set(DEMO_PROGRAMS.filter(p=>p.published).map(p=>p.id).concat(PLANNED_LANGUAGES.map(p=>'language-'+p.id),SUMMER_DESTINATIONS.map(p=>'summer-'+p.id),['admissions']));
export function validateLead(d: LeadDraft, type: FormType, t: Translator = translateRu) {
  const errors: Partial<Record<keyof LeadDraft, string>> = {};
  if (!d.name.trim() || d.name.length > 100) errors.name = t("lead-model.vvedite.imya.do.100.simvolov");
  if (!normalizePhone(d.phone)) errors.phone = t("lead-model.vvedite.nomer.7.i.10");
  if (!d.consent) errors.consent = t("lead-model.neobkhodimo.dat.soglasie");
  if (d.comment.length > 1000) errors.comment = t("lead-model.kommentariy.do.1000.simvolov");
  if (d.preferredArea.length>100) errors.preferredArea = t('Lead.areaTooLong');
  if (type !== 'callback' && !['phone','whatsapp'].includes(d.channel)) errors.channel=t('Lead.chooseChannel');
  if (type === 'main' || type === 'ielts') {
    if (!programIds.has(d.program)) errors.program=t('Lead.chooseProgram');
    if (!['children','teens','adults'].includes(d.ageGroup)) errors.ageGroup=t('Lead.chooseAge');
    const selected=DEMO_PROGRAMS.find(p=>p.id===d.program);
    if(selected&&selected.format!=='hybrid'&&d.format&&d.format!==selected.format)errors.format=t('Lead.incompatibleFormat');
    if(selected&&selected.ageGroup!=='all'&&d.ageGroup&&d.ageGroup!==selected.ageGroup)errors.ageGroup=t('Lead.incompatibleAge');
    if (!['online','offline','hybrid'].includes(d.format)) errors.format=t('Lead.chooseFormat');
  }
  if (type === 'ielts') {
    if (!['Не знаю','A1','A2','B1','B2','C1'].includes(d.currentLevel)) errors.currentLevel = t("lead-model.ukazhite.uroven.ili.vyberite.ne");
    if (!/^(?:[0-8](?:\.5)?|9)$/.test(d.targetScore)) errors.targetScore = t("lead-model.ukazhite.ball.ot.0.do");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.examDate) || Number.isNaN(Date.parse(d.examDate)) || new Date(d.examDate).toISOString().slice(0, 10) !== d.examDate) errors.examDate = t("lead-model.ukazhite.planiruemuyu.datu");
  }
  if (type === 'travel') {
    if (!d.parentName.trim() || d.parentName.length > 100) errors.parentName = t("lead-model.vvedite.imya.roditelya");
    const trip = TRAVEL_PROGRAMS.find(p => p.slug === d.travelProgram && p.published);
    if (!/^\d{1,2}$/.test(d.childAge) || Number(d.childAge) < (trip?.ageMin ?? 10) || (trip?.ageMax !== undefined && Number(d.childAge) > trip.ageMax)) errors.childAge = trip?.ageMax !== undefined ? t("lead-model.vozrast.rebyonka.ot.v0.do", {v0: trip.ageMin, v1: trip.ageMax}) : t('Lead.minimumAge',{age:trip?.ageMin ?? 10});
    if (!trip) errors.travelProgram = t("lead-model.vyberite.programmu.poezdki");
  }
  return errors;
}
