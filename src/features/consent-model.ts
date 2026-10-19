// One canonical model shared by the early interface and React. No framework dependency.
export const CONSENT_KEY = 'gl_study_cookie_v1';
export const ATTRIBUTION_KEY = 'gl_study_attribution_v1';
export type Choices = { version: 1; necessary: true; analytics: boolean; advertising: boolean; savedAt: number };
export function parseChoices(value: string | null): Choices | null {
  try {
    const v = JSON.parse(value ?? 'null');
    if (v?.version === 1 && v.necessary === true && typeof v.analytics === 'boolean' && typeof v.advertising === 'boolean' && Number.isFinite(v.savedAt) && Date.now() - v.savedAt >= 0 && Date.now() - v.savedAt < 180 * 86400000) return v;
  } catch { /* Missing/corrupt consent is never permission. */ }
  return null;
}
export function readChoices(): Choices | null {
  try { return parseChoices(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}
export function createConsentStore(snapshot = false) {
  let current = snapshot ? null : readChoices();
  const listeners = new Set<() => void>();
  const notify = () => { for (const listener of listeners) listener(); };
  if (!snapshot) window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    current = readChoices();if(!current?.advertising)try{sessionStorage.removeItem(ATTRIBUTION_KEY)}catch{/* Optional storage. */}notify();
  });
  return {
    getSnapshot: () => current,
    getServerSnapshot: () => null,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    save: (analytics: boolean, advertising: boolean) => {
      performance.mark('gl:consent-save-start');
      current = { version: 1, necessary: true, analytics, advertising, savedAt: Date.now() };
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify(current)); } catch { /* Same in-memory choice remains usable. */ }
      if (!advertising) try { sessionStorage.removeItem(ATTRIBUTION_KEY); } catch { /* Optional storage. */ }
      notify();performance.mark('gl:consent-save-end'); return current;
    },
  };
}
