import { useClientReady } from './clientReady';
import { useState, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {resolveCitySelection,cityDestination} from './city-selection';
import { DEMO_CITIES } from '../data/demo';
import type { City } from '../types';
import { CityContext } from './cityContextDef';
export function CityProvider({ children, cities = DEMO_CITIES }: { children: ReactNode; cities?: City[] }) {
  const ready = useClientReady();
  const location = useLocation(), navigate = useNavigate();
  const [saved, setSaved] = useState(() => {
    let city = (cities.find(c => c.isDefault) ?? cities[0]).id, branch = '';
    if (ready && !window.__GL_SSG__) try { const id = localStorage.getItem('gl_study_selected_city'); if (cities.some(c => c.id === id)) { city = id!; branch = localStorage.getItem('gl_study_selected_branch') ?? ''; } } catch { /* Essential preferences also work in memory. */ }
    const query = new URLSearchParams(ready ? location.search : ''), explicit = cities.find(c => c.id === query.get('city')) ?? (!query.has('city') ? cities.find(c => c.branches.some(b => b.id === query.get('branch'))) : undefined);
    if (explicit) { city = explicit.id; branch = query.get('branch') ?? ''; }
    return { city, branch, key: location.key, restored: ready };
  });
  // Keep the hydration render identical to SSG, then restore remembered values
  // before committing the live selection. URL parameters still take precedence.
  if (ready && !saved.restored) {
    let city = saved.city, branch = '';
    try { const id = localStorage.getItem('gl_study_selected_city'); if (cities.some(c => c.id === id)) { city = id!; branch = localStorage.getItem('gl_study_selected_branch') ?? ''; } } catch { /* in-memory fallback */ }
    setSaved({ city, branch, key: location.key, restored: true });
  }
  const {selectedCity,activeBranch}=resolveCitySelection(cities,location.pathname,ready?location.search:'',saved);
  // Remember the resolved selection for subsequent links without location parameters.
  if (saved.key !== location.key) setSaved({ city: selectedCity.id, branch: activeBranch?.id ?? '', key: location.key, restored: true });
  useEffect(() => {
    if (!ready || window.__GL_SSG__) return;
    try { localStorage.setItem('gl_study_selected_city', selectedCity.id); localStorage.setItem('gl_study_selected_branch', activeBranch?.id ?? ''); } catch { /* In-memory fallback. */ }
  }, [ready, selectedCity.id, activeBranch?.id]);
  function choose(cityId: string, branchId = '') {
    const city = cities.find(c => c.id === cityId); if (!city) return;
    setSaved({ city: city.id, branch: branchId, key: location.key, restored: true });
    navigate(cityDestination({...location,search:ready?location.search:''},city,branchId));
  }
  return <CityContext.Provider value={{ cities, selectedCity, activeBranch, availablePrograms: activeBranch?.programs, selectCity: id => choose(id), selectBranch: id => choose(selectedCity.id, id) }}>{children}</CityContext.Provider>;
}
