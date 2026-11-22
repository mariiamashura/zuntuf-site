/**
 * Orbit: concentric rings that follow the pointer. The pointer angle around the object sets --a;
 * each ring multiplies it by its own factor. A click gives it a spin that settles. rAF only while moving.
 */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<SVGSVGElement>('.rings--orbit').forEach((svg) => {
  if (!fine || calm) return;
  let target = 0, cur = 0, raf = 0, extra = 0;
  const loop = () => {
    cur += (target + extra - cur) * 0.07;
    svg.style.setProperty('--a', cur.toFixed(2));
    raf = Math.abs(target + extra - cur) > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (r.y + r.height / 2), e.clientX - (r.x + r.width / 2)) * 180 / Math.PI;
    target = a;
    kick();
  }, { passive: true });
  svg.style.cursor = 'grab';
  svg.addEventListener('click', () => { extra += 540; kick(); });
});
