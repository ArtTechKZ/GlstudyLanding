import ClientEvents from './features/ClientEvents';
import {UiProvider} from './i18n';
import {StrictMode,startTransition,useEffect,useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {CityProvider} from './hooks/useCityContext';
import {PrivacyProvider} from './features/privacy';
import {LeadProvider} from './features/leads';
import LeadActions from './features/LeadActions';
import {ClientReadyContext} from './context/clientReady';
import App from './App';
export default function Application({snapshot=false}:{snapshot?:boolean}) {
 const [ready,setReady]=useState(!snapshot);
 useEffect(()=>{if(!window.__GL_SSG__){performance.mark('gl:hydration:commit');startTransition(()=>setReady(true))}},[]);
 return <StrictMode><ClientReadyContext value={ready}><BrowserRouter basename={import.meta.env.BASE_URL}><UiProvider><CityProvider><PrivacyProvider><LeadProvider><ClientEvents/><LeadActions><App/></LeadActions></LeadProvider></PrivacyProvider></CityProvider></UiProvider></BrowserRouter></ClientReadyContext></StrictMode>;
}
