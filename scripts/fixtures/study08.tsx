import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CityProvider } from '../../src/context/CityContext';
import { useCityContext } from '../../src/hooks/useCityContext';
import { PrivacyProvider, usePrivacy, type OptionalAdapter } from '../../src/features/privacy';
import { LeadProvider, useLeads, type LeadHandler } from '../../src/features/leads';
import BranchMap from '../../src/components/ui/BranchMap';
import BranchPicker from '../../src/components/ui/BranchPicker';
import LeadFormSection from '../../src/components/sections/LeadFormSection';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
// Isolated synthetic fixtures. This module is never imported by src/main.tsx or the publication build.
const cities = [{id:'almaty', name:'Fixture city A', isDefault:true, branches:[{id:'a',cityId:'almaty',name:'Fixture A',lat:51.1,lng:71.4,status:'active' as const,programs:['ielts-prep']},{id:'b',cityId:'almaty',name:'Fixture B',lat:51.12,lng:71.42,status:'active' as const,programs:['english-teens']}]},{id:'astana',name:'Fixture city B',branches:[{id:'c',cityId:'astana',name:'Fixture C',status:'active' as const}]}];
const adapters: OptionalAdapter[] = ['analytics','advertising'].map(category=>({category:category as 'analytics'|'advertising', start:()=>{fetch('/__test/'+category+'/start');return()=>{window.fixtureStops=(window.fixtureStops??0)+1}},page:()=>{fetch('/__test/'+category+'/page')}}));
export function Fixture(){const {selectedCity,activeBranch,selectCity,availablePrograms}=useCityContext();const {settings,attribution}=usePrivacy();const {draft}=useLeads();const location=useLocation();const [mode,setMode]=useState('demo');
const handler:LeadHandler=async(payload,signal)=>{window.fixturePayloads=(window.fixturePayloads??[]).concat(payload);await new Promise(r=>setTimeout(r,250));if(signal.aborted)throw Error('abort');if(mode==='error')throw Error('synthetic');return mode==='accepted'?{status:'accepted',delivered:true}:{status:'demo',delivered:false}};
return <main style={{padding:16}}><h1>Isolated GL Study fixture</h1><button onClick={settings}>Cookie settings fixture</button><Link to="/ielts?city=almaty#keep">Fixture navigation</Link><button onClick={()=>selectCity('astana')}>City B</button><button onClick={()=>selectCity('almaty')}>City A</button><BranchPicker/><output id="selection">{selectedCity.id}/{activeBranch?.id??'none'}/{availablePrograms?.join(',')??'unknown'}</output><output id="fixture-location">{location.search+location.hash}</output><output id="attribution">{JSON.stringify(attribution??null)}</output><BranchMap city={selectedCity} branches={selectedCity.branches}/><select aria-label="Fixture response" value={mode} onChange={e=>setMode(e.target.value)}>{['demo','error','accepted'].map(m=><option key={m}>{m}</option>)}</select><LeadFormSection handler={handler}/><output id="draft-check">{draft.name}</output></main>}
createRoot(document.getElementById('root')!).render(<BrowserRouter><CityProvider cities={cities}><PrivacyProvider adapters={adapters}><LeadProvider><Fixture/></LeadProvider></PrivacyProvider></CityProvider></BrowserRouter>);
