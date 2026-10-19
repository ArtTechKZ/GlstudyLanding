import {parseLocalePath,localizedPath} from '../config/locale-routes.js';
import type {City} from '../types';
type Selection={city:string;branch:string};
type LocationParts={pathname:string;search:string;hash:string};
export function resolveCitySelection(cities:City[],pathname:string,search:string,saved:Selection){
  const params=new URLSearchParams(search),semantic=parseLocalePath(pathname).semanticPath;
  const selectedCity=cities.find(c=>semantic==='/branches/'+c.id)
    ??cities.find(c=>c.id===params.get('city'))
    ??(!params.has('city')?cities.find(c=>c.branches.some(b=>b.id===params.get('branch'))):undefined)
    ??cities.find(c=>c.id===saved.city)??cities.find(c=>c.isDefault)??cities[0];
  const requested=params.has('branch')?params.get('branch'):selectedCity.id===saved.city?saved.branch:'';
  const active=selectedCity.branches.filter(b=>b.status==='active');
  return {selectedCity,activeBranch:active.find(b=>b.id===requested)??(active.length===1?active[0]:undefined)};
}
export function cityDestination(location:LocationParts,city:City,branchId=''){
  const next=new URLSearchParams(location.search);next.set('city',city.id);next.delete('branch');
  if(city.branches.some(b=>b.id===branchId&&b.status==='active'))next.set('branch',branchId);
  const parsed=parseLocalePath(location.pathname);
  return {pathname:parsed.semanticPath.startsWith('/branches/')?localizedPath('/branches/'+city.id,parsed.locale):location.pathname,search:next.toString(),hash:location.hash};
}
