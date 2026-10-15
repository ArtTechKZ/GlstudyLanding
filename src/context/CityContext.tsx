import { useState, useCallback, type ReactNode } from 'react';
import { DEMO_CITIES } from '../data/demo';
import type { City } from '../types';
import { CityContext } from './cityContextDef';

const STORAGE_KEY = 'gl_study_selected_city';

function getInitialCity(): City {
  const defaultCity = DEMO_CITIES.find(c => c.isDefault) ?? DEMO_CITIES[0];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCityId = window.localStorage.getItem(STORAGE_KEY);
      if (savedCityId) {
        const found = DEMO_CITIES.find(c => c.id === savedCityId);
        if (found) {
          return found;
        }
      }
    }
  } catch {
    // Ignore storage read errors (e.g. sandboxed iframe or private browsing)
  }
  return defaultCity;
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<City>(getInitialCity);

  const selectCity = useCallback((cityId: string) => {
    const city = DEMO_CITIES.find(c => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, city.id);
        }
      } catch {
        // Ignore storage write errors
      }
    }
  }, []);

  const activeBranch = selectedCity.branches.find(b => b.status === 'active');

  return (
    <CityContext.Provider value={{ cities: DEMO_CITIES, selectedCity, selectCity, activeBranch }}>
      {children}
    </CityContext.Provider>
  );
}
