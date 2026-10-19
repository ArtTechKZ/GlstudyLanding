import snapshot from './content-snapshot.json';
export const CONTENT=snapshot.data;
export const CONTENT_REVISION=snapshot.revision;
export interface ContentMedia {id:string;type:'image'|'video';src:string;thumbnail?:string;srcSet?:string;poster?:string;width:number;height:number;alt:Record<string,string>;caption:Record<string,string>;section:string;order:number;credit?:string;rightsSource:string;muted?:boolean;transcript?:Record<string,string>}
export const CONTENT_MEDIA=snapshot.data.media as ContentMedia[];
