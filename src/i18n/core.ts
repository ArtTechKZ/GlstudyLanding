import type {Locale} from '../types';
import {ru} from './ru';
export type UiKey = keyof typeof ru;
type Slots<S extends string> = S extends `${string}{${infer P}}${infer Tail}` ? P | Slots<Tail> : never;
type Arguments<K extends UiKey> = [Slots<(typeof ru)[K]>] extends [never] ? [params?: Record<string,string|number>] : [params: Record<Slots<(typeof ru)[K]>,string|number>];
export type Translator = (<K extends UiKey>(key: K, ...args: Arguments<K>) => string) & {locale?:Locale};
export type UiMessages = Partial<Record<UiKey,string>>;
export const supportedLocales = ['ru','kk','en'] as const satisfies readonly Locale[];
export const publishedLocales: readonly Locale[] = ['ru'];
export function publishedLocale(requested: unknown): Locale {
  const locale = supportedLocales.find(value=>value===requested);
  return locale && publishedLocales.includes(locale) ? locale : 'ru';
}
// Real catalogs are available in local preview. Publication approval is separate;
// fixture overrides keep fallback and long-copy regression checks reproducible.
export function createTranslator(messages: UiMessages = {},locale:Locale='ru'): Translator {
  const translate = ((key: UiKey, params: Record<string,string|number> = {}) => {
    const fallback = ru[key] ?? ru['Common.unavailable'];
    const candidate = messages[key];
    const slots = (value:string) => [...value.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort().join(',');
    const source = typeof candidate === 'string' && candidate.trim() && slots(candidate)===slots(fallback) ? candidate : fallback;
    if ([...source.matchAll(/\{(\w+)\}/g)].some(match=>params[match[1]]===undefined)) return messages['Common.unavailable']||ru['Common.unavailable'];
    return source.replace(/\{(\w+)\}/g, (_match, slot: string) => String(params[slot]));
  }) as Translator;
  translate.locale=locale;return translate;
}
export const t = createTranslator();
