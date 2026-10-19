import {createRoot} from 'react-dom/client';import {useState} from 'react';import {BrowserRouter} from 'react-router-dom';
import {CityProvider} from '../../src/context/CityContext';import {PrivacyProvider,type OptionalAdapter} from '../../src/features/privacy';import {LeadProvider} from '../../src/features/leads';import {createHttpLeadHandler} from '../../src/features/lead-http';import LeadFormSection from '../../src/components/sections/LeadFormSection';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
const state=window as Window&{GL24_ENDPOINT:string;GL24_EVENTS:unknown[]};state.GL24_EVENTS=[];
const handler=createHttpLeadHandler({url:state.GL24_ENDPOINT,mode:'local-integration',consentVersion:'gl-local-test-24',pollMs:50,polls:2});
const adapters:OptionalAdapter[]=[{category:'analytics',page:()=>{},start:()=>()=>{},event:event=>state.GL24_EVENTS.push(event)}];
export function Fixture(){const[show,setShow]=useState(true);return <main><h1>GL24 isolated real HTTP form test</h1><p>Synthetic Test / +70000000000 only. Test consent gl-local-test-24. No official company processing or messages.</p><button onClick={()=>setShow(v=>!v)}>Toggle test form</button>{show&&<LeadFormSection handler={handler}/>}</main>}
createRoot(document.getElementById('root')!).render(<BrowserRouter><CityProvider cities={[{id:'almaty',name:'Алматы',isDefault:true,branches:[]}]}><PrivacyProvider adapters={adapters}><LeadProvider><Fixture/></LeadProvider></PrivacyProvider></CityProvider></BrowserRouter>);
