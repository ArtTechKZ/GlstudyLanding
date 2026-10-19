import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {CityProvider} from '../../src/context/CityContext';
import BranchMap from '../../src/components/ui/BranchMap';
import StudyGallery from '../../src/components/ui/StudyGallery';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
// Component-only synthetic coordinates and marketing illustrations, never site data.
const city={id:'fixture',name:'Fixture map',isDefault:true,branches:[{id:'one',cityId:'fixture',name:'Fixture one',status:'active' as const,lat:51.1,lng:71.4},{id:'two',cityId:'fixture',name:'Fixture two',status:'active' as const,lat:51.12,lng:71.42}]};
createRoot(document.getElementById('root')!).render(<BrowserRouter><CityProvider cities={[city]}><main style={{padding:16}}><h1>Isolated target fixture</h1><StudyGallery images={[{src:'/images/home/travel-prague.webp',alt:'Fixture marketing illustration',width:800,height:635},{src:'/images/home/offline-class.webp',alt:'Fixture classroom illustration',width:800,height:1200}]}/><BranchMap city={city} branches={city.branches}/></main></CityProvider></BrowserRouter>);
