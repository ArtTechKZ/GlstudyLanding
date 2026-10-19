import {contentHash,validateSnapshot} from './content-contract.mjs';
// Publication approval is read by build:public separately. This projection only
// removes unapproved language copy; it never grants approval or edits sources.
export function projectPublicRu(snapshot){
 validateSnapshot(snapshot);const data=structuredClone(snapshot.data);
 for(const city of data.cities){delete city.nameKk;delete city.nameEn}
 for(const p of data.programs){delete p.titleKk;delete p.titleEn;delete p.translations}
 data.ui={ru:data.ui.ru,kk:{},en:{}};
 data.seo=data.seo.filter(x=>x.locale==='ru');
 for(const media of data.media){for(const field of ['alt','caption','transcript'])if(media[field])media[field]={ru:media[field].ru}}
 return validateSnapshot({schemaVersion:1,source:'approved-public-ru-projection',locales:['ru'],upstreamRevision:snapshot.revision,revision:contentHash(data),data});
}
