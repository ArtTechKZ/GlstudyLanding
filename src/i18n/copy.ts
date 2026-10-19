import {useMemo} from 'react';
import {useUi} from './context';
import {ru} from './ru';
import type {Translator} from './core';
const normalized=(value:string)=>value.replace(/\u00ad/g,'');
const sourceKeys=new Map<string,keyof typeof ru>(Object.entries(ru).map(([key,value])=>[value,key as keyof typeof ru]));
const normalizedKeys=new Map([...sourceKeys].map(([value,key])=>[normalized(value),key]));
export function createCopy(t:Translator){return function copy<T>(value:T):T {
 if(typeof value!=='string')return value;
 const key=sourceKeys.get(value)??normalizedKeys.get(normalized(value));
 if(!key&&t.locale!=='ru'&&value===value.toUpperCase()){const entry=[...sourceKeys].find(([text])=>text.toUpperCase()===value);if(entry)return t(entry[1],{} as never).toLocaleUpperCase(t.locale) as T;}
 // Data not in the approved catalog remains its Russian source; never a key.
 if(!key)return value;const translated=t(key,{} as never);return (translated===ru[key]?value:translated) as T;
}}
export function useCopy(){const t=useUi();return useMemo(()=>createCopy(t),[t]);}
