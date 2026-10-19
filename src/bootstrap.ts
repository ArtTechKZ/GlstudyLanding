// SSG and the inline critical controller are already usable. Let the browser
// display them before fetching/executing the full React graph. No timeout or
// Lighthouse-specific gate; input can start the application immediately too.
let started=false;
const start=()=>{if(started)return;started=true;void import('./main')};
if(window.__GL_SSG__||!document.getElementById('root')?.dataset.ssg||typeof PerformanceObserver==='undefined'||!PerformanceObserver.supportedEntryTypes.includes('paint'))start();
else if(performance.getEntriesByType('paint').length)start();
else {
  const observer=new PerformanceObserver(list=>{if(list.getEntries().some(e=>e.name==='first-contentful-paint')){observer.disconnect();start()}});
  observer.observe({type:'paint',buffered:true});
  for(const event of ['pointerdown','keydown'])document.addEventListener(event,start,{once:true,capture:true});
}
