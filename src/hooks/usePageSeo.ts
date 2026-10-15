import { useEffect } from 'react';
import type { SeoMeta } from '../types';

export function usePageSeo(meta?: SeoMeta) {
  useEffect(() => {
    if (!meta) return;

    if (meta.title) {
      document.title = meta.title;
    }

    if (meta.description) {
      let descEl = document.querySelector('meta[name="description"]');
      if (!descEl) {
        descEl = document.createElement('meta');
        descEl.setAttribute('name', 'description');
        document.head.appendChild(descEl);
      }
      descEl.setAttribute('content', meta.description);
    }

    // OpenGraph title & description
    if (meta.title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', meta.title);
    }

    if (meta.description) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', meta.description);
    }
  }, [meta]);
}
