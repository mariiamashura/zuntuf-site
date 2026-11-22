/** The face: spirals follow the pointer; a click blinks and sends the face back into the dark to be lit again. */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<SVGSVGElement>('[data-face]').forEach((svg) => {
  if (!fine) return;
  let raf = 0, ex = 0, ey = 0, tx = 0, ty = 0;
  const apply = () => {
    ex += (tx - ex) * 0.2; ey += (ty - ey) * 0.2;
    svg.style.setProperty('--ex', ex.toFixed(1));
    svg.style.setProperty('--ey', ey.toFixed(1));
    raf = Math.abs(tx - ex) + Math.abs(ty - ey) > 0.2 ? requestAnimationFrame(apply) : 0;
  };
  addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.x + r.width / 2), dy = e.clientY - (r.y + r.height * 0.34);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 400) * 11; // spirals travel up to 11 units
    tx = (dx / d) * k; ty = (dy / d) * k;
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });

  svg.addEventListener('click', () => {
    svg.classList.add('is-blink');
    setTimeout(() => svg.classList.remove('is-blink'), 160);
    if (calm) return;
    const wrap = svg.closest<HTMLElement>('[data-emerge]');
    if (!wrap) return;
    wrap.classList.remove('is-emerging');
    void wrap.offsetWidth; // restart the animations
    wrap.classList.add('is-emerging');
  });
});
