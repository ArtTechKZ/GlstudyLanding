import { useState, type ReactNode } from 'react';
import { LeadContext } from './lead-context';
import { EMPTY_DRAFT, type RequestContext } from './lead-model';
export function LeadProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT), [open, setOpen] = useState(false);
  const [request, setRequest] = useState<RequestContext>({ type: 'main', ctaId: 'inline', page: '/' });
  const [submitRequested,setSubmitRequested]=useState(false);
  function begin(r: RequestContext, submit=false) { setRequest(r);setSubmitRequested(submit); if (r.program || r.format) setDraft(d => ({ ...d, ...(r.program ? {program:r.program} : {}), ...(r.format ? {format:r.format} : {}), ...(r.type === 'travel' ? { travelProgram: r.program! } : {}) })); setOpen(true); }
  return <LeadContext.Provider value={{ draft, setDraft, request, setRequest, open, setOpen, begin, submitRequested,consumeSubmit:()=>setSubmitRequested(false) }}>{children}</LeadContext.Provider>;
}
