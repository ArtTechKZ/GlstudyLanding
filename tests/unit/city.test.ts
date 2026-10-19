import {describe,expect,it} from 'vitest';
import {cityDestination,resolveCitySelection} from '../../src/context/city-selection';
import type {City} from '../../src/types';
const cities:City[]=[{id:'almaty',name:'Synthetic A',isDefault:true,branches:[{id:'a1',cityId:'almaty',name:'Synthetic A1',status:'active'},{id:'a2',cityId:'almaty',name:'Synthetic A2',status:'active'}]},{id:'taraz',name:'Synthetic T',branches:[{id:'t1',cityId:'taraz',name:'Synthetic T1',status:'active'}]}];
const saved={city:'almaty',branch:'a1'};
describe('city selection used by CityProvider',()=>{
  it('gives a city route priority over conflicting query and storage',()=>expect(resolveCitySelection(cities,'/kk/branches/taraz','?city=almaty&branch=a1',saved).selectedCity.id).toBe('taraz'));
  it('uses explicit query, then branch, then valid saved city',()=>{
    expect(resolveCitySelection(cities,'/online','?city=taraz',saved).activeBranch?.id).toBe('t1');
    expect(resolveCitySelection(cities,'/online','?branch=t1',saved).selectedCity.id).toBe('taraz');
    expect(resolveCitySelection(cities,'/online','?city=missing',saved).selectedCity.id).toBe('almaty');
  });
  it('rejects a mismatched branch and does not silently select one of several centres',()=>{
    expect(resolveCitySelection(cities,'/branches/almaty','?branch=t1',saved).activeBranch).toBeUndefined();
    expect(resolveCitySelection(cities,'/branches/almaty','',{city:'almaty',branch:''}).activeBranch).toBeUndefined();
  });
  it.each(['ru','kk','en'])('changes city while retaining locale, UTM and hash in %s',locale=>{
    const prefix=locale==='ru'?'':'/'+locale;
    const result=cityDestination({pathname:prefix+'/branches/almaty',search:'?utm_source=qa&branch=a1',hash:'#lead-form'},cities[1]);
    expect(result).toEqual({pathname:prefix+'/branches/taraz',search:'utm_source=qa&city=taraz',hash:'#lead-form'});
    expect(resolveCitySelection(cities,result.pathname,'?'+result.search,saved).selectedCity.id).toBe('taraz');
  });
  it('does not rewrite a non-city route and only accepts branches of that city',()=>{
    expect(cityDestination({pathname:'/en/online',search:'?utm_source=qa',hash:'#top'},cities[1],'a1')).toEqual({pathname:'/en/online',search:'utm_source=qa&city=taraz',hash:'#top'});
  });
});
