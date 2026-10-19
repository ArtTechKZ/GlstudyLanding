import postcss from 'postcss';
// Stable component scope at every viewport, not a Lighthouse-specific subset.
// Remaining CSS is still served immediately, with a noJS stylesheet fallback.
export function firstScreenCss(css) {
 const root=postcss.parse(css);
 root.walkRules(rule=>{
  if(rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
  const keep=rule.selectors.some(selector=>/^(?:[a-z][\w-]*(?:$|[:[ >+~])|\*|:root|\[hidden\]|\.container\b|\.btn(?:[-:\s.]|$)|\.section\b|\.sr-only\b|\.skip-link\b|\.gl-header|\.demo-banner|\.hero|\.directions|\.study-|\.footer|\.gl-bg-pattern)/i.test(selector.trim()));
  if(!keep)rule.remove();
 });
 root.walkAtRules(rule=>{if(rule.nodes?.length===0)rule.remove()});
 return root.toString();
}
