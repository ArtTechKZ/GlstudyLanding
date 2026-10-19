import content from '../data/content-snapshot.json' with {type:'json'};
import site from './site.json' with { type: 'json' };
import approvals from './translation-approval.json' with { type: 'json' };
export const approvedLocales = ['ru','kk','en'].filter(locale => approvals[locale] === true);
// One semantic route registry; locale variants are derived, never separate pages.
export const publicRu = typeof __GL_PUBLIC_RU__ !== 'undefined' ? __GL_PUBLIC_RU__ : typeof process !== 'undefined' && process.env.GL_RELEASE_PROFILE === 'public-ru';
export const locales = publicRu ? ['ru'] : ['ru', 'kk', 'en'];
export function parseLocalePath(value) {
  let path = value.split(/[?#]/)[0] || '/';
  if (path.startsWith(site.base)) path = '/' + path.slice(site.base.length);
  const match = publicRu ? null : path.match(/^\/(kk|en)(?:\/|$)/);
  const locale = match ? match[1] : 'ru';
  const semanticPath = (match ? '/' + path.slice(match[0].length) : path).replace(/\/$/, '') || '/';
  return { locale, semanticPath };
}
export function localizedPath(value, locale) {
  const [pathname, suffix = ''] = value.split(/(?=[?#])/s, 2);
  // Preserve query AND fragment, rather than splitting them into separate pieces.
  const tail = value.slice(pathname.length);
  const { semanticPath } = parseLocalePath(pathname);
  return (locale === 'ru' ? '' : '/' + locale) + (semanticPath === '/' ? '/' : semanticPath) + (tail || suffix);
}
export function routesForContent(hiddenRoutes=content.data.hiddenRoutes){return locales.flatMap(locale => site.routes.filter(route=>!hiddenRoutes.includes(route.path)).map(route => ({
  ...route, locale, semanticPath: route.path,
  path: localizedPath(route.path, locale),
  target: (locale === 'ru' ? '' : locale + '/') + route.target,
  indexable: !['legal','privacyPolicy','personalDataConsent','notFound'].includes(route.seo) && approvedLocales.includes(locale),
})));}
export const localizedRoutes=routesForContent();
export function resolvePage(pathname) {
  const parsed = parseLocalePath(pathname);
  return localizedRoutes.find(r => r.locale === parsed.locale && r.semanticPath === parsed.semanticPath);
}
export function pageHref(pathname, locale) {
  const path = localizedPath(pathname, locale);
  const at=path.search(/[?#]/),directory=at<0?path:path.slice(0,at),tail=at<0?'':path.slice(at);
  return site.base + (directory === '/' ? '' : directory.slice(1).replace(/\/?$/, '/')) + tail;
}
