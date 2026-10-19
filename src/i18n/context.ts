import {createContext,useContext} from 'react';
import {t} from './core';
export const UiContext = createContext(t);
export const useUi = () => useContext(UiContext);
