// GitHub Pages returns this one file for every unknown URL. Keep its HTTP 404
// and choose the matching pre-rendered snapshot synchronously before first paint.
// Known /kk/404.html and /en/404.html are independent no-JavaScript documents.
export function createLocalized404(snapshots,base){
 const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
 const head=`<style data-gl-404-pending>html[data-gl-404-pending] #root{visibility:hidden}</style><script data-gl-404-locale>{const p=location.pathname.slice(${base.length}),first=p.split('/')[0],l=['kk','en'].includes(first)?first:undefined;if(l)document.documentElement.dataset.gl404Pending=l}</script>`;
 const templates=['kk','en'].map(locale=>`<template id="gl-404-${locale}">${snapshots[locale].root}</template>`).join('');
 const data=Object.fromEntries(['kk','en'].map(locale=>[locale,{head:snapshots[locale].head,labels:snapshots[locale].labels,connect:snapshots[locale].connect}]));
 const select=`<script data-gl-404-select>{const l=document.documentElement.dataset.gl404Pending;if(l){const data=${json(data)}[l],root=document.getElementById('root');root.replaceChildren(document.getElementById('gl-404-'+l).content.cloneNode(true));document.documentElement.lang=l;document.title=data.head.title;for(const meta of data.head.meta){const key=meta.name?'name':'property',el=document.head.querySelector('meta['+key+'="'+meta[key]+'"]');if(el)el.content=meta.content}document.querySelector('link[rel=canonical]').href=data.head.canonical;window.__GL_EARLY_LABELS__=data.labels;window.__GL_CONNECT_LABELS__=data.connect;window.__GL_EARLY__?.setLabels(data.labels);delete document.documentElement.dataset.gl404Pending}document.querySelector('[data-gl-404-pending]')?.remove();document.querySelectorAll('template[id^=gl-404-]').forEach(el=>el.remove())}</script>`;
 // No script can inspect an unknown request path. A neutral 404 and language
 // choices avoid presenting Russian prose as an English/Kazakh page.
 const nojs=`<noscript><style>#root{display:none}</style><main style="font:700 1.25rem Inter,sans-serif;padding:2rem"><h1>404</h1><nav aria-label="404"><a href="${base}" lang="ru">RU</a> · <a href="${base}kk/404.html" lang="kk">ҚАЗ</a> · <a href="${base}en/404.html" lang="en">EN</a></nav></main></noscript>`;

 return snapshots.ru.html.replace('</head>',head+'</head>').replace('</body>',templates+select+nojs+'</body>');
}
