import type {EventName, EventDetails} from './client-events';
import { createContext, useContext } from 'react';
import type { Choices, Attribution } from './privacy-model';
export const PrivacyContext = createContext<null | { choices: Choices | null; attribution?: Attribution; settings: () => void; emit: (name: EventName, details: EventDetails) => boolean }>(null);
export function usePrivacy() { const ctx = useContext(PrivacyContext); if (!ctx) throw Error('PrivacyProvider missing'); return ctx; }
