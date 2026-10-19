import { createContext, useContext } from 'react';
import type { LeadDraft, RequestContext } from './lead-model';
export const LeadContext = createContext<null | { draft: LeadDraft; setDraft: React.Dispatch<React.SetStateAction<LeadDraft>>; request: RequestContext; setRequest: (r: RequestContext) => void; open: boolean; setOpen: (v: boolean) => void; begin: (r: RequestContext, submit?:boolean) => void; submitRequested:boolean; consumeSubmit:()=>void }>(null);
export function useLeads() { const value = useContext(LeadContext); if (!value) throw Error('LeadProvider missing'); return value; }
