import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCityContext } from './useCityContext';
import type { SeoMeta } from '../types';
import { applyPageSeo } from '../utils/pageSeo';
export function usePageSeo(meta?:SeoMeta) {
 const {pathname}=useLocation(),{selectedCity,activeBranch}=useCityContext();
 useEffect(()=>{if(!window.__GL_SSG__)return applyPageSeo(pathname,meta,document)},[pathname,meta,selectedCity.id,activeBranch?.id]);
}
