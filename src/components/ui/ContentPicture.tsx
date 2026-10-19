import {useUi} from '../../i18n';import {CONTENT_MEDIA} from '../../data/content';import {sitePath} from '../../utils/sitePath';
export function ContentPicture({section,className,loading='lazy',sizes='(max-width: 767px) 90vw, 640px'}:{section:string;className?:string;loading?:'lazy'|'eager';sizes?:string}){
 const t=useUi(),photo=CONTENT_MEDIA.find(p=>p.type==='image'&&p.section.split(' ').includes(section));if(!photo)return null;
 const srcSet=photo.srcSet?.split(',').map(part=>{const [url,width]=part.trim().split(/\s+/);return sitePath(url)+' '+width}).join(', ');
 return <img src={sitePath(photo.src)} srcSet={srcSet} sizes={sizes} width={photo.width} height={photo.height} alt={photo.alt[t.locale??'ru']??photo.alt.ru} className={className} loading={loading} decoding="async" fetchPriority={loading==='eager'?'high':'auto'}/>;
}
