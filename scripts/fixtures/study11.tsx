import {createRoot} from 'react-dom/client';
import {BrowserRouter,Link} from 'react-router-dom';
import {useState} from 'react';
import {CityProvider} from '../../src/context/CityContext';
import {useCityContext} from '../../src/hooks/useCityContext';
import {PrivacyProvider,usePrivacy,type OptionalAdapter} from '../../src/features/privacy';
import {LeadProvider,type LeadHandler} from '../../src/features/leads';
import LeadActions from '../../src/features/LeadActions';
import ClientEvents from '../../src/features/ClientEvents';
import LeadFormSection from '../../src/components/sections/LeadFormSection';
import FaqAccordion from '../../src/components/ui/FaqAccordion';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
// Synthetic contact/download fixtures only. No fixture links or accepted handler
// are imported by the production application; all external navigation is blocked.
const cities=[{id:'almaty',name:'Fixture A',isDefault:true,branches:[{id:'a',cityId:'almaty',name:'Fixture branch A',status:'active' as const},{id:'b',cityId:'almaty',name:'Fixture branch B',status:'active' as const}]},{id:'astana',name:'Fixture B',branches:[{id:'c',cityId:'astana',name:'Fixture branch C',status:'active' as const}]}];
const adapters:OptionalAdapter[]=[{category:'analytics',start:()=>{window.fixtureStarts=(window.fixtureStarts??0)+1;return()=>{window.fixtureStops=(window.fixtureStops??0)+1}},page:path=>{window.fixturePages=(window.fixturePages??[]).concat(path)},event:event=>{window.fixtureEvents=(window.fixtureEvents??[]).concat(event)}}];
export function Fixture(){const {settings}=usePrivacy(),{selectCity,selectBranch}=useCityContext();const [mode,setMode]=useState('demo'),[count,setCount]=useState(0);
const handler:LeadHandler=async(_payload,signal)=>{await new Promise(r=>setTimeout(r,mode==='slow'?2000:80));if(signal.aborted)throw Error('aborted');if(mode==='error')throw Error('Synthetic private error must not enter events');return ['accepted','slow'].includes(mode)?{status:'accepted',delivered:true}:{status:'demo',delivered:false}};
return <main style={{padding:24}}><h1>Isolated study11 events fixture</h1><button onClick={settings}>Fixture settings</button><button onClick={()=>setCount(v=>v+1)}>Rerender {count}</button><button onClick={()=>selectCity('astana')}>Fixture city B</button><button onClick={()=>selectCity('almaty')}>Fixture city A</button><button onClick={()=>selectBranch('a')}>Fixture branch A</button><button onClick={()=>selectBranch('b')}>Fixture branch B</button><nav><Link to="/learning">Fixture learning</Link> <Link to="/ielts">Fixture IELTS</Link> <Link to="/travel/malaysia">Fixture travel</Link></nav>
<section id="fixture-actions" data-program="ielts-prep"><a href="#lead-form" data-cta="fixture-cta" data-branch="b">Fixture CTA</a> <a href="tel:+70000000000" onClick={e=>e.preventDefault()}>Fixture phone</a> <a href="https://wa.me/70000000000" onClick={e=>e.preventDefault()}>Fixture WhatsApp</a> <a href="https://www.openstreetmap.org/directions?to=0,0" onClick={e=>e.preventDefault()}>Fixture route</a> <a href="/__fixture_program.pdf" download onClick={e=>e.preventDefault()}>Fixture program download</a> <a href="/learning#online">Fixture online</a> <a href="/learning#offline">Fixture offline</a></section>
<FaqAccordion items={[{id:'fixture',question:'Fixture FAQ',answer:'Synthetic answer'}]}/><select aria-label="Fixture response" value={mode} onChange={e=>setMode(e.target.value)}>{['demo','accepted','error','slow'].map(x=><option key={x}>{x}</option>)}</select><LeadFormSection handler={handler}/><div style={{height:16000}} aria-hidden="true"/></main>}
createRoot(document.getElementById('root')!).render(<BrowserRouter><CityProvider cities={cities}><PrivacyProvider adapters={adapters}><LeadProvider><ClientEvents/><LeadActions><Fixture/></LeadActions></LeadProvider></PrivacyProvider></CityProvider></BrowserRouter>);
