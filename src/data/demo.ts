// Compatibility export names retained; all business data comes from one validated build snapshot.
import snapshot from './content-snapshot.json' with {type:'json'};
import type {City,Program,TravelProgram,FaqItem,Review,AdditionalService,AdmissionPackage} from '../types';
/** Every entry of the branch table, including cities that have no page of their own. */
export const ALL_CITIES=snapshot.data.cities as City[];
/** Cities with a /branches/{id} page and a place in the city selectors. */
export const DEMO_CITIES=ALL_CITIES.filter(city=>city.hasPage!==false);
/** Branches whose own table row lists Kazakh courses. Nothing is inferred for other branches. */
export const kazakhBranches=()=>ALL_CITIES.flatMap(c=>c.branches).filter(b=>b.status==='active'&&b.offerings?.includes('Курсы казахского языка'));
export const DEMO_PROGRAMS=snapshot.data.programs as Program[];
export const TRAVEL_PROGRAMS=snapshot.data.trips as TravelProgram[];
export const DEMO_FAQ=snapshot.data.faq as FaqItem[];
export const DEMO_REVIEWS=snapshot.data.reviews as Review[];
export const TRIAL_PROCESS=snapshot.data.trialProcess;
// Optional in the snapshot schema: a CMS export without these arrays simply hides the sections.
const optional=snapshot.data as unknown as {services?:AdditionalService[];packages?:AdmissionPackage[]};
export const ADDITIONAL_SERVICES=[...(optional.services??[])].sort((a,b)=>a.order-b.order);
export const ADMISSION_PACKAGES=[...(optional.packages??[])].sort((a,b)=>a.order-b.order);
