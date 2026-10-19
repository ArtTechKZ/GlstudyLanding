import {loadCatalog,getCatalog} from './i18n/catalogs';
import {parseLocalePath} from './config/locale-routes.js';
import {createTranslator} from './i18n';
import {connectLabels} from './features/connect-labels';
import { installConnect } from './features/connect';
import {createRoot,hydrateRoot} from 'react-dom/client';
import Application from './Application';
import './styles/global.scss';
import './styles/study.scss';
const locale=parseLocalePath(location.pathname).locale;
await loadCatalog(locale);
window.__GL_CONNECT_LABELS__=connectLabels(createTranslator(getCatalog(locale),locale));
const root=document.getElementById('root')!;
const snapshot=Boolean(window.__GL_SSG__||root.dataset.ssg);
// A first visit without remembered city/branch already matches the SSG values.
// Avoid a whole-tree restore transition when there is nothing to restore.
function needsCityRestore(){
 if(window.__GL_SSG__)return true;
 const query=new URLSearchParams(location.search);if(query.has('city')||query.has('branch'))return true;
 try{return Boolean(localStorage.getItem('gl_study_selected_city')||localStorage.getItem('gl_study_selected_branch'))}catch{return true}
}
const restoreSnapshot=snapshot&&needsCityRestore();
performance.mark('gl:hydration:start');
// The build renderer owns this document. Concurrent client rendering while its
// Suspense tree yields would share browser context slots with the server render.
if(!window.__GL_SSG__){
 installConnect();
 if(root.dataset.ssg)hydrateRoot(root,<Application snapshot={restoreSnapshot}/>);
 else createRoot(root).render(<Application snapshot={restoreSnapshot}/>);
}
// Build-only path. The browser SSR renderer is split out and never requested by
// normal clients. The same Application tree produces correct Suspense/useId HTML.
if(window.__GL_SSG__)import('./ssg').then(async({renderSnapshot,finalizeSnapshot})=>{window.__GL_SSG_FINALIZE__=finalizeSnapshot;window.__GL_SSG_HTML__=await renderSnapshot()});
