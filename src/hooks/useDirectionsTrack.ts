import { useEffect, useRef, useState, type FocusEvent } from 'react';

type Mode = 'grid' | 'swipe' | 'sticky'; // grid = all cards fit in one fixed-width row
export function useDirectionsTrack(count: number) {
  const section = useRef<HTMLElement>(null), panel = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null);
  const [modeState, setModeState] = useState({ count, mode: 'grid' as Mode });
  if (modeState.count !== count) setModeState({ count, mode: 'grid' });
  const mode = modeState.count === count ? modeState.mode : 'grid';
  const [range, setRange] = useState({ first: 1, last: count, start: true, end: false });
  const metrics = useRef({ mode: 'grid' as Mode, distance: 0, top: 0, inset: 0, step: 0 });
  const focusedCard = useRef<HTMLElement | null>(null), pointerFocus = useRef(false);

  useEffect(() => {
    if (window.__GL_SSG__) return;
    const root = section.current!, inner = panel.current!, view = viewport.current!, row = track.current!;
    const header = document.querySelector<HTMLElement>('.gl-header');
    const motion = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(pointer: fine)');
    let frame = 0, measureFrame = 0, disposed = false, active = !('IntersectionObserver' in window), writtenX = -1;
    const writePosition = (x: number) => { view.scrollLeft = x; writtenX = view.scrollLeft; };
    const start = () => root.getBoundingClientRect().top + scrollY + metrics.current.inset - metrics.current.top;
    const clamp = (x: number) => Math.max(0, Math.min(metrics.current.distance, x));
    root.dataset.mode = 'grid'; delete root.dataset.trackReady; root.style.removeProperty('height');
    const update = () => {
      frame = 0;
      if (!active) return;
      const { mode: current, distance } = metrics.current;
      if (current === 'sticky') writePosition(clamp(scrollY - start()));
      if (current === 'swipe' && focusedCard.current) {
        const card = focusedCard.current;
        if (!card.contains(document.activeElement)) focusedCard.current = null;
        else {
          const focused = (document.activeElement as HTMLElement).getBoundingClientRect(), bounds = view.getBoundingClientRect();
          if (focused.left < bounds.left || focused.right > bounds.right) view.scrollLeft = clamp(card.offsetLeft);
        }
      }
      const cards = [...row.children] as HTMLElement[], origin = row.getBoundingClientRect().left - view.getBoundingClientRect().left + view.scrollLeft;
      const visible = cards.map((card, i) => ({ card, i })).filter(({ card }) => origin + card.offsetLeft + card.offsetWidth > view.scrollLeft + 6 && origin + card.offsetLeft < view.scrollLeft + view.clientWidth - 6);
      const next = { first: (visible[0]?.i ?? 0) + 1, last: (visible.at(-1)?.i ?? count - 1) + 1, start: view.scrollLeft < 2, end: view.scrollLeft >= distance - 2 };
      setRange(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      measureFrame = 0;
      if (disposed || !active) return;
      const old = metrics.current, oldStart = start(), oldX = view.scrollLeft;
      const inside = old.mode === 'sticky' && scrollY >= oldStart - 1 && scrollY <= oldStart + old.distance + 1;
      const activeCard = document.activeElement?.closest('.directions__card');
      const anchor = activeCard && row.contains(activeCard) ? [...row.children].indexOf(activeCard) : old.step ? oldX / old.step : 0;
      const top = (header?.getBoundingClientRect().height ?? 0) + 12;
      root.style.setProperty('--directions-top', `${top}px`);
      root.dataset.mode = 'swipe'; root.style.removeProperty('height');
      const distance = Math.max(0, view.scrollWidth - view.clientWidth);
      const cards = [...row.children] as HTMLElement[];
      const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0]?.offsetWidth ?? 0;
      const fitsHeight = inner.offsetHeight + top + 24 <= innerHeight;
      const normalText = parseFloat(getComputedStyle(document.documentElement).fontSize) <= 20;
      // Fit/overflow is entirely geometric. Sticky is only an enhancement when
      // two full desktop cards and the complete panel genuinely fit the viewport.
      const next: Mode = distance < 1 ? 'grid' : fine.matches && view.clientWidth >= step + (cards[0]?.offsetWidth ?? 0) && fitsHeight && normalText && !motion.matches ? 'sticky' : 'swipe';
      root.dataset.mode = next; root.dataset.trackReady = 'true';
      const style = getComputedStyle(root), inset = parseFloat(style.paddingTop);
      metrics.current = { mode: next, distance, top, inset, step };
      if (next === 'sticky') root.style.height = `${inner.offsetHeight + distance + inset + parseFloat(style.paddingBottom)}px`;
      const x = next === 'grid' ? 0 : clamp(anchor * step);
      if (inside) window.scrollTo({ top: start() + (next === 'sticky' ? x : 0), behavior: 'instant' });
      writePosition(x);
      setModeState(previous => previous.count === count && previous.mode === next ? previous : { count, mode: next });
      schedule();
    };
    const queueMeasure = () => { if (active && !disposed && !measureFrame) measureFrame = requestAnimationFrame(measure); };
    const visibility = active ? undefined : new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { active = true; visibility?.disconnect(); queueMeasure(); }
    }, { rootMargin: '160px 0px' });
    visibility?.observe(root);
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(inner); observer.observe(view); observer.observe(row); if (header) observer.observe(header);
    document.fonts.ready.then(queueMeasure); document.fonts.addEventListener('loadingdone', queueMeasure);
    root.addEventListener('load', queueMeasure, true); addEventListener('resize', queueMeasure);
    addEventListener('scroll', schedule, { passive: true });
    // Native horizontal input and vertical sticky progress drive the SAME DOM
    // scrollLeft; mirror an actual horizontal change to document progress.
    const horizontal = () => {
      // A queued scroll event from our last write is an echo, even when the
      // document's smooth scroll has already advanced to its next frame.
      if (metrics.current.mode === 'sticky' && Math.abs(view.scrollLeft - writtenX) > 1 && Math.abs(view.scrollLeft - clamp(scrollY - start())) > 1)
        window.scrollTo({ top: start() + view.scrollLeft, behavior: 'instant' });
      schedule();
    };
    view.addEventListener('scroll', horizontal, { passive: true });
    const releaseFocus = () => { focusedCard.current = null; };
    const pointerDown = () => { releaseFocus(); pointerFocus.current = true; };
    const pointerUp = () => { pointerFocus.current = false; };
    view.addEventListener('pointerdown', pointerDown, { passive: true }); view.addEventListener('wheel', releaseFocus, { passive: true });
    addEventListener('pointerup', pointerUp, { passive: true }); addEventListener('pointercancel', pointerUp, { passive: true });
    motion.addEventListener('change', queueMeasure); fine.addEventListener('change', queueMeasure); measure();
    return () => {
      disposed = true; visibility?.disconnect(); observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(measureFrame);
      document.fonts.removeEventListener('loadingdone', queueMeasure); root.removeEventListener('load', queueMeasure, true);
      removeEventListener('resize', queueMeasure); removeEventListener('scroll', schedule); view.removeEventListener('scroll', horizontal);
      view.removeEventListener('pointerdown', pointerDown); view.removeEventListener('wheel', releaseFocus);
      removeEventListener('pointerup', pointerUp); removeEventListener('pointercancel', pointerUp);
      motion.removeEventListener('change', queueMeasure); fine.removeEventListener('change', queueMeasure);
    };
  }, [count]);

  const reveal = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const card = track.current?.children[Math.max(0, Math.min(count - 1, index))] as HTMLElement | undefined;
    if (!card || !viewport.current || !section.current) return;
    const { mode: current, distance, top, inset } = metrics.current, offset = Math.min(distance, card.offsetLeft);
    const actualBehavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior;
    if (current === 'sticky') window.scrollTo({ top: section.current.getBoundingClientRect().top + scrollY + inset - top + offset, behavior: actualBehavior });
    else if (current === 'swipe') viewport.current.scrollTo({ left: offset, behavior: actualBehavior });
  };
  const move = (direction: number) => {
    const view = viewport.current!, root = section.current!, { mode: current, distance, top, inset, step } = metrics.current;
    const offset = Math.max(0, Math.min(distance, view.scrollLeft + direction * step));
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (current === 'sticky') window.scrollTo({ top: root.getBoundingClientRect().top + scrollY + inset - top + offset, behavior });
    else view.scrollTo({ left: offset, behavior });
  };
  const onFocusCapture = (event: FocusEvent) => {
    if (pointerFocus.current) return;
    const card = (event.target as HTMLElement).closest<HTMLElement>('.directions__card');
    if (!card || metrics.current.mode === 'grid') return;
    focusedCard.current = card;
    reveal([...track.current!.children].indexOf(card), 'instant');
    if (metrics.current.mode === 'swipe') {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const delta = rect.top < metrics.current.top ? rect.top - metrics.current.top : Math.max(0, rect.bottom - innerHeight + 112);
      if (delta) window.scrollBy({ top: delta, behavior: 'instant' });
    }
  };
  const skip = () => {
    const next = document.getElementById('formats'); if (!next) return;
    next.tabIndex = -1; next.focus({ preventScroll: true });
    window.scrollTo({ top: next.getBoundingClientRect().top + scrollY - metrics.current.top, behavior: 'instant' });
  };
  return { section, panel, viewport, track, mode, range, reveal, move, onFocusCapture, skip };
}
