import {createHash} from 'node:crypto';
export function assertLeadRelease(snapshot,env={}){
 for(const [key,value]of Object.entries(env))if(value&&/^VITE_.*(?:SECRET|TOKEN|PASSWORD|PRIVATE)/i.test(key))throw Error('Server secrets cannot be placed in VITE variables');
 const mode=env.VITE_GL_LEAD_ENV??'demo';if(mode==='demo')return;
 if(!['local-integration','approved-staging','production'].includes(mode))throw Error('Unknown lead environment');
 let endpoint;try{endpoint=new URL(env.VITE_GL_LEAD_URL??'')}catch{throw Error('Invalid lead endpoint URL')}if(endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw Error('Lead endpoint must not contain credentials/query/fragment');
 if(env.GL_RELEASE_PROFILE==='public-ru'&&mode!=='production')throw Error('Public profile cannot publish a test delivery environment');
 if(mode==='local-integration'){if(endpoint.protocol!=='http:'||!['127.0.0.1','localhost'].includes(endpoint.hostname)||!env.VITE_GL_CONSENT_VERSION)throw Error('Explicit loopback test configuration required');return}
 if(endpoint.protocol!=='https:'||!env.VITE_GL_CONSENT_VERSION||!env.VITE_GL_ANTIBOT_SITE_KEY)throw Error('External form configuration incomplete');
 // A new URL/version flag cannot activate forms while legal pages are drafts.
 // Official texts are supplied and approved by the operator, never synthesized.
 const legal=snapshot.data.legal??[];
 for(const kind of ['privacy','consent']){
  const document=legal.find(d=>d.kind===kind&&d.operatorApproved===true&&d.publicPageVerified===true&&d.locale==='ru'&&(kind!=='consent'||d.version===env.VITE_GL_CONSENT_VERSION));
  if(!document?.operator||!document.version||!document.url?.startsWith('/legal/')||!document.body||!/^[a-f\d]{64}$/.test(document.sha256??'')||createHash('sha256').update(document.body).digest('hex')!==document.sha256)throw Error('Approved immutable public '+kind+' document is required');
 }
}
