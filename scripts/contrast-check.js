import fs from 'node:fs';

// Focused solid-background checks for the selected site elements, not a WCAG audit.
export async function measureContrast(page, item) {
  const measurements = await page.locator(item.selector).evaluateAll((elements, options) => {
    const parse = value => {
      const match = value.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
      return match ? [...match.slice(1, 4).map(Number), Number(match[4] ?? 1)] : null;
    };
    const over = (top, bottom) => {
      const alpha = top[3] + bottom[3] * (1 - top[3]);
      return alpha ? [0, 1, 2].map(i => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / alpha).concat(alpha) : [0, 0, 0, 0];
    };
    const luminance = color => color.slice(0, 3).map(c => c / 255)
      .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    return elements.map((element, index) => {
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const isLarge = size >= 24 || (size >= 56 / 3 && Number(style.fontWeight) >= 700);
      const threshold = options.isBorder || isLarge ? 3 : 4.5;
      const result = { index, text: element.textContent.trim().slice(0, 100), fontSize: style.fontSize,
        fontWeight: style.fontWeight, isLarge, threshold, status: 'MANUAL REVIEW' };
      if (!element.getClientRects().length || style.visibility !== 'visible') {
        return { ...result, reason: 'Element is hidden at this viewport' };
      }
      // An ancestor opacity/filter changes the composited group. Do not guess it.
      for (let node = element; node; node = node.parentElement) {
        const s = getComputedStyle(node);
        if ((node !== element && Number(s.opacity) !== 1) || s.filter !== 'none' || s.mixBlendMode !== 'normal') {
          return { ...result, reason: 'Ancestor opacity, filter or blend mode needs manual review' };
        }
        for (const pseudo of ['::before', '::after']) {
          const p = getComputedStyle(node, pseudo);
          if (p.content !== 'none' && p.content !== 'normal' && p.display !== 'none' &&
              (p.backgroundImage !== 'none' || (parse(p.backgroundColor)?.[3] ?? 0) > 0)) {
            return { ...result, reason: 'Painted pseudo-element needs manual review' };
          }
        }
      }
      const layers = [];
      for (let node = element; node; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.backgroundImage !== 'none') return { ...result, reason: 'Gradient or image background' };
        const bg = parse(s.backgroundColor);
        if (!bg) return { ...result, reason: 'Unsupported background color' };
        layers.push(bg);
        if (bg[3] === 1) break;
      }
      if (layers.at(-1)?.[3] !== 1) return { ...result, reason: 'No proven opaque background' };
      let background = layers.pop();
      while (layers.length) background = over(layers.pop(), background);
      const foreground = parse(options.isBorder ? style.borderTopColor : options.isPlaceholder ? getComputedStyle(element, '::placeholder').color : style.color);
      if (!foreground) return { ...result, reason: 'Unsupported foreground color' };
      if (Number(style.opacity) !== 1 && parse(style.backgroundColor)?.[3] !== 0) {
        return { ...result, reason: 'Element group opacity with painted background' };
      }
      foreground[3] *= Number(style.opacity);
      const effective = over(foreground, background);
      const a = luminance(effective), b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      return { ...result, color: style.color, background, ratio, status: ratio >= threshold ? 'PASS' : 'FAIL' };
    });
  }, { isBorder: !!item.isBorder, isPlaceholder: !!item.isPlaceholder });
  if (!measurements.length) {
    return [{ ...item, status: 'FAIL', reason: 'Required selector did not match any element' }];
  }
  return measurements.map(measurement => ({ ...item, ...measurement }));
}

export function auditExitCode(results) {
  if (results.some(result => result.status === 'FAIL' && result.required !== false)) return 1;
  return results.some(result => result.status === 'MANUAL REVIEW' && result.required !== false) ? 2 : 0;
}

export function auditSummary(results) {
  const counts = ['PASS', 'FAIL', 'MANUAL REVIEW'].map(status => `${status}=${results.filter(r => r.status === status).length}`).join(', ');
  return `${auditExitCode(results) === 0 ? 'Checks passed' : 'Checks did not pass'}: ${counts}`;
}

export function saveAudit(file, results) {
  fs.writeFileSync(file, JSON.stringify(results, null, 2) + '\n');
  console.log(auditSummary(results));
  process.exitCode = auditExitCode(results);
}
