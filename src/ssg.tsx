import {applyPageSeo} from './utils/pageSeo';
import {renderToReadableStream,renderToString} from 'react-dom/server.browser';
import Application from './Application';
import {privacyLabels} from './features/privacy-labels';
import {createTranslator} from './i18n/core';
import {getCatalog} from './i18n/catalogs';
import {parseLocalePath} from './config/locale-routes.js';
import {connectLabels} from './features/connect-labels';
const locale=parseLocalePath(location.pathname).locale,t=createTranslator(getCatalog(locale),locale);
window.__GL_CONNECT_LABELS__=connectLabels(t);
window.__GL_EARLY_LABELS__=privacyLabels(t);
export async function renderSnapshot(){
 // Resolve route Suspense first, then emit a complete non-streaming document
 // fragment. Persisting stream replacement scripts would break noJS snapshots.
 const stream=await renderToReadableStream(<Application snapshot/>);
 await stream.allReady;
 const html=renderToString(<Application snapshot/>);
 if(html.includes('<!--$!-->')||html.includes('<!--$?-->'))throw Error('Unresolved SSG Suspense boundary');
 return html;
}

export function finalizeSnapshot(){const path='/'+location.pathname.slice(import.meta.env.BASE_URL.length);applyPageSeo(path,undefined,document)}
