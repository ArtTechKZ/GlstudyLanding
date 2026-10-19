export function canonical(value:unknown):string;
export function contentHash(value:unknown):string;
export function validateSnapshot(value:unknown):unknown;
export function safePublicUrl(value:unknown,options?:{media?:boolean}):boolean;
export function publicFields(value:unknown,allowed:string[]):Record<string,unknown>;
export const fields:Record<string,string[]>;
