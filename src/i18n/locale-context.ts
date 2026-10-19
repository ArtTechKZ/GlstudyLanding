import {createContext,useContext,useSyncExternalStore} from 'react';
import type {Locale} from '../types';
export interface LocaleSelection {locale:Locale;available:readonly Locale[];draft:boolean;loading?:Locale;failed?:boolean;selectLocale:(requested:unknown)=>boolean}
export const LocaleContext=createContext<LocaleSelection>({locale:'ru',available:['ru'],draft:false,selectLocale:()=>false});
export const useLocale=()=>useContext(LocaleContext);

const subscribeToHydration=()=>()=>{};
// A static document has no request query/fragment. Match its first hydration
// render, then synchronize request-specific native URLs after the commit.
export function useHydratedUrlPart(value:string){return useSyncExternalStore(subscribeToHydration,()=>value,()=>'')}
