import {createContext,useContext} from 'react';
// A production SSG page hydrates the deterministic snapshot first. Preferences
// are restored immediately after that commit; dev/isolated fixtures stay live.
export const ClientReadyContext=createContext(true);
export const useClientReady=()=>useContext(ClientReadyContext);
