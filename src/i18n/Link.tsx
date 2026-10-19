import {CONTENT} from '../data/content';
import {Link as RouterLink,type LinkProps} from 'react-router-dom';
import {useLocale} from './locale-context';
import {localizedPath} from '../config/locale-routes.js';
export function Link({to,...props}:LinkProps){
 const {locale}=useLocale();
 if(typeof to==='string'&&(CONTENT.hiddenRoutes as string[]).includes(to.split(/[?#]/)[0]))return null;
 const localized=typeof to==='string'&&to.startsWith('/')?localizedPath(to,locale):typeof to==='object'&&to.pathname?.startsWith('/')?{...to,pathname:localizedPath(to.pathname,locale)}:to;
 return <RouterLink {...props} to={localized}/>;
}
