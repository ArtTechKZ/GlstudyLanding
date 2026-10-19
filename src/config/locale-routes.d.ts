import type { Locale } from '../types';
export const locales: readonly Locale[];
export const publicRu: boolean;
export interface LocalizedRoute { path:string; semanticPath:string; target:string; seo:string; locale:Locale; indexable:boolean }
export function parseLocalePath(value:string):{locale:Locale;semanticPath:string};
export function localizedPath(value:string,locale:Locale):string;
export const localizedRoutes: readonly LocalizedRoute[];
export function resolvePage(pathname:string):LocalizedRoute|undefined;
export function pageHref(pathname:string,locale:Locale):string;

export const approvedLocales: readonly Locale[];

export function routesForContent(hiddenRoutes?:string[]):typeof localizedRoutes;
