// Compatibility export names retained; all business data comes from one validated build snapshot.
import snapshot from './content-snapshot.json' with {type:'json'};
import type {City,Program,TravelProgram,FaqItem,Review} from '../types';
export const DEMO_CITIES=snapshot.data.cities as City[];
export const DEMO_PROGRAMS=snapshot.data.programs as Program[];
export const TRAVEL_PROGRAMS=snapshot.data.trips as TravelProgram[];
export const DEMO_FAQ=snapshot.data.faq as FaqItem[];
export const DEMO_REVIEWS=snapshot.data.reviews as Review[];
export const TRIAL_PROCESS=snapshot.data.trialProcess;
