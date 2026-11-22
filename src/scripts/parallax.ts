/** Pointer parallax: children with data-depth drift against the pointer. rAF runs only while moving. */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !calm) {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (roots.length) {
    const layers = roots.flatMap((r) => Array.from(r.querySelectorAll<HTMLElement | SVGElement>('[data-depth]')));
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const range = 34;
    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      for (const el of layers) {
        const d = Number((el as HTMLElement).dataset.depth || 0);
        (el as HTMLElement).style.translate = `${(cx * d * range).toFixed(1)}px ${(cy * d * range).toFixed(1)}px`;
      }
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }
}
