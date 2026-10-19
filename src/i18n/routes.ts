import {localizedPath} from '../config/locale-routes.js';
import type {Locale} from '../types';
// Future publication requires a complete approved UI/content/legal/SEO release.
// This release-approval helper does not affect the complete local preview.
export interface LocaleRelease {locale:Locale;contentApproved:boolean;legalApproved:boolean;seoApproved:boolean;uiComplete:boolean}
export function localeReady(release:LocaleRelease){return release.contentApproved&&release.legalApproved&&release.seoApproved&&release.uiComplete}
export function localizedUrl(path:string,locale:Locale,releases:readonly LocaleRelease[],base='/GlstudyLanding/'){
 const release=releases.find(r=>r.locale===locale&&localeReady(r));if(!release)return undefined;
 return base+localizedPath(path,locale).slice(1);
}
export function localeAlternates(path:string,releases:readonly LocaleRelease[],base='/GlstudyLanding/'){
 return releases.filter(localeReady).map(r=>({hreflang:r.locale,href:localizedUrl(path,r.locale,releases,base)!}));
}
