import {CONTENT} from '../data/content';
import type { Locale } from '../types';
import { ru } from './ru';
import type { UiMessages } from './core';
const catalogs:Partial<Record<Locale,UiMessages>>={ru};
const pending:Partial<Record<Locale,Promise<void>>>={};
// Vite folds this branch so unapproved catalogs are absent from public assets.
const loaders = __GL_PUBLIC_RU__ ? {} : {kk:()=>import('./kk'),en:()=>import('./en')};
export const getCatalog=(locale:Locale):UiMessages=>({...catalogs[locale],...CONTENT.ui[locale]});
export function loadCatalog(locale:Locale):Promise<void>{
 if(catalogs[locale])return Promise.resolve();
 const loader=loaders[locale as 'kk'|'en'];
 if(!loader)return Promise.reject(new Error('Language is not approved for this release'));
 return pending[locale]??=loader().then(module=>{catalogs[locale]=module.messages}).catch(error=>{delete pending[locale];throw error});
}
