import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {CityProvider} from '../../src/context/CityContext';
import StudyGallery from '../../src/components/ui/StudyGallery';
import '../../src/styles/global.scss';import '../../src/styles/study.scss';
// Component-only marketing illustrations, never site data. The map part of this fixture was removed in GL-STUDY-31:
// maps are switched off in every build profile (MAPS_ENABLED=false), so there is no map target to measure.
const city={id:'fixture',name:'Fixture city',isDefault:true,branches:[{id:'one',cityId:'fixture',name:'Fixture one',status:'active' as const},{id:'two',cityId:'fixture',name:'Fixture two',status:'active' as const}]};
createRoot(document.getElementById('root')!).render(<BrowserRouter><CityProvider cities={[city]}><main style={{padding:16}}><h1>Isolated target fixture</h1><StudyGallery images={[{src:'/images/home/travel-prague.webp',alt:'Fixture marketing illustration',width:800,height:635},{src:'/images/home/offline-class.webp',alt:'Fixture classroom illustration',width:800,height:1200}]}/></main></CityProvider></BrowserRouter>);
