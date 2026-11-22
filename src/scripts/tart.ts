/** Tool illustration: a gentle pointer tilt and a fast spin of the spirals on click. rAF only while moving. */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-tart]').forEach((art) => {
  const tilt = art.querySelector<HTMLElement>('.tart__tilt');
  if (!tilt) return;

  art.addEventListener('click', () => {
    if (calm) return;
    art.classList.add('is-spin');
    setTimeout(() => art.classList.remove('is-spin'), 2400);
  });

  if (!fine || calm) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const step = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    tilt.style.setProperty('--rx', `${(-cy * 6).toFixed(2)}deg`);
    tilt.style.setProperty('--ry', `${(cx * 7).toFixed(2)}deg`);
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(step) : 0;
  };
  addEventListener('pointermove', (e) => {
    const r = art.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.x + r.width / 2)) / (innerWidth * 0.5)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.y + r.height / 2)) / (innerHeight * 0.5)));
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
});
