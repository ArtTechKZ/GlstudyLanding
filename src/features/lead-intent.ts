import {parseLocalePath} from '../config/locale-routes.js';
import type { RequestContext } from './lead-model';
import { safePath } from './privacy-model';
export function leadIntent(a: HTMLAnchorElement, pathname: string) {
  pathname=parseLocalePath(pathname).semanticPath;
  const section = a.closest('section'), program = a.closest('[data-program]')?.getAttribute('data-program') ?? (pathname.startsWith('/programs/') ? pathname.split('/').at(-1) : ['/online','/offline'].includes(pathname) ? pathname.slice(1) : undefined);
  const international = program === 'admissions' || program?.startsWith('summer-');
  const plannedLanguage = program?.startsWith('language-');
  const format = a.dataset.format === 'online' || a.dataset.format === 'offline' ? a.dataset.format : program === 'online' || program === 'offline' ? program : undefined;
  const type = pathname.startsWith('/travel/') || program === 'travel' ? 'travel' : pathname.startsWith('/ielts') || section?.id === 'ielts' || program === 'ielts-prep' ? 'ielts' : 'main';
  const contextualProgram = pathname.startsWith('/travel/') ? pathname.split('/').filter(Boolean).pop() : program ?? (type === 'ielts' ? 'ielts-prep' : ['children', 'teens', 'adults'].includes(section?.id ?? '') ? `english-${section!.id}` : undefined);
  const request: RequestContext = { type, program: contextualProgram, ctaId: a.dataset.cta ?? a.className.split(' ').filter(c => c !== 'btn').join('-').slice(0, 100), page: safePath(pathname), format, ...(international ? {intent:'international' as const} : plannedLanguage ? {intent:'language-start' as const} : {}) };
  return { request, city: a.dataset.city, branch: a.dataset.branch };
}
