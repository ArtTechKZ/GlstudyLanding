import {contentHash,validateSnapshot} from './content-contract.mjs';
// Publication approval is read by build:public separately. This projection only
// removes unapproved language copy; it never grants approval or edits sources.
export function projectPublic(snapshot,approved=['ru']){
 validateSnapshot(snapshot);const data=structuredClone(snapshot.data),locales=['ru',...['kk','en'].filter(l=>approved.includes(l))],suffix={kk:'Kk',en:'En'};
 for(const l of ['kk','en'])if(!locales.includes(l)){
  for(const city of data.cities)delete city['name'+suffix[l]];
  for(const p of data.programs){delete p['title'+suffix[l]];if(p.translations)delete p.translations[l]}
  data.ui[l]={};
 }
 for(const p of data.programs)if(p.translations&&!Object.keys(p.translations).length)delete p.translations;
 data.seo=data.seo.filter(x=>locales.includes(x.locale));
 for(const media of data.media){for(const field of ['alt','caption','transcript'])if(media[field])media[field]=Object.fromEntries(locales.filter(l=>l in media[field]).map(l=>[l,media[field][l]]))}
 return validateSnapshot({schemaVersion:1,source:locales.length===1?'approved-public-ru-projection':'approved-public-projection',locales,upstreamRevision:snapshot.revision,revision:contentHash(data),data});
}
export const projectPublicRu=snapshot=>projectPublic(snapshot,['ru']);
