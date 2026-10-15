import { useContext } from 'react';
import { CityContext, type CityContextValue } from '../context/cityContextDef';

export function useCityContext(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCityContext must be used within CityProvider');
  return ctx;
}

export { CityProvider } from '../context/CityContext';
export type { CityContextValue };
