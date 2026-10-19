import type {Locale,Program,City} from '../types';
export type ContentTranslations<T> = Partial<Record<Exclude<Locale,'ru'>,Partial<T>>>;
export interface LocalizedContent<T> { ru:T; translations?:ContentTranslations<T> }
// Per-field fallback preserves the complete Russian content and never returns
// empty/undefined labels. No language switch or translated route is enabled here.
export function localizedContent<T extends object>(content:LocalizedContent<T>,locale:Locale='ru'):T {
  const values = locale==='ru' ? {} : content.translations?.[locale] ?? {};
  return {...content.ru,...Object.fromEntries(Object.entries(values).filter(([,value])=>value!==undefined&&value!==null&&(typeof value!=='string'||!!value.trim())))};
}
export function programContent(program:Program,locale:Locale='ru') {
  const ru={title:program.title,description:program.description,shortDesc:program.shortDesc,ageRange:program.ageRange};
  return localizedContent({ru,translations:{kk:{...program.translations?.kk,title:program.translations?.kk?.title??program.titleKk},en:{...program.translations?.en,title:program.translations?.en?.title??program.titleEn}}},locale);
}
export function cityName(city:City,locale:Locale='ru'):string {
  return localizedContent({ru:{name:city.name},translations:{kk:{name:city.nameKk},en:{name:city.nameEn}}},locale).name;
}
