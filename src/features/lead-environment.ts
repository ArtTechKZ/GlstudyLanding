import {requestTurnstileToken} from './antibot-client';
import {demoLeadHandler} from './lead-model';import {createHttpLeadHandler} from './lead-http';
export const leadEnvironment=import.meta.env.VITE_GL_LEAD_ENV??'demo';
const url=import.meta.env.VITE_GL_LEAD_URL,version=import.meta.env.VITE_GL_CONSENT_VERSION,sitekey=import.meta.env.VITE_GL_ANTIBOT_SITE_KEY;
// No credentials belong here. Missing/invalid live configuration throws, never pretends DEMO success.
export const configuredLeadHandler=leadEnvironment==='demo'?demoLeadHandler:(()=>{if(!['local-integration','approved-staging','production'].includes(leadEnvironment)||!url||!version)throw Error('Lead integration configuration incomplete');return createHttpLeadHandler({url,mode:leadEnvironment as 'local-integration'|'approved-staging'|'production',consentVersion:version,getAntibotToken:leadEnvironment==='local-integration'?undefined:sitekey?(signal)=>requestTurnstileToken(sitekey,signal):undefined})})();
