import {assertPublishable} from './schema.mjs';
const collections=['cities','branches','programs','schedules','texts','images','trips','faq','teachers','reviews','seo','cta','documents','redirects'];
export class DirectusDataAdapter{
 constructor({url,token,fetchImpl=fetch}){const u=new URL(url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Invalid CMS URL');if(u.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(u.hostname))throw Error('HTTPS required');this.url=u;this.token=token;this.fetch=fetchImpl;}
 async request(path){const response=await this.fetch(new URL(path,this.url.href.replace(/\/?$/,'/')),{headers:this.token?{Authorization:'Bearer '+this.token}:{},signal:AbortSignal.timeout(10000),redirect:'error'});if(!response.ok)throw Error('CMS unavailable: '+response.status);return response.json()}
 async revision(){const data=await this.request('activity?limit=1&sort=-id&filter='+encodeURIComponent(JSON.stringify({collection:{_starts_with:'gl_'}}))+'&fields=id');if(!Array.isArray(data.data))throw Error('Invalid CMS revision');return data.data[0]?.id??0}
 async read(collection,locale='ru',filters={}){
  if(!['ru','kk','en'].includes(locale)||!collections.includes(collection))throw Error('Unsupported content');
  const all=[],seen=new Set(),limit=100;let count;
  for(let offset=0;;offset+=limit){const url=new URL('items/gl_'+collection,this.url.href.replace(/\/?$/,'/'));url.search=new URLSearchParams({filter:JSON.stringify({_and:[{status:{_eq:'published'}},{['approved_'+locale]:{_eq:true}},filters]}),limit:String(limit),offset:String(offset),sort:'id',meta:'filter_count'});const {data,meta}=await this.request(url.href);if(!Array.isArray(data))throw Error('Invalid CMS response');if(Number.isInteger(meta?.filter_count)){if(count!==undefined&&count!==meta.filter_count)throw Error('CMS changed during pagination');count=meta.filter_count}
   for(const record of data){assertPublishable(record,locale);if(seen.has(record.id))throw Error('Repeated CMS page');seen.add(record.id);all.push(record)}
   if(data.length<limit){if(count!==undefined&&all.length!==count)throw Error('Incomplete CMS response');break}if(offset>100000)throw Error('CMS pagination limit');
  }return all;
 }
 getCities(locale){return this.read('cities',locale)}getBranches(locale,city){return this.read('branches',locale,city?{city:{_eq:city}}:{})}getPrograms(locale){return this.read('programs',locale)}getTravelPrograms(locale){return this.read('trips',locale)}getFaq(locale){return this.read('faq',locale)}getReviews(locale){return this.read('reviews',locale,{publication_consent:{_eq:true}})}
}
