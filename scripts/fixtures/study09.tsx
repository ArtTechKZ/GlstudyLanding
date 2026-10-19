import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import StudyGallery from '../../src/components/ui/StudyGallery';
import '../../src/styles/global.scss';
import '../../src/styles/study.scss';
// Isolated component test illustrations. Never shipped as trip photographs.
createRoot(document.getElementById('root')!).render(<BrowserRouter><main style={{padding:24}}><h1>Gallery fixture — marketing illustrations only</h1><StudyGallery images={[
 {src:'/images/home/travel-prague.webp',thumbnail:'/images/home/travel-prague-240.webp',alt:'Fixture: Prague illustration',caption:'Fixture illustration of Prague, not a trip report',width:800,height:635},
 {src:'/images/home/offline-class.webp',thumbnail:'/images/home/offline-class-240.webp',alt:'Fixture: classroom illustration',caption:'Fixture classroom illustration, not a GL Study branch',width:800,height:1200},
 {src:'/__fixture_missing.webp',alt:'Fixture: unavailable image',caption:'Deliberately unavailable fixture',width:800,height:600},
]}/></main></BrowserRouter>);
