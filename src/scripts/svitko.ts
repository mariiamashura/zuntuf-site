/** Svitko: the eyes follow the pointer; a click makes it blink. */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<SVGSVGElement>('[data-svitko]').forEach((svg) => {
  svg.addEventListener('click', () => {
    svg.classList.add('is-blink');
    setTimeout(() => svg.classList.remove('is-blink'), 170);
  });
  if (!fine || calm) return;
  const eyes = Array.from(svg.querySelectorAll<SVGGElement>('.svitko__eye'));
  let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
  const step = () => {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    eyes.forEach((e) => { e.style.setProperty('--ex', cx.toFixed(1)); e.style.setProperty('--ey', cy.toFixed(1)); });
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.15 ? requestAnimationFrame(step) : 0;
  };
  addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.x + r.width / 2), dy = e.clientY - (r.y + r.height * 0.62);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 350) * 7; // pupils travel up to 7 units
    tx = (dx / d) * k; ty = (dy / d) * k;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
});
