import { createContext } from 'react';
import type { City, Branch } from '../types';

export interface CityContextValue {
  cities: City[];
  selectedCity: City;
  selectCity: (cityId: string) => void;
  activeBranch: Branch | undefined;
  selectBranch: (branchId: string) => void;
  availablePrograms: string[] | undefined;
}

export const CityContext = createContext<CityContextValue | null>(null);
