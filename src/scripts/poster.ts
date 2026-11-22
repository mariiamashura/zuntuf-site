/** App page arrival: the selected ray (from the wheel) becomes the coloured panel, the hub becomes the rings. */

type Box = { x: number; y: number; w: number; h: number };
type Handoff = { t: number; slug: string; fill: string; ray: Box; hub: Box };

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function flip(el: Element, from: Box, fill?: string) {
  const to = el.getBoundingClientRect();
  if (!to.width || !to.height || !from.w || !from.h) return;
  const dx = from.x + from.w / 2 - (to.x + to.width / 2);
  const dy = from.y + from.h / 2 - (to.y + to.height / 2);
  const kf: Keyframe[] = [
    { transform: `translate(${dx}px, ${dy}px) scale(${from.w / to.width}, ${from.h / to.height})`, ...(fill ? { backgroundColor: fill } : {}) },
    { transform: 'none', ...(fill ? { backgroundColor: getComputedStyle(el).backgroundColor } : {}) },
  ];
  el.animate(kf, { duration: 650, easing: 'cubic-bezier(.2,.85,.25,1)', fill: 'backwards' });
}

/** Elements that count as "empty background": layout containers, not text, controls or artwork. */
function isBackground(t: EventTarget | null): boolean {
  if (!(t instanceof Element)) return false;
  if (['HTML', 'BODY', 'MAIN', 'ARTICLE', 'SECTION', 'HEADER', 'FOOTER', 'UL', 'DL'].includes(t.tagName)) return true;
  return t.tagName === 'DIV' && !t.closest('.panel, .shot, .dl, .gallery');
}

export function initPoster(root: HTMLElement): void {
  const back = root.querySelector<HTMLAnchorElement>('[data-rebuild]');
  let leaving = false;
  // Back to the wheel: the poster steps aside, the wheel rebuilds itself on arrival.
  const goBack = () => {
    if (leaving || !back) return;
    leaving = true;
    try { sessionStorage.setItem('zuntuf-rebuild', '1'); } catch {}
    root.classList.add('is-leaving');
    setTimeout(() => { location.href = back.href; }, reduceMotion() ? 0 : 220);
  };
  back?.addEventListener('click', (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    goBack();
  });
  // Click on empty background (not text, links or shapes) or Esc: return to the starting position.
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (window.getSelection()?.toString()) return; // user is selecting text
    if (isBackground(e.target)) goBack();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') goBack(); });

  if (reduceMotion()) return;
  let h: Handoff | null = null;
  try {
    const raw = sessionStorage.getItem('zuntuf-handoff');
    sessionStorage.removeItem('zuntuf-handoff');
    if (raw) h = JSON.parse(raw);
  } catch {}
  if (!h || h.slug !== root.dataset.slug || Date.now() - h.t > 6000) return;

  const panel = root.querySelector('[data-flip="panel"]');
  const rings = root.querySelector('.poster__rings');
  if (panel) flip(panel, h.ray, h.fill);
  if (rings) flip(rings, h.hub);
}
