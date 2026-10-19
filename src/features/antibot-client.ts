type WidgetOptions={sitekey:string;action:string;size:string;theme:string;language:string;callback:(token:string)=>void;'error-callback':()=>void;'expired-callback':()=>void;'response-field':boolean};
type TurnstileSdk={render:(element:HTMLElement,options:WidgetOptions)=>string;remove:(id:string)=>void};
declare global{interface Window{turnstile?:TurnstileSdk}}
let pendingSdk:Promise<TurnstileSdk>|undefined;
function sdk(){
 if(window.turnstile)return Promise.resolve(window.turnstile);
 return pendingSdk??=new Promise<TurnstileSdk>((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;
  const fail=()=>{clearTimeout(timer);script.remove();pendingSdk=undefined;reject(Error('Security check unavailable'))};
  const timer=setTimeout(fail,15000);script.onerror=fail;script.onload=()=>{clearTimeout(timer);if(window.turnstile)resolve(window.turnstile);else fail()};document.head.append(script);
 });
}
// No SDK/preconnect/network at import or in DEMO. Called only after valid form
// submission and consent, using a public site key; the secret stays server-side.
export async function requestTurnstileToken(sitekey:string,signal:AbortSignal):Promise<string>{
 if(!/^[A-Za-z\d_-]{10,100}$/.test(sitekey))throw Error('Approved public anti-bot site key required');
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const active=document.activeElement,form=active instanceof Element?active.closest('form.lead-form__form'):null;
 const host=form?.closest('dialog[open]')??form??document.querySelector('dialog[open]')??document.getElementById('lead-form')??document.body;
 const consent=(form??host.querySelector('form'))?.querySelector<HTMLInputElement>('[name=consent]');
 const api=await sdk();if(signal.aborted||!host.isConnected||consent?.checked===false)throw new DOMException('Aborted','AbortError');
 return new Promise((resolve,reject)=>{
  const panel=document.createElement('aside');panel.className='study-panel';panel.setAttribute('role','group');
  const label={ru:'Проверка перед отправкой',kk:'Жіберу алдындағы тексеру',en:'Security check before sending'}[document.documentElement.lang as 'ru']??'Security check before sending';panel.setAttribute('aria-label',label);
  Object.assign(panel.style,{position:'sticky',bottom:'0',zIndex:'10',background:'#fff',color:'#000',padding:'16px',maxWidth:'100%'});
  const title=document.createElement('p');title.textContent=label;const container=document.createElement('div');panel.append(title,container);host.append(panel);panel.scrollIntoView?.({block:'nearest'});
  let id:string|undefined,done=false;
  const finish=(token?:string,error?:Error)=>{if(done)return;done=true;clearTimeout(timer);signal.removeEventListener('abort',abort);consent?.removeEventListener('change',withdraw);if(id)try{api.remove(id)}catch{/* Local cleanup only. */}panel.remove();if(error)reject(error);else if(typeof token==='string'&&token.length>0&&token.length<=2048)resolve(token);else reject(Error('Security token unavailable'))};
  const withdraw=()=>{if(consent?.checked===false)finish(undefined,new DOMException('Consent withdrawn','AbortError'))};consent?.addEventListener('change',withdraw);
  const abort=()=>finish(undefined,new DOMException('Aborted','AbortError'));const timer=setTimeout(()=>finish(undefined,Error('Security check timed out')),120000);signal.addEventListener('abort',abort,{once:true});
  try{id=api.render(container,{sitekey,action:'lead',size:'compact',theme:'light',language:['ru','en'].includes(document.documentElement.lang)?document.documentElement.lang:'auto','response-field':false,callback:token=>finish(token),'error-callback':()=>finish(undefined,Error('Security check failed')),'expired-callback':()=>finish(undefined,Error('Security check expired'))})}catch{finish(undefined,Error('Security check unavailable'))}
 });
}
